# Deployment Procedures for Maskom

This document outlines the procedures for deploying the Maskom application to different environments using Cloudflare Workers.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Environments](#deployment-environments)
4. [Deployment Process](#deployment-process)
5. [Troubleshooting](#troubleshooting)
6. [Security Considerations](#security-considerations)

## Prerequisites

Before deploying, ensure you have:

- Node.js 20.x installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account with appropriate permissions
- Account ID and Zone ID for your domain
- Access to GitHub repository with secrets configured

## Environment Setup

### 1. Local Development Setup

```bash
npm install
```

### 2. Wrangler Authentication

```bash
wrangler login
```

### 3. Environment Configuration

Update `wrangler.toml` with your specific IDs:

- Replace `your-account-id-here` with your actual Cloudflare Account ID
- Replace `your-zone-id-here` with your actual Zone ID (for production routes)

## Deployment Environments

The project is configured for three deployment environments:

- **Development**: For development testing (`maskom-dev` worker)
- **Preview**: For staging and pre-production testing (`maskom-preview` worker)
- **Production**: Live production environment (`maskom` worker)

## Deployment Process

### 1. Development Deployment

To deploy to the development environment:

```bash
npm run deploy:dev
```

Or run the script directly:
```bash
bash scripts/deploy-dev.sh
```

### 2. Preview Deployment

To deploy to the preview environment:

```bash
npm run deploy:preview
```

Or run the script directly:
```bash
bash scripts/deploy-preview.sh
```

### 3. Production Deployment

⚠️ **Warning**: Production deployments affect the live site.

To deploy to the production environment:

```bash
npm run deploy:prod
```

Or run the script directly:
```bash
bash scripts/deploy-prod.sh
```

### 4. GitHub Actions Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- Deploys to preview environment on pull requests
- Deploys to production on pushes to the main branch
- Requires `CF_API_TOKEN` and `CF_ACCOUNT_ID` secrets in repository settings

## Security Considerations

### 1. Secrets Management

Store sensitive information as secrets, not in code:

- EmailJS credentials
- API keys
- Database connection strings

To set a secret:
```bash
wrangler secret put EMAILJS_SERVICE_ID
```

### 2. Environment Variables

Use environment-specific variables for different configurations:

- API endpoints
- Feature flags
- Environment-specific settings

Configure these in `wrangler.toml` under `[env.{environment}.vars]` sections.

### 3. Access Control

- Limit who can push to the main branch
- Use pull requests with code review for all changes
- Restrict access to Cloudflare dashboard and GitHub repository secrets

## Troubleshooting

### Common Issues

#### 1. Unauthorized Error
- Ensure `CLOUDFLARE_API_TOKEN` is correctly set in GitHub secrets
- Verify token has appropriate permissions

#### 2. Build Failures
- Check that all dependencies are installed
- Verify Node.js version compatibility (20.x required)
- Ensure all environment variables are correctly set

#### 3. Route Configuration Issues
- Confirm domain is added to Cloudflare account
- Verify Zone ID is correct in `wrangler.toml`
- Ensure DNS settings point to Cloudflare

### Getting Help

If you encounter issues:

1. Check Cloudflare Workers dashboard for error logs
2. Verify all configuration files are correctly set up
3. Review GitHub Actions logs for deployment errors
4. Consult the Cloudflare Workers documentation

## Rollback Procedure

To rollback to a previous version:

1. Identify the working commit in GitHub
2. Deploy that commit's build manually using Wrangler:
   ```bash
   git checkout <working-commit-hash>
   npm run deploy:prod
   ```

## Monitoring and Maintenance

### Post-Deployment Checks

After each deployment:

1. Verify the site loads correctly
2. Test all major functionality
3. Check browser console for errors
4. Confirm Analytics and tracking are working

### Deployment Verification

See `docs/monitoring.md` for comprehensive procedures on how to:

- Check deployment status using Wrangler commands
- Monitor application performance
- Verify domain routing
- Troubleshoot deployment issues
- Implement a verification checklist

### Regular Maintenance

- Monitor GitHub Action workflows for failures
- Review Cloudflare dashboard for performance metrics
- Update dependencies regularly
- Audit security settings periodically