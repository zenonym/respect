// This list stays server-side so the surprise is never included in page data or API responses.
const messages = [
  "You make the difficult things feel doable.",
  "Your kindness travels further than you think.",
  "The way you show up for people matters.",
  "You make this corner of the world a little better.",
  "People are lucky to have you in their corner.",
  "You bring a good kind of energy wherever you go.",
  "You deserve to hear how much you’re appreciated.",
  "You make being a good person look easy.",
  "The care you put into things never goes unnoticed.",
  "You make people feel welcome just by being you.",
];

function chooseMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = { chooseMessage };
