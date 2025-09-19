# Project Debug Rules (Non-Obvious Only)

- Responsive breakpoint logic uses 1200px threshold for mobile navigation (not standard 768px)
- Header sticky behavior depends on UseSticky hook which may not work in all browsers
- Font loading from Google Fonts in layout.tsx may cause layout shift issues
- Bootstrap 5.x integration requires specific CSS class combinations for proper styling
- SCSS imports from multiple directories (src/styles/ and public/assets/scss/) may cause style conflicts
- Data-driven components depend on exact TypeScript interface matching from src/data/ files