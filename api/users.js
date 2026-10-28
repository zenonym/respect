const { getUsers } = require("../server/config");

module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    return response.status(200).json({ users: getUsers() });
  } catch {
    return response.status(503).json({ error: "The recipient list isn’t configured yet." });
  }
};
