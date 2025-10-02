#!/bin/bash
# Deployment script for development environment

echo "Building for development environment..."
npx @opennextjs/cloudflare build

echo "Deploying to development environment..."
npx wrangler deploy --env development

echo "Development deployment completed!"