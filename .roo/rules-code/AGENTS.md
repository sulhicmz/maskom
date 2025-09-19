# Project Coding Rules (Non-Obvious Only)

- Always import static assets using `@/assets/*` path (maps to `public/assets/` not `src/assets/`)
- SCSS styles are located in `public/assets/scss/` and imported via `src/styles/index.scss`
- Use data-driven approach - all menu/content data comes from `src/data/` TypeScript files
- Component structure follows `src/components/[category]/[component]/index.tsx` pattern
- Headers/footers are separate from components in `src/layouts/` directory
- Bootstrap 5.x classes are used alongside custom SCSS mixins and variables
- Responsive breakpoint for mobile navigation is set at 1200px in component logic
- Font loading and meta tags are handled directly in `src/app/layout.tsx`
- Mixed styling approach: both `src/styles/` and `public/assets/scss/` are used
- Component props follow TypeScript interfaces defined within component files