# Checking Deployment Status with Wrangler

This document explains how to use Wrangler CLI to check the deployment status of the Maskom application on Cloudflare Workers.

## Prerequisites

Before checking deployment status, ensure:

1. You have Wrangler installed (`npm install -g wrangler`)
2. You are logged into your Cloudflare account (`wrangler login`)
3. You are in the project root directory

## Commands to Check Deployment Status

### 1. View Worker Information

To get information about your deployed worker:

```bash
wrangler whoami
```

This verifies your authentication and shows your account details.

### 2. List Deployed Workers

To see all deployed workers in your account:

```bash
wrangler list
```

### 3. Get Specific Worker Details

To get details about a specific worker:

```bash
wrangler deployment list --name maskom
```

Or for a specific environment:

```bash
wrangler deployment list --name maskom-dev
wrangler deployment list --name maskom-preview
wrangler deployment list --name maskom
```

### 4. Check Worker Logs

To monitor the deployed worker logs:

```bash
wrangler tail
```

This command shows live logs from your deployed worker. You can filter by environment:

```bash
wrangler tail --env production
```

### 5. View Current Deployment

To see information about the currently deployed version:

```bash
wrangler deployment list --name maskom --env production
```

### 6. Test the Deployment

To test if your deployment is working properly, visit:

- Development: `https://maskom-dev.{your-subdomain}.workers.dev`
- Preview: `https://maskom-preview.{your-subdomain}.workers.dev`
- Production: `https://maskom.{your-subdomain}.workers.dev` or your custom domain

## Using Wrangler for Troubleshooting

### 1. View Build Information

To check the build status:

```bash
# Build locally to ensure there are no errors
npx opennextjs-cloudflare build
```

### 2. Preview Deployment Locally

To preview your deployment locally before pushing:

```bash
npm run preview
```

### 3. Check Configuration

To validate your wrangler.toml configuration:

```bash
wrangler validate
```

## Common Deployment Status Checks

### 1. Verify Environment Variables

Check that environment variables are correctly set:

```bash
# This command helps verify that secrets are available
wrangler secret list
```

### 2. Verify Routes

Check if routes are properly configured:

```bash
# List all routes for your account
wrangler route list
```

### 3. Check Worker Analytics

To see basic analytics about your worker:

```bash
wrangler pages deployment list
```

## Deployment Verification Checklist

Before considering a deployment successful, verify:

- [ ] Worker builds without errors
- [ ] Worker deploys without errors
- [ ] Environment-specific variables are correctly set
- [ ] Routes are properly configured (for production)
- [ ] Application is accessible at the intended domain
- [ ] All functionality works as expected
- [ ] Logs show no errors after deployment

## Troubleshooting Deployment Issues with Wrangler

If deployment issues occur:

1. Check your account authentication: `wrangler whoami`
2. Validate your configuration: `wrangler validate`
3. Check for any active deployments that might conflict
4. Review logs using `wrangler tail`
5. Verify your account has sufficient permissions and quotas

## Accessing Custom Domains

For deployments to custom domains (maskom.co.id):

1. Verify the route is correctly configured in wrangler.toml
2. Check that DNS settings in your domain registrar point to Cloudflare
3. Confirm that SSL/TLS is properly configured in the Cloudflare dashboard
4. Test access to the custom domain to ensure routing works

## Security Considerations

- Keep API tokens secure and rotate them regularly
- Use environment-specific configurations for different deployment stages
- Regularly audit which workers have access to sensitive data
- Review route configurations to ensure they only serve intended traffic