#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Vercel deployment..."

# Build the project
echo "🔨 Building the project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete! Your app should now be live at the URL provided above."
echo "Please update the VERCEL_URL in app/config.ts with your production URL if it wasn't automatically detected."
