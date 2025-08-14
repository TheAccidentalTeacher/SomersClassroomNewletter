# Railway Deployment Guide

## 🚀 Deploy to Railway

### Step 1: Prepare Your Repository
1. Push all code to GitHub
2. Ensure no API keys are in the code

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `SomersClassroomNewletter` repository

### Step 3: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically provide `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables
In Railway dashboard, go to Variables and add:

**Required API Keys:**
```
NODE_ENV=production
AZURE_AI_FOUNDRY_ENDPOINT=[your-azure-endpoint]
AZURE_AI_FOUNDRY_KEY=[your-azure-key]
AZURE_AI_FOUNDRY_KEY_2=[your-azure-key-2]
OPENAI_API_KEY=[your-openai-key]
REPLICATE_API_TOKEN=[your-replicate-token]
STABILITY_AI_API_KEY=[your-stability-ai-key]
GIPHY_API_KEY=[your-giphy-key]
NEWS_API_KEY=[your-news-api-key]
PEXELS_API_KEY=[your-pexels-key]
PIXABAY_API_KEY=[your-pixabay-key]
UNSPLASH_ACCESS_KEY=[your-unsplash-access-key]
UNSPLASH_SECRET_KEY=[your-unsplash-secret-key]
YOUTUBE_API_KEY=[your-youtube-key]
SERPAPI_KEY=[your-serpapi-key]
REDDIT_CLIENT_ID=[your-reddit-client-id]
REDDIT_CLIENT_SECRET=[your-reddit-client-secret]
JWT_SECRET=[generate-a-random-secret]
```

**Auto-provided by Railway:**
- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (Railway assigns this automatically)

### Step 5: Deploy
1. Railway will automatically deploy when you push to main branch
2. First deployment might take 5-10 minutes
3. Check the build logs in Railway dashboard

## 📝 Important Notes

- **Database**: Railway PostgreSQL is automatically configured
- **Build Process**: Railway will build both client and server automatically
- **Environment**: All API keys are stored securely in Railway
- **SSL**: Railway provides HTTPS automatically
- **Scaling**: Starts with 512MB RAM, can scale up as needed

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### App Won't Start
- Check environment variables are set correctly
- Verify DATABASE_URL is available
- Check server logs for errors
