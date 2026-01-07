# Blueprint - Architectural Overview

## Project Structure

```
maskom/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (organized by category)
│   ├── data/            # Static TypeScript data files
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout components (headers, footers, wrapper)
│   ├── modals/          # Modal components
│   └── styles/          # SCSS entry points
├── public/              # Static assets, _headers for Cloudflare
└── docs/               # Architecture decisions, operations docs
```

## Core Principles

1. **Data-Driven UI**: All dynamic content comes from TypeScript data files in `src/data/`
2. **Component Organization**: Components organized as `src/components/[category]/[component]/`
3. **Path Aliases**: `@/*` → `./src/*`, `@/assets/*` → `./public/assets/*`
4. **Client/Server Separation**: Components use `"use client"` directive appropriately
5. **Edge Runtime**: Support for both edge and nodejs_compat runtimes for Cloudflare Workers

## Data Flow Pattern

```
Data Files (src/data/*.ts)
    ↓
Components (filter by page property)
    ↓
Pages/Sections
    ↓
Layout/Wrapper
```

## Architectural Patterns

### Good Patterns (Maintain)
- ✅ Data-driven content management
- ✅ Component modularity with clear separation
- ✅ TypeScript interfaces for data structures
- ✅ Environment variables for sensitive data
- ✅ Clean file organization by category

### Anti-Patterns (Fix)
- ❌ Business logic in presentation components (ContactForm)
- ❌ Direct third-party library usage without abstraction
- ❌ Duplicate code across components (resize handlers)
- ❌ Hardcoded filter logic in multiple places
- ❌ Missing service layer for external APIs

## Key Dependencies

- **Framework**: Next.js 15 (App Router)
- **Deployment**: OpenNext for Cloudflare Workers
- **UI Libraries**: Bootstrap 5, Swiper, Isotope
- **Forms**: React Hook Form, Yup validation
- **Email**: EmailJS (via service abstraction)
- **Animations**: WOW.js, React Toastify

## Technical Constraints

- Cloudflare Workers runtime compatibility
- Edge runtime limitations (no Node.js APIs)
- SSR/CSR split for Next.js App Router
- Bootstrap 5 integration with custom SCSS

## Roadmap

See `docs/task.md` for ongoing architectural improvements and prioritized refactoring tasks.
