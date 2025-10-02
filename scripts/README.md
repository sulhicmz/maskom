# Deployment Scripts

This directory contains scripts to deploy the Maskom application to different environments using Wrangler.

## Available Scripts

- `deploy-dev.sh` - Deploy to the development environment
- `deploy-preview.sh` - Deploy to the preview environment  
- `deploy-prod.sh` - Deploy to the production environment

## Prerequisites

Before running these scripts, ensure:

1. You have logged in to Wrangler using `wrangler login`
2. Your `wrangler.toml` file has the correct account IDs and zone IDs
3. All necessary environment variables and secrets are properly configured

## Usage

Run the scripts from the project root:

```bash
bash scripts/deploy-dev.sh
```

## Environment Configuration

Make sure to update `wrangler.toml` with:

- Your actual Cloudflare Account ID in place of `your-account-id-here`
- Your actual Zone IDs in the routes section (for production only)