# Environment Configuration for Railway

This document outlines the environment variables that need to be configured in Railway for the Newsletter Generator to function properly.

## Required Environment Variables

### Core Application
- `NODE_ENV=production`
- `PORT` (automatically provided by Railway)
- `DATABASE_URL` (automatically provided by Railway PostgreSQL)
- `JWT_SECRET` (generate a secure random string)

### AI Services
- `OPENAI_API_KEY` (Your OpenAI API key)
- `REPLICATE_API_TOKEN` (Your Replicate API token)
- `STABILITY_AI_API_KEY` (Your Stability AI API key)
- `AZURE_AI_FOUNDRY_ENDPOINT` (Your Azure AI endpoint)
- `AZURE_AI_FOUNDRY_KEY` (Your Azure AI key)

### Image Services
- `UNSPLASH_ACCESS_KEY` (Your Unsplash API key)
- `PEXELS_API_KEY` (Your Pexels API key)
- `PIXABAY_API_KEY` (Your Pixabay API key)
- `GIPHY_API_KEY` (Your Giphy API key)

### Additional APIs (Optional)
- `NEWS_API_KEY` (Your News API key)
- `YOUTUBE_API_KEY` (Your YouTube API key)
- `SERPAPI_KEY` (Your SerpAPI key)
- `REDDIT_CLIENT_ID` (Your Reddit client ID)
- `REDDIT_CLIENT_SECRET` (Your Reddit client secret)

### Google Services (Optional)
- `GOOGLE_DOCS_API_KEY` (For Google Docs export)
- `GOOGLE_CLIENT_ID` (For Google OAuth)
- `GOOGLE_CLIENT_SECRET` (For Google OAuth)

## How to Set in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add each environment variable with its corresponding value
5. Railway will automatically restart your service when variables are updated

## Security Notes

- Never commit API keys to your repository
- All sensitive data is stored securely in Railway's environment
- The application validates required environment variables on startup
- Missing critical API keys will prevent the application from starting in production

## Development vs Production

- Development: Uses `http://localhost:3000` for frontend
- Production: Uses Railway's provided URLs automatically
- CORS is configured to work with both environments
- Database connections are handled automatically by Railway
