# 🚀 Netlify Deployment Guide

Complete guide to deploy your Voiceflow app on Netlify with Next.js runtime.

## 📋 Prerequisites

- [ ] Netlify account
- [ ] PostgreSQL database (Supabase/Neon recommended)
- [ ] OpenAI or Anthropic API key
- [ ] Git repository (GitHub/GitLab)

## 🗄️ Step 1: Set Up Database

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) → Create project
2. Copy the connection string from Settings → Database
3. Format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### Option B: Neon
1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string
3. Format: `postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require`

## 🔑 Step 2: Generate Required Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Save this value - you'll need it for NEXTAUTH_SECRET
```

## 🌐 Step 3: Deploy to Netlify

### Option A: Git-based Deployment (Recommended)

1. **Push to Git:**
   ```bash
   cd "/Users/rohit/Desktop/C L A U D E /Voiceflow/voiceflow-app"
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) → New site from Git
   - Connect your repository
   - Build settings are auto-detected from `netlify.toml`

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --build --prod
```

## ⚙️ Step 4: Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

### 🔒 Required Variables
```bash
NEXTAUTH_SECRET="your-generated-secret-from-step-2"
NEXTAUTH_URL="https://your-site-name.netlify.app"
NODE_ENV="production"
DATABASE_URL="your-postgresql-connection-string"
OPENAI_API_KEY="sk-your-openai-key" # OR Anthropic key
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key" # OR OpenAI key
```

### 📁 File Upload Variables
```bash
MAX_FILE_SIZE="25000000"
ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp4,audio/m4a,audio/webm,audio/opus,audio/ogg"
```

### 🔗 Optional OAuth Variables
```bash
# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (if using)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🗃️ Step 5: Run Database Migration

After deployment, your app will automatically run database migrations on the first build.

To run manually:
```bash
# If you need to run migration locally first
DATABASE_URL="your-postgresql-url" npm run migrate:postgresql
```

## 🔧 Step 6: Configure OAuth (Optional)

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect: `https://your-site.netlify.app/api/auth/callback/google`

### GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app
3. Authorization callback URL: `https://your-site.netlify.app/api/auth/callback/github`

## 📊 Step 7: Monitor Deployment

1. **Check Build Logs:**
   - Netlify dashboard → Deploys → View build log
   - Look for any errors during build/migration

2. **Test Key Features:**
   - [ ] Authentication works
   - [ ] File upload works
   - [ ] AI transcription works
   - [ ] Database operations work

## 🚨 Troubleshooting

### Build Fails
```bash
# Check build command in netlify.toml
[build]
  command = "npm run netlify:build"
```

### Database Connection Issues
- Verify DATABASE_URL format
- Check database allows connections from Netlify IPs
- Ensure SSL mode is enabled: `?sslmode=require`

### Function Timeout
- Large files may exceed 30s timeout
- Consider chunked upload for large files
- Check function logs in Netlify dashboard

### Environment Variables Not Loading
- Verify variable names match exactly
- Check for typos in Netlify dashboard
- Clear build cache and redeploy

## 📈 Performance Optimization

1. **Enable Branch Previews:** 
   - Netlify will create preview deployments for branches

2. **Configure Caching:**
   - Static assets are cached automatically
   - API responses can be cached with headers

3. **Monitor Usage:**
   - Check Netlify Analytics for performance metrics
   - Monitor function execution times

## 🔄 Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Netlify will auto-deploy
```

## 📞 Support

- **Build Issues:** Check Netlify build logs
- **Database Issues:** Check database provider logs
- **Function Errors:** Netlify Functions logs
- **AI API Issues:** Check API provider status

## ✅ Deployment Checklist

- [ ] Database configured and accessible
- [ ] All required environment variables set
- [ ] Build completes successfully  
- [ ] Authentication works
- [ ] File upload works
- [ ] AI processing works
- [ ] OAuth configured (if using)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

Your Voiceflow app should now be live on Netlify! 🎉

---

## 📁 File Storage Notice

Your app currently stores files locally, which won't persist on Netlify. For production, consider:

1. **Netlify Blobs** (recommended for Netlify)
2. **AWS S3** (more storage options)
3. **Cloudinary** (image/video processing)

See `src/lib/serverless-storage.ts` for storage abstraction layer.