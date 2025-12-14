/**
 * Security Questions Service
 * 
 * Manages security questions for wallet recovery.
 * Stores hashed answers for security (never plain text).
 */

export interface SecurityQuestion {
  id: string;
  question: string;
}

export interface SecurityAnswer {
  questionId: string;
  answerHash: string;
}

// Predefined security questions
export const SECURITY_QUESTIONS: SecurityQuestion[] = [
  { id: 'childhood_pet', question: 'What was the name of your first pet?' },
  { id: 'birth_city', question: 'In what city were you born?' },
  { id: 'mother_maiden', question: "What is your mother's maiden name?" },
  { id: 'first_school', question: 'What was the name of your first school?' },
  { id: 'favorite_book', question: 'What is your favorite book?' },
  { id: 'childhood_friend', question: "What is your childhood best friend's name?" },
  { id: 'first_car', question: 'What was the make of your first car?' },
  { id: 'favorite_teacher', question: "What was your favorite teacher's name?" }
];

/**
 * Hash an answer using SHA-256
 * Normalizes the answer (lowercase, trim) before hashing for consistency
 */
async function hashAnswer(answer: string): Promise<string> {
  const normalized = answer.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Store security questions and answers
 * Requires exactly 3 question-answer pairs
 */
export async function storeSecurityAnswers(
  answers: { questionId: string; answer: string }[]
): Promise<void> {
  if (answers.length !== 3) {
    throw new Error('Exactly 3 security questions must be answered');
  }

  // Validate all question IDs are valid
  const validIds = SECURITY_QUESTIONS.map(q => q.id);
  for (const answer of answers) {
    if (!validIds.includes(answer.questionId)) {
      throw new Error(`Invalid question ID: ${answer.questionId}`);
    }
  }

  // Check for duplicates
  const questionIds = answers.map(a => a.questionId);
  const uniqueIds = new Set(questionIds);
  if (uniqueIds.size !== questionIds.length) {
    throw new Error('Cannot use the same question multiple times');
  }

  // Hash all answers
  const hashedAnswers: SecurityAnswer[] = [];
  for (const answer of answers) {
    const hashed = await hashAnswer(answer.answer);
    hashedAnswers.push({
      questionId: answer.questionId,
      answerHash: hashed
    });
  }

  // Store in localStorage
  localStorage.setItem('security_answers', JSON.stringify(hashedAnswers));
  console.log('✅ Security answers stored successfully');
}

/**
 * Get stored security questions (without answers)
 */
export function getStoredSecurityQuestions(): SecurityQuestion[] | null {
  const stored = localStorage.getItem('security_answers');
  if (!stored) {
    return null;
  }

  try {
    const answers: SecurityAnswer[] = JSON.parse(stored);
    return answers.map(a => {
      const question = SECURITY_QUESTIONS.find(q => q.id === a.questionId);
      return question!;
    });
  } catch (error) {
    console.error('Failed to retrieve security questions:', error);
    return null;
  }
}

/**
 * Verify security answers for wallet recovery
 * Returns true if all answers match
 */
export async function verifySecurityAnswers(
  answers: { questionId: string; answer: string }[]
): Promise<boolean> {
  const stored = localStorage.getItem('security_answers');
  if (!stored) {
    return false;
  }

  try {
    const storedAnswers: SecurityAnswer[] = JSON.parse(stored);

    // Must answer all stored questions
    if (answers.length !== storedAnswers.length) {
      return false;
    }

    // Verify each answer
    for (const answer of answers) {
      const stored = storedAnswers.find(s => s.questionId === answer.questionId);
      if (!stored) {
        return false;
      }

      const hashedInput = await hashAnswer(answer.answer);
      if (hashedInput !== stored.answerHash) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to verify security answers:', error);
    return false;
  }
}

/**
 * Check if security questions are set up
 */
export function hasSecurityQuestions(): boolean {
  return localStorage.getItem('security_answers') !== null;
}

/**
 * Clear security questions
 */
export function clearSecurityQuestions(): void {
  localStorage.removeItem('security_answers');
  console.log('✅ Security questions cleared');
}

/**
 * Get random security questions for setup
 * Returns n random questions from the pool
 */
export function getRandomQuestions(count: number = 3): SecurityQuestion[] {
  const shuffled = [...SECURITY_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
