const DISCORD_USER_ID = /^\d{17,20}$/;

function getUsers() {
  const rawUsers = process.env.RESPECT_USERS;
  if (!rawUsers) throw new Error("RESPECT_USERS is not configured");

  let users;
  try {
    users = JSON.parse(rawUsers);
  } catch {
    throw new Error("RESPECT_USERS must be valid JSON");
  }

  if (!Array.isArray(users) || users.length === 0 || users.length > 100) {
    throw new Error("RESPECT_USERS must contain between 1 and 100 users");
  }

  const seenIds = new Set();
  return users.map((user) => {
    const id = typeof user?.id === "string" ? user.id.trim() : "";
    const name = typeof user?.name === "string" ? user.name.trim() : "";
    if (!DISCORD_USER_ID.test(id) || !name || name.length > 60 || seenIds.has(id)) {
      throw new Error("RESPECT_USERS contains an invalid or duplicate entry");
    }
    seenIds.add(id);
    return { id, name };
  });
}

function getWebhookUrl() {
  const rawUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!rawUrl) throw new Error("DISCORD_WEBHOOK_URL is not configured");

  let webhookUrl;
  try {
    webhookUrl = new URL(rawUrl);
  } catch {
    throw new Error("DISCORD_WEBHOOK_URL is invalid");
  }

  if (
    webhookUrl.protocol !== "https:" ||
    webhookUrl.hostname !== "discord.com" ||
    !/^\/api\/webhooks\/\d{17,20}\/[A-Za-z\d._-]+$/.test(webhookUrl.pathname)
  ) {
    throw new Error("DISCORD_WEBHOOK_URL must be a Discord webhook URL");
  }

  return webhookUrl.toString();
}

module.exports = { DISCORD_USER_ID, getUsers, getWebhookUrl };
