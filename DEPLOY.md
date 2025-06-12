# Render.com Deployment Instructions for BOLAO Frontend

## Quick Deploy to Render.com

### Method 1: Web Service (Recommended)

1. **Connect your GitHub repository** to Render.com
2. **Create a new Web Service** with these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node
   - **Plan**: Free (or Starter for better performance)

3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://quiago-bolao-search.hf.space
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoicXVpYWdvIiwiYSI6ImNtYnNua2dlYzBua3Mybm9nZ2RhZ284ZzcifQ.6mICMI44zgWwWc_RYd4VYA
   HUGGING_FACE_TOKEN=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
   ```

### Method 2: Using render.yaml (Blueprint)

If you prefer using the `render.yaml` file included in this repository:

1. Push this repository to GitHub
2. In Render.com, select **"New Blueprint"**
3. Connect your repository
4. Render will automatically use the `render.yaml` configuration

### Method 3: Docker Deployment

If you prefer containerized deployment:

1. Create a new **Web Service** in Render.com
2. Select **"Deploy from Git"**
3. In the settings, choose **"Docker"** as the environment
4. Render will automatically use the included `Dockerfile`

## Environment Variables Required

Make sure to set these environment variables in your Render.com service:

- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: Your Hugging Face API endpoint
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox token
- `HUGGING_FACE_TOKEN`: Your Hugging Face token

## Post-Deployment

After successful deployment:

1. Your app will be available at: `https://your-service-name.onrender.com`
2. Test the search functionality
3. Verify map integration works
4. Check that API calls to Hugging Face are successful

## Troubleshooting

If you encounter issues:

1. Check the build logs in Render.com dashboard
2. Verify all environment variables are set correctly
3. Ensure your Hugging Face Space is public or properly authenticated
4. Check that all dependencies are listed in package.json

## Performance Tips

For better performance on Render.com:

1. Consider upgrading to a paid plan for faster builds
2. Enable automatic deploys for main branch
3. Set up custom domain if needed
4. Monitor your service health

## Support

If you need help with deployment, check:
- Render.com documentation
- Next.js deployment guides
- This project's GitHub issues
