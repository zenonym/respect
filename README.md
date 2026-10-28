# respect

A tiny appreciation app: choose someone, press **respect**, and the server posts a Discord mention with one randomly selected note. The note pool stays on the server and is never returned to the page.

## Set it up

1. Import this repository into [Vercel](https://vercel.com/new). Vercel serves the static page and runs the files in `api/` as serverless functions.
2. In the Vercel project settings, add these environment variables for Production (and Preview if you want preview deployments to work):

   - `DISCORD_WEBHOOK_URL`: the webhook URL copied from your Discord server’s **Server Settings → Integrations → Webhooks**.
   - `RESPECT_USERS`: a JSON array of the people who can appear in the dropdown. Each entry needs a Discord user ID and a display name, for example:

     ```json
     [{"id":"123456789012345678","name":"Alex"},{"id":"234567890123456789","name":"Sam"}]
     ```

3. Redeploy after adding the variables. To find a Discord user ID, enable Developer Mode in Discord and choose **Copy User ID** on that person’s profile or context menu.

The webhook URL and message pool are never sent to the browser. The endpoint only accepts IDs from `RESPECT_USERS`, restricts mentions to that one user, checks same-origin browser requests, and applies a short in-memory cooldown per user. The cooldown is best-effort per running function instance; add persistent rate limiting or access protection if you make the site public to a large audience.

## Local preview

Install the Vercel CLI, copy `.env.example` to `.env`, replace the example webhook and user values, then run `vercel dev` from this folder.

## Files

- `index.html`, `styles.css`, `app.js`: the small web page.
- `api/users.js`: provides the configured dropdown options.
- `api/respect.js`: chooses a hidden note and sends the Discord webhook.
- `server/messages.js`: the server-only message pool.
