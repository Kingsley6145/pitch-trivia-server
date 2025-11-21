# Pitch Trivia - Question Generator

An AI-powered question generation tool for Pitch Trivia admin panel. This application allows admins to generate trivia questions using AI based on example questions from existing question banks.

## Project Structure

```
Pitch Trivia server/
├── server/                 # Node.js/Express backend
│   ├── server.js          # Express server entry point
│   ├── firebase/
│   │   └── admin.js       # Firebase Admin SDK configuration
│   ├── services/
│   │   ├── questionService.js  # Question CRUD operations
│   │   └── aiService.js         # OpenAI integration
│   ├── utils/
│   │   └── adminAuth.js   # Admin authentication middleware
│   ├── package.json
│   └── .env.example
│
└── client/                 # React frontend
    ├── src/
    │   ├── App.jsx        # Main app with routing
    │   ├── index.js       # React entry point
    │   ├── firebase/
    │   │   └── config.js  # Firebase client config
    │   ├── app/pages/
    │   │   ├── Login.jsx  # Login page
    │   │   └── Generator.jsx  # Main generator interface
    │   ├── services/
    │   │   └── api.js     # API service layer
    │   └── utils/
    │       └── adminAuth.js  # Client-side auth utilities
    ├── public/
    │   └── index.html
    └── package.json
```

## Features

- 🔐 **Admin Authentication**: Email whitelist-based access control
- 📚 **Category Selection**: Browse and select from existing categories
- 📊 **Question Bank Overview**: View total question count per category
- 👁️ **Example Question Display**: See existing questions as examples
- ✨ **AI Question Generation**: Generate 9 new questions based on examples
- 💾 **Save to Firebase**: Add generated questions directly to your database
- 🎨 **Modern UI**: Beautiful interface using Pitch Trivia color palette

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Realtime Database
- OpenAI API key

### Quick Start (Install All Dependencies)

From the root directory:
```bash
npm run install:all
```

Or install separately:

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file based on `.env.example`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Server
PORT=5000
NODE_ENV=development

# Admin Emails (comma-separated)
ADMIN_EMAILS=Games@pitchtrivia.com,games@pitchtrivia.com
```

**Getting Firebase Admin Credentials:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the values to your `.env` file

### 2. Client Setup

```bash
cd client
npm install
```

Create a `.env` file in the client directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Running the Application

**Option 1: Use the startup scripts (Recommended)**

Windows:
```bash
start.bat
```

Mac/Linux:
```bash
chmod +x start.sh
./start.sh
```

**Option 2: Run from root directory**

```bash
# Terminal 1 - Server (production)
npm run start:server

# Terminal 1 - Server (development with auto-reload)
npm run dev
# or
npm run dev:server

# Terminal 2 - Client
npm run start:client
```

**Option 3: Run from individual directories**

```bash
# Terminal 1 - Server
cd server
npm start
# or for development with auto-reload:
npm run dev

# Terminal 2 - Client
cd client
npm start
```

The client will run on `http://localhost:3000` and the server on `http://localhost:5000`.

## How It Works

1. **Login**: Admin logs in with whitelisted email
2. **Select Category**: Choose a category from the sidebar
3. **View Example**: System displays an example question from that category
4. **Generate**: Click "Generate 9 Questions" to create AI-generated questions
5. **Review**: Review the generated questions
6. **Save**: Click "Save All Questions" to add them to Firebase

## API Endpoints

### Protected Routes (Require Admin Token)

- `GET /api/categories` - Get all categories
- `GET /api/categories/:categoryId/banks` - Get question banks for a category
- `GET /api/categories/:categoryId/example` - Get example question
- `POST /api/categories/:categoryId/generate` - Generate questions using AI
- `POST /api/categories/:categoryId/questions` - Add questions to category

## Data Structure

The application integrates with your existing Firebase structure:

- **Categories**: `/categories/{categoryId}`
- **Questions (Regular)**: `/questions/{categoryId}/{bankId}`
- **Questions (Daily Quiz)**: `/questions/daily-quiz/direct`

## Color Palette

The application uses the Pitch Trivia color scheme:
- Primary: Purple/Indigo (#6366F1 to #8B5CF6)
- Success: Green (#00A651)
- Error: Red (#ef4444)
- Background: White to light blue gradient

## Security Notes

- Admin access is controlled by email whitelist
- All API routes require Firebase authentication token
- Firebase Admin SDK is used for server-side operations
- Client-side authentication uses Firebase Auth

## Troubleshooting

**"No example question found"**
- Ensure the category has at least one question in Firebase
- Check that the category ID matches your Firebase structure

**"Authentication failed"**
- Verify your email is in the ADMIN_EMAILS list
- Check that Firebase credentials are correct

**"Failed to generate questions"**
- Verify your OpenAI API key is valid
- Check that you have sufficient OpenAI credits
- Ensure the example question format is correct

## License

Private - Pitch Trivia

