export function pickRandomPrompt(card) {
  if (!card || !card.prompts || card.prompts.length === 0) return "";
  const idx = Math.floor(Math.random() * card.prompts.length);
  return card.prompts[idx];
}
