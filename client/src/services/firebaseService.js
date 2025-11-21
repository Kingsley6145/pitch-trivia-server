import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '../firebase/config';

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    const snapshot = await get(ref(realtimeDb, 'categories'));
    const categories = snapshot.val() || {};
    return Object.values(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Get question banks for a category
 */
export async function getQuestionBanksByCategory(categoryId) {
  try {
    const snapshot = await get(ref(realtimeDb, `questions/${categoryId}`));
    const data = snapshot.val() || {};
    
    // For all categories (including Daily Quiz), return banks
    // Banks are stored as bank1, bank2, etc. as keys
    const banks = [];
    Object.keys(data).forEach((key) => {
      if (key.startsWith('bank')) {
        const bank = data[key];
        if (bank && (bank.questions || bank.bankId)) {
          banks.push({
            bankId: key,
            ...bank,
          });
        }
      }
    });
    
    // Sort banks by order or bank number
    banks.sort((a, b) => {
      const numA = parseInt(a.bankId.replace('bank', '')) || 0;
      const numB = parseInt(b.bankId.replace('bank', '')) || 0;
      return numA - numB;
    });
    
    return {
      type: 'banks',
      banks: banks,
      count: banks.reduce((total, bank) => total + (bank.questions?.length || 0), 0),
    };
  } catch (error) {
    console.error('Error fetching question banks:', error);
    throw error;
  }
}

/**
 * Get bank information and calculate questions needed
 */
export async function getBankInfo(categoryId) {
  try {
    const data = await getQuestionBanksByCategory(categoryId);
    const QUESTIONS_PER_BANK = 10;
    const isDailyQuiz = categoryId === 'daily-quiz';
    
    // For Daily Quiz, check if bank1 exists, otherwise treat as empty
    if (isDailyQuiz) {
      // Daily Quiz: only one bank (bank1) with max 10 questions
      const categorySnapshot = await get(ref(realtimeDb, `questions/${categoryId}`));
      const categoryData = categorySnapshot.val() || {};
      const bank1 = categoryData.bank1;
      
      if (!bank1 || !bank1.questions) {
        // No bank1 yet
        return {
          type: 'banks',
          currentBank: null,
          currentCount: 0,
          needed: QUESTIONS_PER_BANK,
          canGenerate: true,
          targetBank: 'bank1',
        };
      }
      
      const currentCount = bank1.questions.length || 0;
      const needed = QUESTIONS_PER_BANK - currentCount;
      
      return {
        type: 'banks',
        currentBank: 'bank1',
        currentCount,
        needed: Math.max(0, needed),
        canGenerate: needed > 0,
        targetBank: 'bank1',
      };
    }
    
    // Regular categories: banks of 10 questions each (can have multiple banks)
    if (!data.banks || data.banks.length === 0) {
      // No banks yet, need to create bank1 with 10 questions
      return {
        type: 'banks',
        currentBank: null,
        currentCount: 0,
        needed: QUESTIONS_PER_BANK,
        canGenerate: true,
        targetBank: 'bank1',
      };
    }
    
    // Find the last bank and check if it's full
    const sortedBanks = data.banks.sort((a, b) => {
      const numA = parseInt(a.bankId.replace('bank', '')) || 0;
      const numB = parseInt(b.bankId.replace('bank', '')) || 0;
      return numA - numB;
    });
    
    const lastBank = sortedBanks[sortedBanks.length - 1];
    const currentCount = lastBank.questions?.length || 0;
    const needed = QUESTIONS_PER_BANK - currentCount;
    
    if (needed <= 0) {
      // Last bank is full, need a new bank
      const lastBankNum = parseInt(lastBank.bankId.replace('bank', '')) || 0;
      const nextBankNum = lastBankNum + 1;
      return {
        type: 'banks',
        currentBank: lastBank.bankId,
        currentCount: QUESTIONS_PER_BANK,
        needed: QUESTIONS_PER_BANK,
        canGenerate: true,
        targetBank: `bank${nextBankNum}`,
      };
    }
    
    // Last bank needs more questions
    return {
      type: 'banks',
      currentBank: lastBank.bankId,
      currentCount,
      needed,
      canGenerate: true,
      targetBank: lastBank.bankId,
    };
  } catch (error) {
    console.error('Error getting bank info:', error);
    throw error;
  }
}

/**
 * Add questions to a category
 */
export async function addQuestionsToCategory(categoryId, questions, bankId = null) {
  try {
    const isDailyQuiz = categoryId === 'daily-quiz';
    
    // Handle Daily Quiz separately (only bank1, max 10 questions)
    if (isDailyQuiz) {
      const bankRef = ref(realtimeDb, `questions/${categoryId}/bank1`);
      const bankSnapshot = await get(bankRef);
      const bank = bankSnapshot.val() || { bankId: 'bank1', order: 1, questions: [], createdAt: Date.now() };
      const currentCount = bank.questions?.length || 0;
      const remaining = 10 - currentCount;
      
      if (remaining <= 0) {
        throw new Error('Daily Quiz bank1 is full. Maximum 10 questions allowed.');
      }
      
      // Only add up to the remaining questions
      const questionsToAdd = questions.slice(0, remaining);
      
      // Get max ID from all questions in this category
      const categorySnapshot = await get(ref(realtimeDb, `questions/${categoryId}`));
      const categoryData = categorySnapshot.val() || {};
      let maxId = 0;
      
      Object.values(categoryData).forEach((item) => {
        if (item.questions && Array.isArray(item.questions)) {
          item.questions.forEach((q) => {
            if (q.id && q.id > maxId) {
              maxId = q.id;
            }
          });
        }
      });
      
      const newQuestions = questionsToAdd.map((q, idx) => ({
        ...q,
        id: maxId + idx + 1,
        category: categoryId,
      }));
      
      bank.questions = [...(bank.questions || []), ...newQuestions];
      bank.updatedAt = Date.now();
      
      await set(bankRef, bank);
      return { added: newQuestions.length, bankId: 'bank1' };
    }
    
    // Handle regular categories (can have multiple banks)
    if (!bankId) {
      // Create new bank
      const snapshot = await get(ref(realtimeDb, `questions/${categoryId}`));
      const existing = snapshot.val() || {};
      const bankNumbers = Object.keys(existing)
        .filter(k => k.startsWith('bank'))
        .map(k => parseInt(k.replace('bank', '')) || 0);
      const nextBankNum = bankNumbers.length > 0 ? Math.max(...bankNumbers) + 1 : 1;
      bankId = `bank${nextBankNum}`;
    }
    
    const bankRef = ref(realtimeDb, `questions/${categoryId}/${bankId}`);
    const bankSnapshot = await get(bankRef);
    const bank = bankSnapshot.val() || { 
      bankId, 
      order: parseInt(bankId.replace('bank', '')) || 1,
      questions: [],
      createdAt: Date.now(),
    };
    
    // Get max ID from all questions in this category (not just this bank)
    const categorySnapshot = await get(ref(realtimeDb, `questions/${categoryId}`));
    const categoryData = categorySnapshot.val() || {};
    let maxId = 0;
    
    // Find max ID across all banks
    Object.values(categoryData).forEach((item) => {
      if (item.questions && Array.isArray(item.questions)) {
        item.questions.forEach((q) => {
          if (q.id && q.id > maxId) {
            maxId = q.id;
          }
        });
      }
    });
    
    const newQuestions = questions.map((q, idx) => ({
      ...q,
      id: maxId + idx + 1,
      category: categoryId,
    }));
    
    bank.questions = [...(bank.questions || []), ...newQuestions];
    bank.updatedAt = Date.now();
    
    await set(bankRef, bank);
    return { added: newQuestions.length, bankId };
  } catch (error) {
    console.error('Error adding questions:', error);
    throw error;
  }
}

