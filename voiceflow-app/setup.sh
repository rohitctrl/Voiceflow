#!/bin/bash

echo "🚀 Setting up VoiceFlow development environment..."

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js - Required for authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="demo-voiceflow-secret-$(date +%s)"

# OAuth Providers (optional - leave empty to use demo mode only)
# To enable Google OAuth:
# 1. Go to https://console.cloud.google.com
# 2. Create OAuth 2.0 credentials
# 3. Add http://localhost:3000/api/auth/callback/google as redirect URI
# 4. Uncomment and fill the values below:
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# To enable GitHub OAuth:
# 1. Go to https://github.com/settings/developers
# 2. Create new OAuth App
# 3. Set Authorization callback URL to http://localhost:3000/api/auth/callback/github
# 4. Uncomment and fill the values below:
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI APIs (required for transcription and processing)
# Get your keys from:
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com/
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
EOL
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client and set up database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Build the project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 To start the development server:"
echo "   npm run dev"
echo ""
echo "🔗 Then open http://localhost:3000 in your browser"
echo ""
echo "💡 The app includes a demo mode that works without OAuth configuration"
echo "   Just click 'Try Demo' on the sign-in page!"
