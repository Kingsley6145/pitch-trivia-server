import { isAdmin } from '../utils/adminAuth';
import {
  getAllCategories as getCategoriesFromFirebase,
  getQuestionBanksByCategory,
  getBankInfo as getBankInfoFromFirebase,
  addQuestionsToCategory,
} from './firebaseService';
import { generateQuestions as generateQuestionsWithAI } from './aiService';

/**
 * Check if user is admin before performing operations
 */
async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export const apiService = {
  // Categories
  getCategories: async () => {
    await requireAdmin();
    const categories = await getCategoriesFromFirebase();
    return { data: categories };
  },
  
  // Question Banks
  getQuestionBanks: async (categoryId) => {
    await requireAdmin();
    const data = await getQuestionBanksByCategory(categoryId);
    return { data };
  },
  
  // Bank Info
  getBankInfo: async (categoryId) => {
    await requireAdmin();
    const bankInfo = await getBankInfoFromFirebase(categoryId);
    return { data: bankInfo };
  },
  
  // Generate Questions
  generateQuestions: async (categoryId) => {
    await requireAdmin();
    
    // Get bank info to determine how many questions to generate
    const bankInfo = await getBankInfoFromFirebase(categoryId);
    
    if (!bankInfo.canGenerate) {
      throw new Error('Cannot generate more questions. Maximum limit reached for this category.');
    }
    
    // Get category info
    const categories = await getCategoriesFromFirebase();
    const category = categories.find(c => c.id === categoryId);
    const categoryTitle = category?.title || categoryId;
    const categorySubtitle = category?.subtitle || null;
    
    // Generate the exact number of questions needed
    const generatedQuestions = await generateQuestionsWithAI(
      categoryTitle,
      categorySubtitle,
      bankInfo.needed
    );
    
    return {
      data: {
        success: true,
        questions: generatedQuestions,
        count: generatedQuestions.length,
        bankInfo: {
          targetBank: bankInfo.targetBank,
          currentCount: bankInfo.currentCount,
          needed: bankInfo.needed,
        },
      },
    };
  },
  
  // Add Questions
  addQuestions: async (categoryId, questions, bankId = null) => {
    await requireAdmin();
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('Questions array is required');
    }
    
    // If bankId not provided, get bank info to determine target bank
    let targetBankId = bankId;
    if (!targetBankId) {
      const bankInfo = await getBankInfoFromFirebase(categoryId);
      targetBankId = bankInfo.targetBank;
    }
    
    const result = await addQuestionsToCategory(categoryId, questions, targetBankId);
    return {
      data: {
        success: true,
        message: `Successfully added ${result.added} question(s) to ${result.bankId}`,
        ...result,
      },
    };
  },
};

export default apiService;

