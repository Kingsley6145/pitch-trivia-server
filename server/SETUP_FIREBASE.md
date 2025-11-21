# Firebase Setup Guide

## Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Go to the "Service accounts" tab
6. Click "Generate new private key"
7. A JSON file will be downloaded

## Step 2: Create .env File

1. In the `server/` directory, create a file named `.env`
2. Copy the contents from `env.example`:

```bash
# On Mac/Linux:
cp env.example .env

# On Windows:
copy env.example .env
```

## Step 3: Fill in Your Firebase Credentials

Open the downloaded JSON file and copy the values:

```json
{
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
}
```

Update your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes
- Keep the `\n` characters in the private key (they represent newlines)
- The private key should be on a single line with `\n` characters

## Step 4: Add OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## Step 5: Verify Your .env File

Your complete `.env` file should look like:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# OpenAI API
OPENAI_API_KEY=sk-your-actual-openai-key

# Server
PORT=5000
NODE_ENV=development

# Admin Emails (comma-separated)
ADMIN_EMAILS=Games@pitchtrivia.com,games@pitchtrivia.com
```

## Troubleshooting

**Error: "Service account object must contain a string 'project_id' property"**
- Make sure your `.env` file exists in the `server/` directory
- Verify `FIREBASE_PROJECT_ID` is set (no quotes needed for the value)
- Check that there are no extra spaces around the `=` sign

**Error: "Invalid private key"**
- Make sure the private key is wrapped in double quotes
- Keep the `\n` characters (don't replace them with actual newlines)
- The entire key should be on one line

**Error: "The default Firebase app does not exist"**
- This usually means the initialization failed
- Check the error message above it for more details
- Verify all three Firebase credentials are correct

## Security Note

⚠️ **Never commit your `.env` file to git!** It contains sensitive credentials.
The `.gitignore` file is already configured to exclude `.env` files.

