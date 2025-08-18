# OAuth Setup Guide for VoiceFlow

## Quick Start (Demo Mode)

**No configuration needed!** Just run:
```bash
npm run dev
```
Then click **"Try Demo"** on the signin page.

## Optional: OAuth Providers Setup

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

4. **Update Environment Variables**
   ```bash
   # In .env.local
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Configure OAuth App**
   - Application name: "VoiceFlow"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Update Environment Variables**
   ```bash
   # In .env.local
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

## Troubleshooting

### "Sign In Error" Issues

1. **Check Environment Variables**
   ```bash
   # Make sure .env.local exists and has:
   NEXTAUTH_SECRET="some-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Demo Mode Not Working**
   - Restart the development server
   - Clear browser cache/cookies
   - Check browser console for errors

3. **OAuth Redirect Issues**
   - Verify redirect URIs match exactly
   - Check that OAuth apps are enabled
   - Ensure client IDs and secrets are correct

### Common Errors

**"Configuration" Error**
- Missing or invalid OAuth credentials
- **Solution**: Use demo mode or fix OAuth setup

**"OAuthCallback" Error**
- Redirect URI mismatch
- **Solution**: Update redirect URIs in OAuth provider settings

**"undefined" Error**
- NextAuth configuration issue
- **Solution**: Restart server, check environment variables

## Production Deployment

For production, you'll need to:

1. **Update redirect URIs** to your production domain
2. **Set secure NEXTAUTH_SECRET**
3. **Use production OAuth credentials**
4. **Enable HTTPS**

## Support

If you're still having issues:
1. Try demo mode first (no config needed)
2. Check browser developer console for errors
3. Verify all environment variables are set correctly
