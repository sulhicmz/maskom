# User Journey Documentation

This directory contains user journey documentation and BDD-style test scenarios for the Maskom platform.

## Structure

```
user-journeys/
├── features/                    # Gherkin feature files
│   ├── authentication.feature   # User registration and login
│   ├── content-discovery.feature # Blog browsing and bookmarking
│   ├── contact-form.feature     # Contact form submission
│   ├── admin-dashboard.feature  # Admin dashboard usage
│   └── personalization.feature  # Personalization rule creation
├── test-coverage-matrix.md      # Test coverage analysis
└── README.md                    # This file
```

## Critical User Journeys

### 1. Authentication
User registration and login flows for accessing the platform.

**Key Pages:**
- `/sign-up` - User registration
- `/login` - User authentication

### 2. Content Discovery & Bookmarking
Blog browsing, reading, and saving content for later.

**Key Pages:**
- `/blog` - Blog listing
- `/blog-details` - Individual blog post
- `/bookmarks` - Saved posts

### 3. Contact Form Submission
User inquiry submission for service information.

**Key Pages:**
- `/contact` - Contact form

### 4. Admin Dashboard Usage
Platform management and monitoring for administrators.

**Key Pages:**
- `/admin/*` - Various admin sections
- `/dashboard` - User dashboard

### 5. Personalization Rule Creation
Content personalization configuration for content managers.

**Key Pages:**
- `/admin/personalization` - Personalization dashboard

## Using Feature Files

These Gherkin feature files can be used with:

1. **Cucumber.js** - JavaScript BDD framework
2. **Playwright** - With `@playwright/test` and Cucumber integration
3. **Cypress** - With `@badeball/cypress-cucumber-preprocessor`

### Example: Running with Cucumber.js

```bash
npm install --save-dev @cucumber/cucumber
npx cucumber-js docs/user-journeys/features/
```

## Contributing

When adding new user journeys:

1. Create a new `.feature` file in `features/`
2. Follow Gherkin syntax (Feature, Scenario, Given/When/Then)
3. Update the test coverage matrix
4. Ensure scenarios map to actual components

## Related Issues

- Issue #267: Define user journey tests for critical paths
