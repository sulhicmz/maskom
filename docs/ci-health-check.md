# CI/CD Health Check Guide

## Quick Health Check

### 1. Verify CI Build Status
```bash
# Check recent workflow runs
gh run list --limit 10

# Check if all workflows are passing
gh run list --workflow=on-push --json conclusion --jq '.[] | select(.conclusion != "success")'
gh run list --workflow=on-pull --json conclusion --jq '.[] | select(.conclusion != "success")'
```

### 2. Verify Test Suite Health
```bash
# Run full test suite
npm test

# Check test count
npm test -- --verbose 2>&1 | grep -E "Tests:|Test Suites:"

# Expected output:
# Tests:       6250 passing
# Test Suites: 240 passing
```

### 3. Verify Lint Status
```bash
# Run linting
npm run lint

# Should return with no errors
# Expected: 0 errors
```

### 4. Check for Security Vulnerabilities
```bash
# Run npm audit
npm audit --audit-level=moderate

# Should report 0 vulnerabilities
# Expected: found 0 vulnerabilities
```

### 5. Verify Build Success
```bash
# Build production bundle
npm run build

# Should complete successfully
# Check .next/ directory was created
ls -la .next/
```

## CI Health Checklist

Use this checklist to verify CI health:

### Build Health
- [ ] Test suite passes (6250/6250 tests)
- [ ] Lint passes with 0 errors
- [ ] TypeScript compilation succeeds
- [ ] npm audit shows 0 vulnerabilities
- [ ] Next.js build completes successfully
- [ ] No console errors in test output

### Workflow Health
- [ ] on-push workflow runs on push
- [ ] on-pull workflow runs on PR
- [ ] workflow-monitor runs every 30 minutes
- [ ] All workflows complete within timeout limits
- [ ] Cache hit rate is high (>80%)

### Monitoring Health
- [ ] Workflow summaries are generated
- [ ] Failures are logged as warnings/errors
- [ ] Duration tracking is working
- [ ] Open issues and PRs are monitored

## Troubleshooting CI Issues

### Flaky Tests

**Symptoms**: Tests pass locally but fail intermittently in CI

**Solutions**:
1. Check for timing issues (setTimeout, async/await)
2. Verify test isolation (cleanup in afterEach)
3. Check for external dependencies (network, time)
4. Review test data randomness
5. Increase test timeout if needed

### Cache Issues

**Symptoms**: CI builds are slow or cache not restored

**Solutions**:
1. Check cache key format
2. Verify cache paths are correct
3. Clear cache by incrementing key version
4. Check cache size limits (GitHub: 10GB)
5. Verify cache compression is working

**Proposed Enhanced Caching** (requires workflows permission):
- Add Next.js build cache (`.next/cache`)
- Add Jest test cache (`~/.cache/jest`)
- Upgrade cache key to v2

### Build Failures

**Symptoms**: Build fails but code is correct

**Solutions**:
1. Check for memory issues (node_modules size)
2. Verify environment variables
3. Check for network timeouts
4. Review dependency installation logs
5. Try running with --force flag

### Timeout Issues

**Symptoms**: Workflow exceeds timeout limit

**Solutions**:
1. Identify slow steps (check logs)
2. Optimize test execution (parallelization)
3. Improve cache hit rate
4. Reduce dependencies
5. Consider splitting workflow

## Performance Optimization

### Improve Cache Hit Rate
```bash
# Cache keys should include:
# 1. OS: runner.os
# 2. Dependencies: hashFiles('**/package-lock.json')
# 3. Version: Increment when cache structure changes

# Current keys:
# opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
```

**Proposed Enhanced Caching** (requires workflows permission):
```yaml
# Add to .github/workflows/on-push.yml and on-pull.yml
- name: Setup Enhanced Cache
  uses: actions/cache@v5
  with:
    path: |
      ~/.opencode
      ~/.npm
      ~/.cache/jest      # Add this
      .next/cache         # Add this
    key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v2  # Upgrade to v2
    restore-keys: |
      opencode-${{ runner.os }}-v2
      opencode-${{ runner.os }}-v1
```

### Reduce Test Execution Time
```bash
# Run specific test suite
npm test -- --testPathPattern=utils

# Run tests in parallel (if configured)
npm test -- --maxWorkers=4

# Run only changed files
npm test -- --onlyChanged

# Run tests with coverage
npm test -- --coverage
```

### Optimize Build Time
```bash
# Use Turbopack (already enabled in next.config.ts)
# Next.js 15+ uses Turbopack by default in dev mode

# Analyze bundle size
npm run analyze

# Optimize images (use WebP, AVIF)
# Minimize dependencies
# Use dynamic imports for large libraries
```

## CI/CD Best Practices

### 1. Fail Fast
- Run linting before tests
- Run quick tests before integration tests
- Fail early on obvious issues

### 2. Parallelize When Possible
- Independent workflows can run concurrently
- Matrix strategy for multiple configurations
- Parallel test execution

### 3. Cache Everything
- npm dependencies (~/.npm)
- Build artifacts (.next/cache) - **Not yet applied**
- Test caches (~/.cache/jest) - **Not yet applied**
- Custom tool caches (~/.opencode)

### 4. Monitor Metrics
- Workflow duration trends
- Test execution time
- Cache hit rates
- Failure frequency

### 5. Keep Builds Deterministic
- Lock file version (package-lock.json)
- Consistent Node.js version
- Fixed dependency versions in overrides
- Reproducible builds

## Emergency Procedures

### CI is Down

1. **Assess Impact**:
   ```bash
   gh run list --limit 5
   ```

2. **Check Status Page**:
   - GitHub Actions Status: https://www.githubstatus.com/
   - NPM Status: https://status.npmjs.org/

3. **Re-run Failed Workflow**:
   ```bash
   gh run rerun <run-id>
   ```

4. **If Still Failing**:
   - Disable affected workflow temporarily
   - Create issue documenting outage
   - Monitor status page for resolution

### Deployment Failed

1. **Rollback Immediately**:
   - Revert last commit if production is affected
   - Use cloudflare rollback if using Cloudflare Pages
   - Monitor user reports

2. **Investigate Root Cause**:
   - Review build logs
   - Check recent changes
   - Test locally

3. **Fix and Redeploy**:
   - Fix issue
   - Run full test suite
   - Deploy with monitoring

### Tests Suddenly Failing

1. **Isolate Failing Test**:
   ```bash
   npm test -- --testNamePattern="<failing test>"
   ```

2. **Check for Recent Changes**:
   - Review recent commits
   - Check dependency updates
   - Verify test data

3. **Local Verification**:
   - Clean cache: `rm -rf .next node_modules`
   - Reinstall: `npm ci`
   - Run tests: `npm test`

4. **Fix or Quarantine**:
   - Fix legitimate test issues
   - Skip known flaky tests (temporary)
   - Document quarantine reason

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

### Tools
- [GitHub CLI](https://cli.github.com/)
- [GitHub Actions Cache](https://github.com/actions/cache)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Monitoring
- [GitHub Status](https://www.githubstatus.com/)
- [NPM Status](https://status.npmjs.org/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

## Contact

For CI/CD issues:
1. Check this documentation first
2. Review GitHub Actions logs
3. Create issue with steps to reproduce
4. Tag with `ci` label and P1 priority

## Permissions Note

**Current Limitation**: GitHub App does not have `workflows` permission

**Impact**: Cannot modify workflow files (`.github/workflows/*.yml`) to:
- Add enhanced caching strategy
- Add CI monitoring workflow
- Implement duration tracking
- Add Slack notifications

**Workaround**: Proposed optimizations documented in:
- `docs/ci-status.md` - Status dashboard with proposed changes
- `docs/ci-health-check.md` - This guide with proposed caching

**Next Steps**: Request `workflows` permission from repository owner to implement proposed optimizations.
