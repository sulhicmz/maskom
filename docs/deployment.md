# Deployment Documentation

## Automated Deployment Workflow

### Status: ⏸️ Pending Manual Addition

The deployment workflow file (`.github/workflows/deploy.yml`) has been created but cannot be committed to git due to GitHub App permissions. The workflow file must be added manually to the repository.

### Workflow Content

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
  push:
    branches:
      - main

permissions:
  contents: read
  deployments: write

jobs:
  deploy:
    name: Deploy to Cloudflare
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30

    steps:
      - name: Checkout Code
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm test

      - name: Run Lint
        run: npm run lint

      - name: Build Application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Cloudflare Workers
        run: npm run deploy
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deployment Summary
        run: |
          echo "✅ Deployment completed successfully"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          echo "Deployed at: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

      - name: Notify on Failure
        if: failure()
        run: |
          echo "❌ Deployment failed"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          exit 1
```

### Setup Instructions

To enable automated deployment, follow these steps:

1. **Add Workflow File**:
   - Go to GitHub repository → Add file → Create new file
   - Name: `.github/workflows/deploy.yml`
   - Paste the YAML content above
   - Commit to `main` branch

2. **Configure GitHub Secrets**:
   The workflow requires these secrets to be configured:
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers/EDGES deployment permissions

   To add secrets:
   - Go to repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add each secret with its value

3. **Deployment Triggers**:
   - **Automatic**: Triggers on push to `main` branch
   - **Manual**: Can be triggered manually via GitHub Actions UI (workflow_dispatch)

### Deployment Pipeline

The deployment workflow follows this pipeline:

```
Push to main
    ↓
Checkout Code
    ↓
Setup Node.js (v22, npm cache)
    ↓
Install Dependencies (npm ci)
    ↓
Run Tests (npm test) → FAIL → Stop
    ↓
Run Lint (npm run lint) → FAIL → Stop
    ↓
Build Application (npm run build) → FAIL → Stop
    ↓
Deploy to Cloudflare (npm run deploy) → FAIL → Notify
    ↓
Deployment Summary
    ↓
✅ Production Live
```

### Benefits

1. **Zero-Downtime Deployment**: Deploys only after all validations pass
2. **Automated CI/CD**: Test → Lint → Build → Deploy in one pipeline
3. **Deployment Visibility**: GitHub Actions provides deployment logs and history
4. **Quality Gates**: Prevents broken code from reaching production
5. **Rollback Strategy**: Revert commit on failure triggers automatic rollback
6. **Timeout Protection**: 30-minute timeout prevents indefinite hangs

### Environment Variables

Required environment variables (configured via GitHub Secrets):

| Variable | Description | Required |
|----------|-------------|-----------|
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account ID | Yes |
| CLOUDFLARE_API_TOKEN | Cloudflare API token | Yes |
| NODE_ENV | Environment (set to production) | Yes (in workflow) |

### Monitoring

- **Deployment Status**: Check GitHub Actions tab for deployment runs
- **Logs**: Each deployment run has detailed logs for all steps
- **Notifications**: GitHub provides built-in notifications for deployment failures
- **Rollback**: Revert commit on `main` to rollback failed deployment

### Troubleshooting

**Deployment fails at "Run Tests"**:
- Check test output for failing tests
- Fix tests locally and commit again

**Deployment fails at "Deploy to Cloudflare"**:
- Verify CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are correct
- Check Cloudflare API token has Workers/EDGES deployment permissions
- Verify `wrangler.toml` configuration is correct

**No deployment triggered**:
- Verify workflow file exists in `.github/workflows/deploy.yml`
- Check GitHub Actions permissions for the repository
- Ensure `main` branch protection allows pushes

### Manual Deployment

If automated deployment is not available, deploy manually:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run lint
npm run lint

# Build
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Next Steps

- [ ] Manually add `.github/workflows/deploy.yml` to repository
- [ ] Configure CLOUDFLARE_ACCOUNT_ID secret
- [ ] Configure CLOUDFLARE_API_TOKEN secret
- [ ] Test deployment workflow with manual trigger
- [ ] Verify deployment on push to main branch

### Related Files

- `.github/workflows/deploy.yml` - Automated deployment workflow
- `package.json` - Deployment script (`npm run deploy`)
- `wrangler.toml` - Cloudflare Workers configuration
- `.env.example` - Environment variable documentation
