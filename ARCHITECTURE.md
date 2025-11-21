# Architecture Overview

## System Architecture

The Question Generator is a full-stack application consisting of:

1. **Backend Server** (Node.js/Express)
   - RESTful API endpoints
   - Firebase Admin SDK integration
   - OpenAI API integration
   - Admin authentication middleware

2. **Frontend Client** (React)
   - User interface for question generation
   - Firebase Auth for client-side authentication
   - API integration layer
   - Responsive UI with Pitch Trivia design system

## Data Flow

```
User (Admin)
    ↓
React Frontend (Login)
    ↓
Firebase Auth (Verify Admin Email)
    ↓
React Frontend (Select Category)
    ↓
Express API (Get Categories/Banks)
    ↓
Firebase Realtime Database (Read)
    ↓
React Frontend (Display Example Question)
    ↓
Express API (Generate Questions)
    ↓
OpenAI API (GPT-4)
    ↓
Express API (Process & Validate)
    ↓
React Frontend (Display Generated Questions)
    ↓
User Reviews & Approves
    ↓
Express API (Save Questions)
    ↓
Firebase Realtime Database (Write)
    ↓
Main Admin Panel (Questions Available)
```

## Component Structure

### Server Components

- **server.js**: Express app with route definitions
- **firebase/admin.js**: Firebase Admin SDK initialization
- **utils/adminAuth.js**: Authentication middleware
- **services/questionService.js**: Database operations
- **services/aiService.js**: OpenAI integration

### Client Components

- **App.jsx**: Main router and auth state management
- **pages/Login.jsx**: Authentication interface
- **pages/Generator.jsx**: Main question generation interface
- **services/api.js**: API client with auth interceptors
- **utils/adminAuth.js**: Client-side auth utilities
- **firebase/config.js**: Firebase client configuration

## API Endpoints

### Authentication
All endpoints (except `/api/health`) require a Bearer token in the Authorization header.

### Endpoints

1. **GET /api/health**
   - Public health check
   - Returns: `{ status: 'ok', message: '...' }`

2. **GET /api/categories**
   - Get all categories
   - Returns: `Array<Category>`

3. **GET /api/categories/:categoryId/banks**
   - Get question banks for a category
   - Returns: `{ type: 'banks'|'direct', banks?: Array, questions?: Array, count: number }`

4. **GET /api/categories/:categoryId/example**
   - Get example question from category
   - Returns: `Question | null`

5. **POST /api/categories/:categoryId/generate**
   - Generate questions using AI
   - Body: `{ bankId?: string, count?: number }`
   - Returns: `{ success: true, questions: Array<Question>, count: number }`

6. **POST /api/categories/:categoryId/questions**
   - Add questions to category
   - Body: `{ questions: Array<Question>, bankId?: string }`
   - Returns: `{ success: true, message: string, added: number, bankId?: string }`

## Question Generation Process

1. **Example Selection**: System finds first available question in category
2. **Prompt Construction**: Creates detailed prompt with:
   - Example question structure
   - Category context
   - Difficulty requirements
   - Format specifications
3. **AI Generation**: Sends to GPT-4 with temperature 0.8
4. **Validation**: Ensures:
   - Correct number of questions
   - Valid structure (text, options, correct, difficulty)
   - 4 options per question
   - Correct answer is in options
   - Valid difficulty level
5. **Return**: Validated questions array

## Security

- **Authentication**: Firebase Auth tokens verified on every request
- **Authorization**: Email whitelist check (server-side)
- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Integration Points

### With Main Admin Panel

The generated questions are saved directly to Firebase Realtime Database using the same structure as the main admin panel:

- Regular categories: `/questions/{categoryId}/{bankId}/questions[]`
- Daily Quiz: `/questions/daily-quiz/direct[]`

This ensures seamless integration - questions appear immediately in the main admin panel.

### Firebase Structure Compatibility

The system is designed to work with the existing Firebase structure:

```
/categories
  /{categoryId}
    - id, title, subtitle, emoji, isPermanent, etc.

/questions
  /{categoryId}
    /{bankId}
      - bankId, order, questions[], createdAt, updatedAt
  /daily-quiz
    /direct: Question[]
```

## Error Handling

- **Client**: User-friendly error messages displayed in UI
- **Server**: Detailed error logging, sanitized error responses
- **API**: HTTP status codes (401, 403, 404, 500)
- **AI**: Fallback handling for API failures

## Performance Considerations

- **Caching**: Categories cached on client-side
- **Lazy Loading**: Questions loaded only when category selected
- **Optimistic UI**: Loading states for better UX
- **Batch Operations**: Questions saved in single transaction

## Future Enhancements

- Bulk generation (multiple categories)
- Question editing before saving
- Question templates
- Difficulty distribution control
- Custom prompt templates
- Generation history
- Question quality scoring

