# Project Architecture Rules (Non-Obvious Only)

- Next.js app directory structure with mixed data-driven and component-driven patterns
- Public assets directory contains both images and SCSS (unconventional for Next.js)
- Layout system separates headers/footers from page components using src/layouts/
- Component organization follows template category structure rather than feature-based
- TypeScript path mappings create abstraction layer for asset imports
- Data layer in src/data/ serves as single source of truth for all dynamic content
- Mixed styling system requires coordination between src/styles/ and public/assets/scss/