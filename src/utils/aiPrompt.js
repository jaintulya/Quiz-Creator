/**
 * The static AI conversion prompt.
 * User pastes this into Gemini/ChatGPT along with their questions.
 * No questions are embedded here — prompt is question-agnostic.
 */
export function buildAIPrompt() {
  return `Convert whatever questions I give you into this exact JSON format. Output strictly JSON only — no extra text, no markdown, no explanation.

[
  {
    "question": "Full question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Exact matching option string",
    "explanation": "Clear explanation of why this answer is correct"
  }
]

Rules:
- Exactly 4 options per question
- Only one correct answer
- "correctAnswer" must exactly match one of the options (copy-paste it)
- Add a clear and helpful explanation for each answer
- Output must be valid JSON array only — nothing else`;
}
