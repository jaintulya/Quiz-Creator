/**
 * AI Conversion & Question Generation Prompt Builder.
 * User can copy this prompt into ChatGPT, Gemini, Claude, or any LLM
 * to generate exam-ready questions formatted precisely for QuizCraft.
 */
export function buildAIPrompt(topic = '', count = 5, difficulty = 'Medium') {
  const cleanTopic = topic ? topic.trim() : '';
  const cleanCount = Math.max(1, Math.min(Number(count) || 5, 50));
  const cleanDifficulty = difficulty || 'Medium';

  const promptLead = cleanTopic
    ? `Generate ${cleanCount} ${cleanDifficulty.toLowerCase()}-difficulty, exam-grade multiple-choice questions on the topic: "${cleanTopic}".`
    : `Convert and improve whatever questions or notes I provide into this exact JSON format with ${cleanDifficulty.toLowerCase()} difficulty.`;

  return `${promptLead}

Output strictly valid JSON only — no conversational filler, no markdown wrappers, no explanations outside the JSON array.

[
  {
    "question": "Clear and well-structured question text?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Option A",
    "explanation": "Clear explanation of why this option is correct."
  }
]

CRITICAL FORMAT & QUALITY RULES:
1. Structure: Output must be a strictly valid JSON array of question objects.
2. Options: Each question must have exactly 4 plausible options.
3. Correct Answer: "correctAnswer" must EXACTLY match one of the items inside the "options" array.
4. Explanations: Provide a concise, educational explanation for each question.
5. Difficulty Level: Ensure all questions strictly match "${cleanDifficulty}" difficulty. Wrong options must be realistic and based on common misconceptions; avoid obvious giveaways.
6. Balanced: Keep option lengths roughly uniform and randomize correct answer positions across questions.

Strictly output only the raw JSON array.`;
}
