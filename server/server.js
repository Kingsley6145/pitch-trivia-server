const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { requireAdmin } = require('./utils/adminAuth');
const {
  getAllCategories,
  getQuestionBanksByCategory,
  getBankInfo,
  addQuestionsToCategory,
} = require('./services/questionService');
const { generateQuestions } = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Question Generator Server is running' });
});

// Get all categories (protected)
app.get('/api/categories', requireAdmin, async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get question banks for a category (protected)
app.get('/api/categories/:categoryId/banks', requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const data = await getQuestionBanksByCategory(categoryId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bank information (protected)
app.get('/api/categories/:categoryId/bank-info', requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const bankInfo = await getBankInfo(categoryId);
    res.json(bankInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate questions using AI (protected)
app.post('/api/categories/:categoryId/generate', requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Get bank info to determine how many questions to generate
    const bankInfo = await getBankInfo(categoryId);
    
    if (!bankInfo.canGenerate) {
      return res.status(400).json({ 
        error: 'Cannot generate more questions. Maximum limit reached for this category.' 
      });
    }
    
    // Get category info
    const categories = await getAllCategories();
    const category = categories.find(c => c.id === categoryId);
    const categoryTitle = category?.title || categoryId;
    const categorySubtitle = category?.subtitle || null;
    
    // Generate the exact number of questions needed
    const generatedQuestions = await generateQuestions(
      categoryTitle,
      categorySubtitle,
      bankInfo.needed
    );
    
    res.json({
      success: true,
      questions: generatedQuestions,
      count: generatedQuestions.length,
      bankInfo: {
        targetBank: bankInfo.targetBank,
        currentCount: bankInfo.currentCount,
        needed: bankInfo.needed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add generated questions to category (protected)
app.post('/api/categories/:categoryId/questions', requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { questions, bankId } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    
    // If bankId not provided, get bank info to determine target bank
    let targetBankId = bankId;
    if (!targetBankId) {
      const bankInfo = await getBankInfo(categoryId);
      targetBankId = bankInfo.targetBank;
    }
    
    const result = await addQuestionsToCategory(categoryId, questions, targetBankId);
    res.json({
      success: true,
      message: `Successfully added ${result.added} question(s) to ${result.bankId}`,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Question Generator Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

