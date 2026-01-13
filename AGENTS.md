# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project-Specific Patterns (Non-Obvious)

 - **Asset Path Mapping**: Use `@/assets/*` imports for static assets located in `public/assets/` (not `src/assets/`)
 - **SCSS Organization**: Main SCSS files are in `public/assets/scss/` with modular imports, not in `src/`
 - **Data-Driven Components**: All dynamic content uses TypeScript data files in `src/data/` (MenuData.ts, BlogData.ts, etc.)
 - **Mixed Styling**: Styles imported from both `src/styles/index.scss` and `public/assets/scss/style.scss`
 - **Component Structure**: Organized as `src/components/[category]/[component]/` with index.tsx exports
 - **Layout Pattern**: Headers/footers in `src/layouts/` with separate Menu components
 - **Page Layout Builder**: All page index files in `src/components/pages/*/` use PageBuilder component for consistent layout structure
 - **Bootstrap Integration**: Uses Bootstrap 5.x classes alongside custom SCSS
 - **Font Loading**: Google Fonts loaded directly in layout.tsx head section

## Development Commands

- **Lint**: `npm run lint`
- **Lint with Auto-fix**: `npm run lint:fix`
- **Install Dependencies**: Use `npm install`
- **Local Build**: `npm run build` followed by `npm run start` for production testing

## Configuration Notes

- **TypeScript Paths**: Configured in tsconfig.json with `@/*` mapping to `./src/*`
- **ESLint**: Uses Next.js flat config with TypeScript support
- **SCSS Variables**: Located in `public/assets/scss/_variables.scss`
- **Responsive Breakpoints**: Custom breakpoint at 1200px for mobile navigation