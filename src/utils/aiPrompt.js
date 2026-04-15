/**
 * Generates the AI conversion prompt with the user's raw questions embedded.
 * @param {string} rawQuestions - The raw pasted questions
 * @returns {string} - The full prompt to copy into Gemini/ChatGPT
 */
export function buildAIPrompt(rawQuestions) {
  return `Convert the following questions into this JSON quiz format:

FORMAT:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "string",
    "explanation": "string"
  }
]

Rules:
- Ensure exactly 4 options per question
- Only one correct answer
- Add clear explanation for each answer
- Keep output strictly in JSON (no extra text)

Questions:
${rawQuestions || '[PASTE YOUR QUESTIONS HERE]'}`;
}
