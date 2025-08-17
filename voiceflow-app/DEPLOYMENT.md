# 🚀 VoiceFlow Deployment Guide

## ✅ Pre-Deployment Checklist
- [x] Build successful (npm run build ✓)
- [x] Production environment configured
- [x] Database schema updated for PostgreSQL
- [x] API modules handle missing environment variables

## Deployment Options

### 1. Vercel (Recommended - Easiest)

#### Option A: CLI Deployment
```bash
# 1. Login to Vercel
vercel login
# Choose your preferred method (GitHub, Google, etc.)

# 2. Deploy
vercel --prod

# 3. Follow prompts to configure project
```

#### Option B: Dashboard Deployment
1. Go to https://vercel.com
2. Sign up/Login
3. Click "New Project"
4. Import from GitHub repository
5. Configure environment variables
6. Deploy

#### Environment Variables for Vercel:
```
DATABASE_URL=<vercel-postgres-url>
NEXTAUTH_URL=<your-vercel-domain>
NEXTAUTH_SECRET=<generate-random-secret>
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
GOOGLE_CLIENT_ID=<your-google-oauth-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
GITHUB_CLIENT_ID=<your-github-oauth-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-secret>
```

### 2. Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --dir=.next
```

### 3. Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

### 4. Docker Deployment

```bash
# 1. Build Docker image
docker build -t voiceflow-app .

# 2. Run container
docker run -p 3000:3000 voiceflow-app

# 3. Or use Docker Compose
docker-compose up -d
```

## Post-Deployment Setup

### 1. Database Setup
After deployment, run database migrations:
```bash
npx prisma migrate deploy
```

### 2. Environment Variables
Add all required environment variables in your platform's dashboard:
- Database URL (platform will provide)
- NextAuth configuration
- API keys for OpenAI and Anthropic
- OAuth client credentials

### 3. Domain Configuration
- Update NEXTAUTH_URL to your production domain
- Update OAuth redirect URIs in Google/GitHub settings

### 4. Database Provider (Vercel)
Vercel offers integrated PostgreSQL:
1. Go to your project dashboard
2. Navigate to "Storage" tab
3. Create a PostgreSQL database
4. Copy the connection string to DATABASE_URL

## Testing Production Deployment

1. **Authentication**: Test login/logout
2. **Voice Recording**: Test recording interface
3. **File Upload**: Test drag & drop
4. **AI Features**: Test with API keys configured
5. **Database**: Verify recordings are saved

## Troubleshooting

### Common Issues:
1. **Build Errors**: Check environment variables
2. **Database Errors**: Verify DATABASE_URL format
3. **Auth Errors**: Check NEXTAUTH_URL and OAuth settings
4. **API Errors**: Verify OpenAI and Anthropic keys

### Logs:
- Vercel: View function logs in dashboard
- Check console for client-side errors
- Monitor API endpoint responses

## Production Optimizations

1. **CDN**: Files automatically cached via Vercel
2. **Performance**: Next.js optimizations included
3. **Security**: Environment variables secured
4. **Monitoring**: Set up error tracking (Sentry, etc.)

## Estimated Costs

### Vercel (Recommended)
- **Hobby Plan**: Free (limited usage)
- **Pro Plan**: $20/month (production apps)
- **Database**: $0.10/GB storage + compute

### Other Platforms
- **Netlify**: Free tier available
- **Railway**: $5/month starter
- **Docker**: Variable based on hosting

## Support

For deployment issues:
1. Check platform documentation
2. Review build logs
3. Verify environment variables
4. Test locally first

Happy deploying! 🚀