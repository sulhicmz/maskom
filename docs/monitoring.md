# Monitoring and Checking Deployment Status for Maskom

This document outlines how to check the deployment status and monitor the Maskom application deployed on Cloudflare Workers.

## Checking Deployment Status with Wrangler

### 1. List Deployed Workers

To see all workers deployed under your account:

```bash
wrangler deployments list
```

This will show all recent deployments across all workers in your account.

### 2. Check Specific Worker Status

To check the status of your specific worker:

```bash
wrangler deploy --dry-run
```

This will simulate a deployment and show what would be deployed without actually deploying.

### 3. Check Worker Logs

To view recent logs from your worker:

```bash
wrangler tail
```

This will stream logs from the deployed worker in real-time. You can filter by environment:

```bash
wrangler tail --env production
```

### 4. Get Worker Information

To get information about the deployed worker:

```bash
wrangler info
```

Or for a specific environment:

```bash
wrangler info --env production
```

### 5. Check Workers in Cloudflare Dashboard

You can also check deployment status in the Cloudflare dashboard:

1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages
3. Select your "maskom" worker
4. Check the "Deployments" tab to see recent deployments
5. Check the "Metrics" tab to see performance metrics

## Verifying Domain Routing

### 1. Check Routes Configuration

To verify your domain routes:

```bash
wrangler routes list
```

This command shows all routes configured for your account.

### 2. Test Domain Access

Verify that your domain is properly routing to the worker:

```bash
curl -I https://maskom.co.id
curl -I https://www.maskom.co.id
```

Look for a 200 status response and check that the response comes from Cloudflare.

## Monitoring Performance

### 1. Check in Cloudflare Dashboard

1. Navigate to your Workers application in Cloudflare Dashboard
2. Go to "Metrics" to see:
   - Requests per second
   - Response times
   - Error rates
   - Data transferred

### 2. Monitor Logs for Errors

Use the tail command to monitor for runtime errors:

```bash
wrangler tail --format pretty
```

### 3. Health Checks

Implement and monitor health checks by periodically accessing:

```bash
curl https://maskom.co.id/api/health
```

(If you implement a health check endpoint)

## Troubleshooting Deployment Issues

### Common Commands for Troubleshooting

1. Check current configuration:
   ```bash
   wrangler whoami
   ```

2. Verify account and permissions:
   ```bash
   wrangler account list
   ```

3. Validate the wrangler.toml configuration:
   ```bash
   wrangler validate
   ```

4. Check build output:
   ```bash
   npx opennextjs-cloudflare build --verbose
   ```

### Common Issues and Solutions

1. **Authentication Issues**: If you get authentication errors, run `wrangler login` again.

2. **Permission Issues**: Ensure your API token has the correct permissions listed in the GitHub setup documentation.

3. **Route Configuration Issues**: Verify your domain is properly added to Cloudflare and DNS is pointing to Cloudflare nameservers.

## Deployment Verification Checklist

Use this checklist after each deployment:

- [ ] Worker deployed successfully without errors
- [ ] Domain routes are properly configured
- [ ] Site loads correctly in browser (maskom.co.id and www.maskom.co.id)
- [ ] All pages and features are working as expected
- [ ] SSL certificate is valid
- [ ] Response times are acceptable
- [ ] Logs show no errors
- [ ] Analytics and tracking are working
- [ ] Contact forms and other interactive elements are functional
- [ ] Images and assets are loading from the right domains