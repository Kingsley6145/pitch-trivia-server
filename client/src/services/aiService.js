import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const getGenAI = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'REACT_APP_GEMINI_API_KEY is not set in environment variables. ' +
      'To fix this, add the environment variable in Vercel: ' +
      '1. Go to your Vercel project settings, 2. Navigate to Environment Variables, ' +
      '3. Add REACT_APP_GEMINI_API_KEY with your Gemini API key value, ' +
      '4. Redeploy the application.'
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate questions using AI for a category
 */
export async function generateQuestions(categoryTitle, categorySubtitle, count = 10) {
  try {
    const genAI = getGenAI();
    
    const prompt = `You are a trivia question generator. Generate ${count} trivia questions for the "${categoryTitle}" category${categorySubtitle ? ` (${categorySubtitle})` : ''}.

Requirements:
1. Generate exactly ${count} questions
2. Each question must have exactly 4 options (A, B, C, D)
3. One option must be the correct answer
4. Difficulty should vary: approximately 30% easy, 40% medium, 30% hard
5. Questions should be relevant to the "${categoryTitle}" category
6. Make questions interesting, engaging, and educational
7. Ensure questions are factually accurate
8. Vary the question types (multiple choice, true/false style, etc.)
9. Avoid overly obscure or niche questions unless appropriate for the category

Return the response as a JSON array with this exact format:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "Option A",
    "difficulty": "easy"
  },
  ...
]

Only return the JSON array, no additional text or markdown formatting.`;

    const fullPrompt = `You are a trivia question generator. Always respond with valid JSON arrays only. Never include any text before or after the JSON array.

${prompt}`;

    // Try models in order: flash (free tier) -> pro -> original
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let result;
    let lastError = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(fullPrompt);
        console.log(`Successfully used model: ${modelName}`);
        break; // Success, exit loop
      } catch (modelError) {
        lastError = modelError;
        console.log(`${modelName} failed:`, modelError.message);
        // Continue to next model
        continue;
      }
    }
    
    if (!result) {
      // All models failed
      const errorMsg = lastError?.message || 'Unknown error';
      
      // Check for quota/billing errors
      if (errorMsg.includes('API key not valid') || errorMsg.includes('quota') || errorMsg.includes('billing')) {
        throw new Error(`API quota exhausted or billing required. ${errorMsg}. Please set up billing in Google Cloud Console or wait for quota reset.`);
      }
      
      throw new Error(`All Gemini models failed. Last error: ${errorMsg}`);
    }
    
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Clean up response (remove markdown code blocks if present)
    let jsonText = responseText;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const questions = JSON.parse(jsonText);
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length !== count) {
      throw new Error(`Expected ${count} questions, got ${questions.length}`);
    }
    
    // Validate each question structure
    questions.forEach((q, idx) => {
      if (!q.text || !q.options || !q.correct || !q.difficulty) {
        throw new Error(`Question ${idx + 1} is missing required fields`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx + 1} must have exactly 4 options`);
      }
      if (!q.options.includes(q.correct)) {
        throw new Error(`Question ${idx + 1}: correct answer must be one of the options`);
      }
      if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
        throw new Error(`Question ${idx + 1}: difficulty must be easy, medium, or hard`);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Provide more helpful error messages
    const errorMsg = error.message || String(error);
    
    if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('API key not valid')) {
      throw new Error(`Gemini API quota exhausted or billing required. Please:\n1. Go to Google Cloud Console and set up billing\n2. Or wait for your free tier quota to reset\n\nOriginal error: ${errorMsg}`);
    }
    
    throw new Error(`Failed to generate questions: ${errorMsg}`);
  }
}

