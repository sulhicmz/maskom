#!/bin/bash
# Deployment script for preview environment

echo "Installing dependencies..."
npm install

echo "Building for preview environment..."
npx @opennextjs/cloudflare build

echo "Deploying to preview environment..."
npx wrangler deploy --env preview

echo "Preview deployment completed!"