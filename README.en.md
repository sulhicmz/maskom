# Maskom

Maskom is a marketing website for Maskom Network's connectivity and managed services, built on Next.js App Router. All main pages are written in Indonesian and use static TypeScript data so content can be centrally updated without touching presentation components.

## Quick Start (5 Minutes)

Quick guide to run the Maskom project locally:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

For email features, copy the environment example file and configure EmailJS credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your EmailJS credentials:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:3000`

### 4. Run Tests (Optional)

Verify all tests are running correctly:

```bash
npm test
```

### 5. Production Build

For production build:

```bash
npm run build
npm run start
```

### Next Steps

- [**User Guide**](docs/user-guide.md) - How to use the Maskom website (for visitors and customers)
- [**Architecture Documentation**](docs/blueprint.md) - Complete architecture overview and design patterns
- [**Development Guide**](docs/testing-guide.md) - Testing and development guide
- [**Component Guide**](docs/component-development-guide.md) - How to create and maintain components
- [**Data File Guide**](docs/data-file-creation-guide.md) - How to create and manage static data
- [**API Documentation**](docs/api.md) - Service documentation (EmailService, AuthService)
- [**Feature Guides**](docs/features/) - Feature usage guides (Dark Mode, Blog, SEO)
- [**Roadmap**](docs/roadmap.md) - Feature development roadmap

## Key Features

- **Edge runtime** with `export const runtime = 'edge'` allowing Next.js builds to run on Cloudflare Workers. Some pages use nodejs runtime for OpenNext Cloudflare deployment compatibility.
- **Reusable layout** through `Wrapper` that adds `ScrollToTop`, `ToastContainer`, and `ErrorBoundary` for consistent global interactions and elegant error handling.
- **Data-driven navigation** from `src/data/MenuData.ts` allowing menu structure modifications without component changes.
- **Data-based sections** (e.g., workflow, pricing, testimonials) read from `src/data/*.ts` files with comprehensive runtime validation.
- **Third-party integration** for animations (Swiper, Isotope), email sending (EmailJS), and notifications (React Toastify) with resilience patterns (timeout, retry, circuit breaker, rate limiting).
- **CSS optimization** with Bootstrap and FontAwesome loading from CDN (jsDelivr/Cloudflare) for faster edge delivery, plus lazy loading CSS for components only needed during interaction.
- **Service layer abstraction** for EmailService and AuthService with comprehensive resilience patterns, facilitating future real backend integration.
- **Centralized data validation** with 21 validators for all data types, ensuring data integrity at build-time and runtime.

## Project Structure

```
src/
├── app/                # Next.js App Router routes including child pages
├── components/         # Components by category (homes, pages, common, forms, etc.)
├── data/               # Static TypeScript data source with runtime validation
├── hooks/              # Custom hooks (e.g., UseSticky, useFormSubmission)
├── layouts/            # Header, footer, wrapper with ErrorBoundary and ToastContainer
├── modals/             # Modal components
├── services/           # Service layer abstraction (EmailService, AuthService)
├── test-utils/         # Centralized testing utilities (helpers, mocks, fixtures, matchers)
├── types/              # Centralized type definitions
├── utils/              # General utilities (validation, rateLimiter, resilience, data*)
└── styles/             # SCSS entry point importing from CDN
public/
├── _headers            # Caching & security header rules for Cloudflare Workers
└── assets/             # Images, SCSS, and static assets
```

> Note: Path alias `@/*` points to `./src/*` and `@/assets/*` to `./public/assets/*` as defined in `tsconfig.json`.

## Environment Setup

1. Ensure using Node.js >= 22.0.0 and latest npm (per package.json engines).
2. Install dependencies: `npm install`
3. Copy `.env.example` (if available) to `.env.local` and fill in production EmailJS credentials (`NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`). EmailJS credentials now loaded from environment variables.
4. For Cloudflare preview, install Wrangler (`npm install -g wrangler`) if not available.

## Development Commands

| Command | Function |
| --- | --- |
| `npm run dev` | Run Next.js server at `http://localhost:3000` |
| `npm run build` | Production Next.js build |
| `npm run start` | Run build output locally |
| `npm run lint` | Run Next.js configured ESLint |
| `npx tsc --noEmit` | Check TypeScript types without generating files |
| `npm run analyze` | Run `@next/bundle-analyzer` (requires `ANALYZE=true` variable) |
| `npm run preview` | Build using OpenNext and run Workers preview |
| `npm run deploy` | Build OpenNext and deploy to Cloudflare Workers |

## Content & Data Guide

- Main home component (`HomeOne`) loads header, hero, benefits, process, pricing, testimonials, FAQ, through CTA in the same order as production landing page.
- Process, pricing, and other content data filtered by `page` field for reuse on other pages (e.g., pricing page).
- `Gallery` component uses Isotope for category filtering and requires DOM as it mounts client-side. Ensure `window` is available before initialization.
- Sticky navigation and back-to-top button utilize `UseSticky` hook to detect scroll >200px.

## Styling & Assets

- SCSS entry point at `src/styles/index.scss` imports Bootstrap and FontAwesome from CDN (jsDelivr/Cloudflare) for better edge delivery and browser caching.
- CSS on-demand loading for components like Toastify only loads when needed, reducing initial page load.
- Image assets in `public/assets/images/*` imported via `@/assets/...` alias consistent with Next.js configuration.
- HTTP headers for caching, security, and CORS set via `public/_headers`. Adjust CORS origin if running on different domain.

## Deployment to Cloudflare Workers

1. Run `npm run preview` to generate OpenNext output at `.open-next/` and start `wrangler dev` (requires Wrangler login).
2. Use `npm run deploy` to build and deploy. Worker configuration at `wrangler.toml` with `ASSETS` asset binding.
3. `open-next.config.ts` uses default `defineCloudflareConfig()` configuration. Adjust if additional bindings needed.

## Documentation & Operations

- [docs/architecture/ADR-0001-worker-stack.md](docs/architecture/ADR-0001-worker-stack.md) — worker stack & Next.js architecture decision
- [docs/blueprint.md](docs/blueprint.md) — complete architecture overview & design patterns
- [docs/api.md](docs/api.md) — complete API documentation for services (EmailService, AuthService)
- [docs/testing-guide.md](docs/testing-guide.md) — comprehensive testing guide (2724 tests)
- [docs/task.md](docs/task.md) — task tracking and architecture improvements
- [docs/roadmap.md](docs/roadmap.md) — feature development roadmap
- [docs/content_plan.md](docs/content_plan.md) — content planning
- [docs/operations/performance-playbook.md](docs/operations/performance-playbook.md) — current performance optimization strategies
- [docs/operations/known-issues.md](docs/operations/known-issues.md) — list of issues to address
- [docs/operations/continuous-development.md](docs/operations/continuous-development.md) — continuous development maintenance guide
- [docs/project_management/](docs/project_management/) — project management processes and rules
- [docs/history/2024-remediation-log.md](docs/history/2024-remediation-log.md) — previous remediation iteration notes

Update the above documentation whenever there are architecture, dependency, or operational process changes.

## Data Validation

- All static data in `src/data/` validated using utilities in `src/utils/dataValidation.ts`
- 21 validators cover: FeedbackItem, FaqItem, PriceItem, MenuItem, TeamMember, etc.
- Data indexing for O(1) lookup and relationship management for referential integrity
  - Run `npm test` to ensure all validation runs correctly (3575 total tests)
- See [docs/blueprint.md](docs/blueprint.md#data-validation--completed---task-40-phase-1) for complete details

## Services

- **EmailService** (`src/services/email/`): Manages email sending with EmailJS and resilience patterns (timeout, retry, circuit breaker, rate limiting)
- **AuthService** (`src/services/auth/`): Handles user authentication with mock implementation ready for real backend integration (Auth0, Firebase, NextAuth, or custom)
- **Rate Limiting**: Protection against brute force attacks and abuse for email, login, and register operations
- See [docs/api.md](docs/api.md) for complete API documentation and usage examples

## Contributing

1. Fork repository and create a new feature branch
2. Ensure all tests pass: `npm test`
3. Run linting: `npm run lint`
4. Create pull request with clear change description

## Troubleshooting

- **Tests fail with "module not found"**: Run `npm install` to ensure all dependencies are installed
- **Build fails on Cloudflare Workers**: Check `public/_headers` for correct CORS configuration
- **Email not sent**: Ensure environment variables `NEXT_PUBLIC_EMAILJS_*` are set in `.env.local` and rate limiting not exceeded
- **Auth login/register fails with rate limit**: Wait for cooldown period (30 minutes for login, 2 hours for register) or use admin reset function
- **WOW animation not working**: This is a known issue, see [docs/operations/known-issues.md](docs/operations/known-issues.md) for details
- **Error boundary appears**: Check error ID in console and view error logs for debugging, use "Reload Page" or "Try Again" options for recovery
