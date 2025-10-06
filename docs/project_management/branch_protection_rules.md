# Branch Protection Rules for Maskom Repository

## Overview
This document outlines the recommended branch protection rules for the Maskom repository to ensure code quality, security, and collaboration.

## Main Branch Protection

### Required Settings
1. **Protect the `main` branch**
   - Enable "Branch protection rules" for `main`
   - This prevents force pushes and deletion of the main branch

2. **Require pull request reviews before merging**
   - Require at least 1 reviewer for all pull requests
   - Approve own code changes (disable this option to ensure another team member reviews)
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from code owners if CODEOWNERS file is implemented

3. **Require status checks to pass before merging**
   - Require `test` job to pass
   - Require `lint` job to pass
   - Require `type-check` job to pass
   - Allow specific labels to bypass required status checks (for emergency fixes)

4. **Require branches to be up to date before merging**
   - Enable "Require branches to be up to date before merging"
   - This ensures PRs include the latest changes from the base branch

5. **Restrict who can push to matching branches**
   - Limit push access to repository maintainers
   - Allow specified users, teams, or apps to bypass restrictions

### Additional Recommended Settings
1. **Lock branch settings**
   - Consider locking the main branch to prevent force pushes even by administrators
   - Enable this after configuration is finalized

2. **Code owner reviews**
   - Implement CODEOWNERS file to ensure relevant team members review code
   - This adds an additional layer of expertise review

3. **Up to date base requirement**
   - Enable "Require conversation resolution before merging"
   - This ensures all conversations in the PR are resolved before merging

## Feature Branch Strategy

### Naming Convention
- Use descriptive names with issue numbers: `feature/issue-123-add-contact-form`
- Use prefixes: `feature/`, `bugfix/`, `hotfix/`, `chore/`, `docs/`

### Pull Request Requirements
- Link to related issue (if exists) using "Closes #issue-number" in PR description
- Follow conventional commit standards in PR title
- Include testing instructions if applicable
- Update documentation if necessary

## Code Review Process

### Reviewer Checklist
- [ ] Code follows project's style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated if needed
- [ ] No conflicts exist with base branch
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed
- [ ] Accessibility standards are met (if applicable)

### Pull Request Author Checklist
- [ ] Created from an issue or discussed in advance
- [ ] All automated checks pass
- [ ] Self-reviewed code before requesting review
- [ ] Added appropriate labels
- [ ] Assigned relevant reviewers

## Implementation Steps

1. Navigate to repository Settings > Branches
2. Click "Add rule" for the `main` branch
3. Configure settings as outlined above
4. Save the branch protection rule
5. Test the rule with a sample pull request
6. Update team members about the new requirements

## Emergency Procedures

For critical issues requiring immediate fixes:
1. Create an emergency PR with clear justification
2. Tag team leads directly for expedited review
3. Optionally bypass some requirements with team approval
4. Document the emergency change in the project log

## Review Schedule

- Review these protection rules quarterly
- Adjust settings based on team size and project needs
- Update documentation when rules change