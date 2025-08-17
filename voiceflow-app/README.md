# VoiceFlow - From thought to text in seconds

A modern, production-ready voice notes application built with Next.js 14, featuring AI-powered transcription and intelligent text processing.

## ✨ Features

- **🎙️ Real-time Voice Recording** - High-quality recording with live waveform visualization
- **📁 File Upload Support** - Drag & drop for MP3, WAV, M4A, WebM files
- **🤖 AI Transcription** - OpenAI Whisper integration for accurate speech-to-text
- **🧠 Smart Text Processing** - Anthropic Claude for text cleaning, summaries, and key points
- **📱 Responsive Design** - Mobile-first approach with smooth animations
- **🌙 Dark/Light Mode** - Theme switching with system preference detection
- **🔐 Secure Authentication** - Google & GitHub OAuth integration
- **📊 Recording Management** - Search, organize, and export your recordings
- **🚀 Production Ready** - Docker support, Vercel deployment, and optimized builds

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM (SQLite dev / PostgreSQL prod)
- **AI Services**: OpenAI Whisper API, Anthropic Claude API
- **Deployment**: Vercel, Docker

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voiceflow-app.git
   cd voiceflow-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # AI APIs
   OPENAI_API_KEY="your-openai-api-key"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
voiceflow-app/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── voice/            # Voice recording components
│   │   ├── upload/           # File upload components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── auth/             # Authentication components
│   │   ├── theme/            # Theme components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── ...config files
```

## 🔧 Configuration

### OAuth Setup

1. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

2. **GitHub OAuth**
   - Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
   - Create a new OAuth App
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### API Keys

1. **OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Create an account and generate an API key
   - Ensure you have access to the Whisper API

2. **Anthropic API Key**
   - Visit [Anthropic Console](https://console.anthropic.com)
   - Create an account and generate an API key
   - Ensure you have access to Claude models

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Docker

1. **Build the image**
   ```bash
   docker build -t voiceflow-app .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Database

For production, switch from SQLite to PostgreSQL:

1. **Update your DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

2. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

## 🔒 Security Features

- **Authentication**: Secure OAuth implementation with NextAuth.js
- **Data Validation**: Input validation and sanitization
- **CORS Protection**: Configured API route protection
- **Environment Variables**: Sensitive data stored securely
- **Type Safety**: Full TypeScript implementation

## 📝 API Documentation

### Transcription Endpoint
```typescript
POST /api/transcribe
Content-Type: multipart/form-data

Body: FormData with 'audio' file

Response: {
  transcript: string
  duration: number
  language: string
  wordCount: number
}
```

### Text Processing Endpoint
```typescript
POST /api/process-text
Content-Type: application/json

Body: {
  transcript: string
}

Response: {
  title: string
  cleanedText: string
  summary: string
  keyPoints: string[]
  tags: string[]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@voiceflow.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/voiceflow-app/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/voiceflow-app/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [OpenAI](https://openai.com/) - Whisper API for speech-to-text
- [Anthropic](https://anthropic.com/) - Claude API for text processing
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Vercel](https://vercel.com/) - Deployment platform

---

Made with ❤️ by the VoiceFlow team