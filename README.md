# Maskom

<div align="center">

**[English](README.en.md)** | **[Bahasa Indonesia](README.id.md)**

</div>

---

**Maskom** is a production-ready marketing website for Maskom Network's connectivity and managed services. Built on Next.js 15 with App Router, it features a data-driven architecture, comprehensive testing, and enterprise-grade patterns for scalability and maintainability.

---

## Quick Start (5 Minutes)

Get the project running locally in just 5 minutes.

### Prerequisites

- **Node.js** 20.0.0 or higher (22+ recommended, see `.nvmrc`)
- **npm** or **yarn** package manager

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sulhicmz/maskom.git
cd maskom

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation

| Guide | Description | Audience |
|-------|-------------|----------|
| [User Guide](docs/user-guide.md) | Website usage guide for visitors and customers | 🇮🇩 Users |
| [Architecture](docs/blueprint.md) | Complete architecture overview and design patterns | 🇬🇧 Developers |
 | [Testing Guide](docs/testing-guide.md) | Testing strategies, 6326+ test suite | 🇬🇧 Developers |
| [Component Guide](docs/component-development-guide.md) | Component creation patterns and best practices | 🇬🇧 Developers |
| [Data File Guide](docs/data-file-creation-guide.md) | Static data management and validation | 🇬🇧 Developers |
| [API Documentation](docs/api.md) | Service layer API (EmailService, AuthService) | 🇬🇧 Developers |
| [Troubleshooting](docs/troubleshooting-guide.md) | Common issues and solutions | 🇬🇧 Developers |
| [Feature Guides](docs/features/) | Feature usage (Dark Mode, Blog, SEO, Anomaly Detection, Email Scheduler) | 🇬🇧 Developers |
| [Roadmap](docs/roadmap.md) | Feature development roadmap | 🇬🇧 All |

---

## Key Features

### Architecture & Infrastructure

- ✅ **Edge Runtime** - Cloudflare Workers compatible with nodejs_compat fallback
- ✅ **Data-Driven** - Static TypeScript data files for content management
- ✅ **Service Layer** - Abstracted services with resilience patterns (circuit breaker, retry, timeout)
- ✅ **RBAC** - Role-based access control with permission system
- ✅ **APM Integration** - Application performance monitoring with provider abstraction

### Quality & Performance

 - ✅ **Comprehensive Testing** - 6326+ tests, 97% passing, 242 test suites
- ✅ **Type Safety** - Full TypeScript with strict mode enabled
- ✅ **SEO Optimized** - Structured data, meta tags, Open Graph
- ✅ **Accessibility** - WCAG 2.1 Level AA compliant with ARIA attributes

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `http://localhost:3000` |
| `npm run build` | Production build (runs tests first) |
| `npm run start` | Start production server |
  | `npm test` | Run all 6326+ tests |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |

---

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
│   ├── services/        # Service layer (EmailService, AuthService)
│   ├── styles/          # SCSS entry points
│   ├── types/           # Centralized type definitions
│   └── utils/           # Utilities and helpers
├── public/              # Static assets, Cloudflare headers
├── docs/               # Documentation
└── tests/              # Test utilities and mocks
```

**Key Patterns:**

- **Path Aliases**: `@/*` → `./src/*`, `@/assets/*` → `./public/assets/*`
- **Component Organization**: `src/components/[category]/[component]/`
- **Data Files**: All dynamic content in `src/data/*.ts` with validation
- **Page Layout Builder**: All pages use `PageBuilder` for consistency

---

## Development Workflow

### 1. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests
npm test

# Run linting
npm run lint

# Commit changes
git add .
git commit -m "feat: add your feature"
```

### 2. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/common/PageBuilder.test.tsx
```

### 3. Common Tasks

**Adding a new data file:**
1. Create file in `src/data/YourData.ts`
2. Define TypeScript interface
3. Add validator in `src/utils/dataValidation/`
4. Export data and pre-filtered versions
5. Run tests: `npm test`

**Creating a new component:**
1. Create component in `src/components/[category]/[component]/index.tsx`
2. Add tests in `src/components/[category]/[component]/__tests__/`
3. Import and use in pages
4. Run tests: `npm test`

**Adding a new page:**
1. Create page in `src/app/your-page/page.tsx`
2. Use `PageBuilder` for layout structure
3. Add data in `src/data/YourPageData.ts`
4. Update menu in `src/data/MenuData.ts`
5. Run tests and lint: `npm test && npm run lint`

---

## Environment Variables

For email functionality, create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your EmailJS credentials:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

> **Note**: Email features work without credentials for development (uses console fallback).

---

## Testing & Quality

This project maintains high code quality standards:

 - **6326+ tests** across 242 test suites (97% passing)
- **ESLint** with Next.js flat config
- **TypeScript** strict mode
- **Build-time validation** for all data files
- **Automated testing** in CI/CD pipeline

Run all quality checks:

```bash
npm test && npm run lint && npm run build
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request** to the `main` branch

**Before submitting PR:**

- ✅ All tests pass: `npm test`
- ✅ Linting passes: `npm run lint`
- ✅ Build succeeds: `npm run build`
- ✅ Code follows existing patterns

---

## Support

- **Issues**: [GitHub Issues](https://github.com/sulhicmz/maskom/issues)
- **Documentation**: [docs/](./docs/)
- **User Guide**: [docs/user-guide.md](docs/user-guide.md) (Indonesian)

---

## License

© 2026 Maskom Network. All rights reserved.

---

## Next Steps

- 📖 Read [Architecture Docs](docs/blueprint.md) for deep dive
- 🧪 Explore [Testing Guide](docs/testing-guide.md) for test strategies
- 🎨 Learn [Component Patterns](docs/component-development-guide.md)
- 📊 Understand [Data Architecture](docs/data-file-creation-guide.md)
- 🐛 Check [Troubleshooting Guide](docs/troubleshooting-guide.md) for common issues
- 🚀 Check [Feature Roadmap](docs/roadmap.md) for what's next
