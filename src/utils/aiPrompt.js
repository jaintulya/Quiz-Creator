/**
 * The static AI conversion prompt.
 * User pastes this into Gemini/ChatGPT along with their questions.
 * No questions are embedded here — prompt is question-agnostic.
 */
export function buildAIPrompt() {
  return `Convert and improve whatever questions I give you/you give me in this chat into this exact JSON format.

Output strictly JSON only — no extra text, no markdown, no explanation outside JSON.

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
- "correctAnswer" must exactly match one of the options
- Output valid JSON array only

IMPORTANT IMPROVEMENT RULES:
- If the questions I provide are weak, improve them slightly to make them feel like real exam questions.
- If options are weak or obvious, improve the distractors.
- If correct answers show patterns (like too many A answers, repeated A-B-C-D sequence, or visible answer patterns), randomize and rebalance them.
- If the correct answer is the longest option, most specific option, or visually obvious, rewrite options to remove that clue.
- Keep option lengths roughly balanced.
- Make wrong options plausible, based on common mistakes.
- Remove giveaway options.
- Preserve the original concept of the question while improving quality.
- If needed, slightly rewrite question wording to make it more exam-like.
- Add conceptual trap options when appropriate.
- Before final output, validate there is no detectable answer pattern or option clue.

Goal:
Convert my existing questions into a high-quality, test-based quiz JSON suitable for a real exam mock test.`;
}
