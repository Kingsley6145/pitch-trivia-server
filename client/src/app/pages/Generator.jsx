import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { apiService } from '../../services/api';
import './Generator.css';

function Generator() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories: ' + err.message);
    }
  };

  const loadCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setGeneratedQuestions([]);

      const [banksResponse, bankInfoResponse] = await Promise.all([
        apiService.getQuestionBanks(selectedCategory.id),
        apiService.getBankInfo(selectedCategory.id),
      ]);

      setQuestionData(banksResponse.data);
      setBankInfo(bankInfoResponse.data);
    } catch (err) {
      setError('Failed to load category data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData();
    }
  }, [selectedCategory, loadCategoryData]);

  const handleGenerate = async () => {
    if (!bankInfo || !bankInfo.canGenerate) {
      setError('Cannot generate more questions for this category.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setGeneratedQuestions([]);

      const response = await apiService.generateQuestions(selectedCategory.id);
      setGeneratedQuestions(response.data.questions);
      setSuccess(`Successfully generated ${response.data.count} question(s)!`);
    } catch (err) {
      setError('Failed to generate questions: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (generatedQuestions.length === 0) {
      setError('No questions to save');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiService.addQuestions(selectedCategory.id, generatedQuestions);
      setSuccess(`Successfully added ${generatedQuestions.length} questions to ${selectedCategory.title}!`);
      setGeneratedQuestions([]);
      loadCategoryData(); // Refresh to show updated count
    } catch (err) {
      setError('Failed to save questions: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { bg: 'rgba(0, 166, 81, 0.1)', text: '#00A651' };
      case 'medium':
        return { bg: 'rgba(255, 215, 0, 0.2)', text: '#b8860b' };
      case 'hard':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      default:
        return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <div className="generator-container">
      <header className="generator-header">
        <div className="header-content">
          <h1 className="generator-title">Question Generator</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="generator-main">
        <div className="generator-sidebar">
          <h2 className="sidebar-title">Categories</h2>
          <div className="categories-list">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`category-button ${
                  selectedCategory?.id === category.id ? 'active' : ''
                }`}
              >
                <span className="category-emoji">{category.emoji}</span>
                <div className="category-info">
                  <span className="category-name">{category.title}</span>
                  <span className="category-subtitle">{category.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="generator-content">
          {!selectedCategory ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2>Select a Category</h2>
              <p>Choose a category from the sidebar to start generating questions</p>
            </div>
          ) : (
            <div className="category-view">
              <div className="category-header">
                <h2 className="category-title">
                  <span>{selectedCategory.emoji}</span>
                  {selectedCategory.title}
                </h2>
                {questionData && (
                  <div className="question-count">
                    Total Questions: <strong>{questionData.count}</strong>
                  </div>
                )}
              </div>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {loading && !questionData && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading category data...</p>
                </div>
              )}

              {questionData && bankInfo && (
                <>
                  <div className="bank-info-section">
                    <h3 className="section-title">Bank Information</h3>
                    <div className="bank-info-card">
                      <div className="bank-info-grid">
                        <div className="bank-info-item">
                          <span className="bank-info-label">Total Questions:</span>
                          <span className="bank-info-value">{questionData.count}</span>
                        </div>
                        {bankInfo.type === 'banks' && bankInfo.currentBank && (
                          <div className="bank-info-item">
                            <span className="bank-info-label">Current Bank:</span>
                            <span className="bank-info-value">{bankInfo.currentBank}</span>
                          </div>
                        )}
                        {bankInfo.targetBank && (
                          <div className="bank-info-item">
                            <span className="bank-info-label">Target Bank:</span>
                            <span className="bank-info-value highlight">{bankInfo.targetBank}</span>
                          </div>
                        )}
                        {bankInfo.currentCount !== undefined && (
                          <div className="bank-info-item">
                            <span className="bank-info-label">Questions in Bank:</span>
                            <span className="bank-info-value">{bankInfo.currentCount} / 10</span>
                          </div>
                        )}
                        <div className="bank-info-item">
                          <span className="bank-info-label">Questions Needed:</span>
                          <span className="bank-info-value highlight">{bankInfo.needed}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerate}
                      className="generate-button"
                      disabled={loading || !bankInfo.canGenerate}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          Generate {bankInfo.needed} Question{bankInfo.needed !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                    {!bankInfo.canGenerate && (
                      <p className="info-text">This category has reached its maximum capacity.</p>
                    )}
                  </div>

                  {generatedQuestions.length > 0 && (
                    <div className="generated-section">
                      <div className="section-header">
                        <h3 className="section-title">
                          Generated Questions ({generatedQuestions.length})
                        </h3>
                        <button
                          onClick={handleSaveQuestions}
                          className="save-button"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save All Questions'}
                        </button>
                      </div>
                      <div className="questions-grid">
                        {generatedQuestions.map((question, idx) => (
                          <div key={idx} className="question-card">
                            <div className="question-header">
                              <span className="question-number">Q{idx + 1}</span>
                              <span
                                className="difficulty-badge"
                                style={{
                                  background: getDifficultyColor(question.difficulty).bg,
                                  color: getDifficultyColor(question.difficulty).text,
                                }}
                              >
                                {question.difficulty}
                              </span>
                            </div>
                            <p className="question-text">{question.text}</p>
                            <div className="question-options">
                              {question.options.map((option, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`option ${
                                    option === question.correct ? 'correct' : ''
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Generator;

