#!/bin/bash
# Deployment script for production environment

echo "Installing dependencies..."
npm install

echo "Building for production environment..."
npx @opennextjs/cloudflare build

echo "Deploying to production environment..."
npx wrangler deploy --env production

echo "Production deployment completed!"