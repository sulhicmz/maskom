# To-Do List for Maskom Repository

## HIGH Priority
- [x] Refactor EmailJS credentials from `src/components/forms/ContactForm.tsx` to environment variables. (Security Risk)
- [x] Update `README.md` to reflect that EmailJS credentials are now environment variables.
- [x] Commit uncommitted changes to `README.md` and `todo.md`.
- [x] Commit uncommitted changes to `todo.md` and push to remote.
- [ ] Verify Cloudflare deployment configuration so `_next` assets remain relative in all environments.

## MEDIUM Priority
- [x] Review and update dependencies for outdated or vulnerable packages.
- [x] Remove unused template pages and related dependencies to reduce the bundle size.
- [ ] Update documentation to note the dark theme is now the default homepage experience.

## LOW Priority
- [x] Improve CI/CD feedback with notifications or status checks.
- [x] Add unit/integration tests for critical components.
- [ ] Replace deprecated Sass `@import` usage with `@use`/`@forward` across stylesheets.
