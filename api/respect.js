const { DISCORD_USER_ID, getUsers, getWebhookUrl } = require("../server/config");
const { chooseMessage } = require("../server/messages");

const cooldowns = new Map();
const COOLDOWN_MS = 15_000;

function isSameOrigin(request) {
  const origin = request.headers.origin;
  const requestHost = request.headers.host;
  if (!origin || !requestHost) return false;

  try {
    return new URL(origin).host.toLowerCase() === requestHost.split(",")[0].trim().toLowerCase();
  } catch {
    return false;
  }
}

function respondMethodNotAllowed(response) {
  response.setHeader("Allow", "POST");
  return response.status(405).json({ error: "Method not allowed." });
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "POST") return respondMethodNotAllowed(response);
  if (!isSameOrigin(request)) return response.status(403).json({ error: "Request not allowed." });

  const userId = typeof request.body?.userId === "string" ? request.body.userId : "";
  if (!DISCORD_USER_ID.test(userId)) return response.status(400).json({ error: "Choose someone from the list." });

  let users;
  let webhookUrl;
  try {
    users = getUsers();
    webhookUrl = getWebhookUrl();
  } catch {
    return response.status(503).json({ error: "Respect is temporarily unavailable." });
  }

  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return response.status(400).json({ error: "Choose someone from the list." });

  const now = Date.now();
  const allowedAt = cooldowns.get(userId) || 0;
  if (allowedAt > now) {
    return response.status(429).json({ retryAfter: Math.ceil((allowedAt - now) / 1000) });
  }
  cooldowns.set(userId, now + COOLDOWN_MS);

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `<@${user.id}> ${chooseMessage()}`,
        allowed_mentions: { parse: [], users: [user.id], roles: [], replied_user: false },
      }),
    });

    if (!discordResponse.ok) {
      cooldowns.delete(userId);
      return response.status(502).json({ error: "Discord couldn’t receive that just now. Try again soon." });
    }

    return response.status(200).json({ ok: true });
  } catch {
    cooldowns.delete(userId);
    return response.status(502).json({ error: "Couldn’t send right now. Try again in a moment." });
  }
};
