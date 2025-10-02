# GitHub Repository Setup for Maskom

This document outlines the necessary GitHub repository settings and configurations for the Maskom project.

## Required Repository Secrets

The following secrets must be configured in the repository settings:

1. **CF_API_TOKEN** - Cloudflare API token with permissions to:
   - Account Workers Scripts: Write
   - Zone Workers Routes: Write
   - Account Workers KV Storage: Write (if using KV)
   - Account D1 Databases: Write (if using D1)
   - Account R2 Storage: Write (if using R2)

2. **CF_ACCOUNT_ID** - Your Cloudflare Account ID

### Setting up Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add the secrets listed above

## GitHub Actions Workflows

The repository includes a workflow file at `.github/workflows/deploy.yml` that:

- Runs on pushes to the main branch (deploys to production)
- Runs on pull requests (creates preview deployments)
- Performs build and deployment steps
- Includes secret validation

## Branch Protection Rules

Recommended branch protection rules for the `main` branch:

1. Require pull request reviews before merging
2. Require status checks to pass before merging
3. Require branches to be up to date before merging
4. Include administrators in restrictions

### Required Status Checks
- The deploy workflow should pass before merging

## Environment Configuration

You can set up GitHub Environments for additional security:

1. Create environments: `development`, `preview`, `production`
2. Configure environment-specific secrets if needed
3. Set deployment branch policies
4. Configure required reviewers for production deployments

## Security Recommendations

1. Enable 2FA for all contributors
2. Regularly audit repository access
3. Monitor deployment logs
4. Keep dependencies updated
5. Review pull requests carefully before merging
6. Use signed commits

## Webhook Configuration

No additional webhooks are required beyond the standard GitHub Actions integration with Cloudflare.

## Troubleshooting

### Workflow Failures

If GitHub Actions workflows fail:

1. Check the workflow logs in the Actions tab
2. Verify all required secrets are set
3. Confirm the API token has correct permissions
4. Check that the account ID is valid

### Permission Issues

Ensure the Cloudflare API token has sufficient permissions. Common required permissions:

- Workers Scripts: Write
- Workers Routes: Write
- Account Settings: Read