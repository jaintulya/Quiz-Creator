export function buildAIPrompt(topic = '', count = null, difficulty = '') {
  const cleanTopic = topic ? topic.trim() : '';
  const numCount = Number(count);
  const hasCount = count !== null && count !== '' && !isNaN(numCount) && numCount > 0;
  const cleanCount = hasCount ? Math.max(1, Math.min(numCount, 50)) : null;
  const cleanDifficulty = difficulty && difficulty.trim() ? difficulty.trim() : '';

  const topicContext = cleanTopic ? `on the topic: "${cleanTopic}"` : 'on the requested subject';
  const countClause = cleanCount ? `EXACTLY ${cleanCount}` : 'high-quality';
  const diffClause = cleanDifficulty ? ` ${cleanDifficulty.toLowerCase()}-difficulty` : '';

  return `You are an expert exam assessment creator. Generate ${countClause}${diffClause} multiple-choice questions ${topicContext}.

SOURCE & CONTEXT INSTRUCTIONS:
- If I provide study notes, raw questions, or reference text below (or earlier in this chat): strictly formulate and extract the questions from that material.
- If you have already generated or discussed questions earlier in our chat: reformat and convert them into this exact required format.
- Otherwise: create ${cleanCount ? `${cleanCount} ` : ''}original, high-quality, exam-grade questions using your knowledge ${topicContext}.

REQUIRED OUTPUT FORMAT:
Output all questions in this exact structure:

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

FORMAT RULES:
1. Question Count: ${cleanCount ? `Generate EXACTLY ${cleanCount} questions numbered sequentially (1 to ${cleanCount}).` : 'Number all questions sequentially (1., 2., 3., etc.).'}
2. Options: Exactly 4 options per question labeled A), B), C), D).
3. Answer: Must write "Answer: [A/B/C/D]" on its own line.
4. Explanations: Keep explanations concise (1 short sentence).
5. Output Only: Output strictly the numbered questions without conversational intro or outro text.`;
}
