const form = document.querySelector("#respect-form");
const recipient = document.querySelector("#recipient");
const button = document.querySelector("#respect-button");
const feedback = document.querySelector("#feedback");

function setFeedback(message, state = "") {
  feedback.textContent = message;
  feedback.dataset.state = state;
}

async function loadRecipients() {
  try {
    const response = await fetch("/api/users", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Unable to load recipients");

    const { users } = await response.json();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("No recipients are configured");
    }

    recipient.replaceChildren(new Option("Choose someone…", ""));
    for (const user of users) {
      recipient.add(new Option(user.name, user.id));
    }
    recipient.disabled = false;
    button.disabled = false;
  } catch {
    recipient.replaceChildren(new Option("People aren’t available right now", ""));
    setFeedback("Please try again in a little while.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!recipient.value || button.disabled) return;

  button.disabled = true;
  recipient.disabled = true;
  setFeedback("Sending a little respect…");

  try {
    const response = await fetch("/api/respect", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ userId: recipient.value }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429) throw new Error("Give it a few seconds, then try again.");
      throw new Error(result.error || "Couldn’t send right now. Try again in a moment.");
    }

    setFeedback("A little respect is on its way.", "success");
  } catch (error) {
    setFeedback(error.message || "Couldn’t send right now. Try again in a moment.", "error");
  } finally {
    recipient.disabled = false;
    button.disabled = false;
  }
});

loadRecipients();
