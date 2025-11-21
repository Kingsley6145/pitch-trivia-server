# Pitch Trivia - Question Generator

An AI-powered question generation tool for Pitch Trivia admin panel. This application allows admins to generate trivia questions using AI based on example questions from existing question banks.

## Project Structure

```
Pitch Trivia server/
└── client/                 # React frontend (standalone)
    ├── src/
    │   ├── App.jsx        # Main app with routing
    │   ├── index.js       # React entry point
    │   ├── firebase/
    │   │   └── config.js  # Firebase client config
    │   ├── app/pages/
    │   │   ├── Login.jsx  # Login page
    │   │   └── Generator.jsx  # Main generator interface
    │   ├── services/
    │   │   ├── api.js           # API service layer
    │   │   ├── firebaseService.js  # Firebase Realtime DB operations
    │   │   └── aiService.js     # Google Gemini AI integration
    │   └── utils/
    │       └── adminAuth.js  # Client-side auth utilities
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env.example
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
- Google Gemini API key

### Quick Start

**1. Install Dependencies**

From the root directory:
```bash
npm run install:all
```

Or from the client directory:
```bash
cd client
npm install
```

**2. Configure Environment Variables**

Create a `.env` file in the `client` directory based on `.env.example`:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# Google Gemini API
REACT_APP_GEMINI_API_KEY=your-gemini-api-key
```

**Getting Firebase Configuration:**
1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>) or create a new web app
4. Copy the configuration values to your `.env` file

**Getting Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `REACT_APP_GEMINI_API_KEY` in your `.env` file

**3. Run the Application**

From the root directory:
```bash
npm run dev
```

Or from the client directory:
```bash
cd client
npm run dev
```

The application will open at `http://localhost:3000`.

## How It Works

1. **Login**: Admin logs in with whitelisted email
2. **Select Category**: Choose a category from the sidebar
3. **View Example**: System displays an example question from that category
4. **Generate**: Click "Generate 9 Questions" to create AI-generated questions
5. **Review**: Review the generated questions
6. **Save**: Click "Save All Questions" to add them to Firebase

## Architecture

This is a standalone React application that:
- Connects directly to Firebase Realtime Database using the Firebase Client SDK
- Uses Google Gemini AI for question generation (runs in the browser)
- Performs all operations client-side with admin authentication checks
- No backend server required!

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

- Admin access is controlled by email whitelist (configured in `client/src/utils/adminAuth.js`)
- All operations require Firebase authentication
- Firebase Client SDK is used for all database operations
- Admin checks are performed client-side before any operations
- **Important**: The Gemini API key is exposed in the client bundle. For production, consider using Firebase Cloud Functions or another backend service to protect the API key.

## Troubleshooting

**"No example question found"**
- Ensure the category has at least one question in Firebase
- Check that the category ID matches your Firebase structure

**"Authentication failed"**
- Verify your email is in the ADMIN_EMAILS list
- Check that Firebase credentials are correct

**"Failed to generate questions"**
- Verify your Gemini API key is valid (check `.env` file)
- Check that you have sufficient Gemini API quota
- Ensure `REACT_APP_GEMINI_API_KEY` is set in your `.env` file
- Restart the development server after adding/changing environment variables

## License

Private - Pitch Trivia

