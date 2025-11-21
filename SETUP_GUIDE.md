# Quick Setup Guide

## Step 1: Install Dependencies

### Server
```bash
cd server
npm install
```

### Client
```bash
cd client
npm install
```

## Step 2: Configure Firebase

### Server Configuration

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Create `server/.env` file with:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
OPENAI_API_KEY=sk-your-openai-api-key
PORT=5000
NODE_ENV=development
ADMIN_EMAILS=Games@pitchtrivia.com,games@pitchtrivia.com
```

**Important**: The `FIREBASE_PRIVATE_KEY` should include the full key with `\n` characters preserved.

### Client Configuration

1. Go to Firebase Console → Project Settings → General
2. Copy your Firebase config values
3. Create `client/.env` file with:

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

## Step 3: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to `server/.env` as `OPENAI_API_KEY`

## Step 4: Run the Application

### Terminal 1 - Server
```bash
cd server
npm start
```

### Terminal 2 - Client
```bash
cd client
npm start
```

## Step 5: Access the Application

1. Open http://localhost:3000
2. Login with your admin email (must be in ADMIN_EMAILS list)
3. Select a category
4. View the example question
5. Click "Generate 9 Questions"
6. Review and save the generated questions

## Troubleshooting

**Server won't start:**
- Check that `.env` file exists in `server/` directory
- Verify Firebase credentials are correct
- Ensure PORT 5000 is not in use

**Client won't connect:**
- Verify `REACT_APP_API_URL` points to `http://localhost:5000/api`
- Check that server is running
- Verify Firebase config in `client/.env`

**Authentication fails:**
- Ensure your email is in the `ADMIN_EMAILS` list
- Check Firebase Auth is enabled in Firebase Console
- Verify email/password authentication is enabled

**AI generation fails:**
- Verify OpenAI API key is valid
- Check you have OpenAI credits
- Ensure example question exists in the category

