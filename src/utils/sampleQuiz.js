import { getAllQuizzes, saveQuiz } from './storage.js';

// ─── Sample quiz data ──────────────────────────────────────────────────────────
const SAMPLE_QUIZ = {
  title: '🚀 JavaScript Fundamentals',
  questions: [
    {
      question: 'Which keyword is used to declare a constant variable in JavaScript?',
      options: ['var', 'let', 'const', 'define'],
      correctAnswer: 'const',
      explanation:
        '"const" declares a block-scoped constant. Its value cannot be reassigned after declaration, unlike "var" or "let".',
    },
    {
      question: 'What does "=== " (triple equals) check in JavaScript?',
      options: [
        'Only value equality',
        'Only type equality',
        'Both value and type equality',
        'Neither value nor type',
      ],
      correctAnswer: 'Both value and type equality',
      explanation:
        '"===" is the strict equality operator. It checks both the value AND the type, while "==" only checks value after type coercion.',
    },
    {
      question: 'Which method is used to add an element to the END of an array?',
      options: ['unshift()', 'push()', 'pop()', 'shift()'],
      correctAnswer: 'push()',
      explanation:
        '"push()" adds one or more elements to the end of an array. "unshift()" adds to the beginning, "pop()" removes from end, "shift()" removes from beginning.',
    },
    {
      question: 'What will "typeof null" return in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctAnswer: '"object"',
      explanation:
        'This is a long-standing bug in JavaScript. typeof null returns "object", even though null is not an object. This has been kept for backward compatibility.',
    },
    {
      question: 'Which of the following is NOT a JavaScript primitive data type?',
      options: ['string', 'boolean', 'array', 'undefined'],
      correctAnswer: 'array',
      explanation:
        'JavaScript primitives are: string, number, bigint, boolean, undefined, symbol, and null. Arrays are objects (reference types), not primitives.',
    },
    {
      question: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?',
      options: ['true', 'false', 'undefined', 'NaN'],
      correctAnswer: 'false',
      explanation:
        'Due to floating-point precision issues in binary representation, 0.1 + 0.2 equals approximately 0.30000000000000004, not exactly 0.3.',
    },
    {
      question: 'What does the "spread operator" (...) do?',
      options: [
        'Deletes array elements',
        'Expands iterable elements into individual items',
        'Creates an infinite loop',
        'Converts string to array of chars',
      ],
      correctAnswer: 'Expands iterable elements into individual items',
      explanation:
        'The spread operator (...) expands an iterable (array, string, etc.) into individual elements. E.g., [...arr1, ...arr2] merges two arrays.',
    },
    {
      question: 'Which built-in method returns the length of a string?',
      options: ['size()', 'count()', 'length', 'len()'],
      correctAnswer: 'length',
      explanation:
        '"length" is a property (not a method) of strings and arrays in JavaScript. Use str.length to get the character count.',
    },
  ],
};

// ─── Seed sample quiz if no quizzes exist ──────────────────────────────────────
export function seedSampleQuiz() {
  const existing = getAllQuizzes();
  if (existing.length === 0) {
    saveQuiz(SAMPLE_QUIZ.title, SAMPLE_QUIZ.questions);
  }
}
