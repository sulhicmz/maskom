# Changelog

## [Unreleased]

### Fixed
- Fixed CI/CD workflow failures due to missing TypeScript type definitions for 'wow.js' module
- Added custom type declaration file for 'wow.js' to resolve build errors
- Updated tsconfig.json to include type declaration files
- Improved GitHub Actions workflow to handle missing type definitions gracefully

### Changed
- Enhanced deployment workflow in .github/workflows/deploy.yml with better error handling
- Added proper TypeScript configuration for third-party libraries without type definitions