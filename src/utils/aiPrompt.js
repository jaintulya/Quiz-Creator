/**
 * AI Conversion & Question Generation Prompt Builder.
 * User can copy this prompt into ChatGPT, Gemini, Claude, or any LLM.
 *
 * Designed to handle:
 * 1) Questions/notes provided by user or created earlier in the chat conversation.
 * 2) Generating original questions from scratch on the specified topic.
 *
 * Uses clean Plain Text format with concise explanations so that:
 * - Code questions with brackets like <Image source={require('./avatar.png')} /> never break.
 * - Responses don't get cut off by AI message length limits on 10, 20, 50 questions.
 */
export function buildAIPrompt(topic = '', count = null, difficulty = '') {
  const cleanTopic = topic ? topic.trim() : '';
  const numCount = Number(count);
  const hasCount = count !== null && count !== '' && !isNaN(numCount) && numCount > 0;
  const cleanCount = hasCount ? Math.max(1, Math.min(numCount, 50)) : null;
  const cleanDifficulty = difficulty && difficulty.trim() ? difficulty.trim() : '';

  const topicContext = cleanTopic ? `on the topic: "${cleanTopic}"` : `on the requested subject`;
  const countClause = cleanCount ? `EXACTLY ${cleanCount}` : `high-quality`;
  const diffClause = cleanDifficulty ? ` ${cleanDifficulty.toLowerCase()}-difficulty` : '';

  return `You are an expert exam assessment creator. Generate ${countClause}${diffClause} multiple-choice questions ${topicContext}.

SOURCE & CONTEXT INSTRUCTIONS:
- If I provide study notes, raw questions, or reference text below (or earlier in this chat): strictly formulate and extract the questions from that material.
- If you have already generated or discussed questions earlier in our chat: reformat and convert them into this exact required format.
- Otherwise: create ${cleanCount ? `${cleanCount} ` : ''}original, high-quality, exam-grade questions using your knowledge ${topicContext}.

REQUIRED OUTPUT FORMAT (COPY-PASTE READY):
Output all questions inside a single code block (\`\`\`text ... \`\`\`) so it is ready for instant 1-click copy-pasting:

\`\`\`text
1. Clear and well-structured question title or code snippet?
A) First option choice
B) Second option choice
C) Third option choice
D) Fourth option choice
Answer: A
Explanation: Concise explanation of why this option is correct.

2. Next question title or code snippet?
A) Option A
B) Option B
C) Option C
D) Option D
Answer: C
Explanation: Concise explanation.
\`\`\`

FORMAT RULES:
1. Question Count: ${cleanCount ? `Generate EXACTLY ${cleanCount} questions numbered sequentially (1 to ${cleanCount}).` : `Number all questions sequentially (1., 2., 3., etc.).`}
2. Options: Exactly 4 options per question labeled A), B), C), D).
3. Answer: Must write "Answer: [A/B/C/D]" on its own line.
4. Explanations: Keep explanations concise (1 short sentence).
5. 1-Click Copy Box: Wrap all questions inside a single \`\`\`text ... \`\`\` block with NO conversational intro, notes, or outro.`;
}



