# Maskom

<div align="center">

**[English](README.en.md)** | **[Bahasa Indonesia](README.id.md)**

</div>

---

**Maskom** is a marketing website for Maskom Network's connectivity and managed services, built on Next.js App Router.

---

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Documentation

| Guide | Description | Language |
|-------|-------------|----------|
| [User Guide](docs/user-guide.md) | Website usage guide for visitors and customers | 🇮🇩 Indonesian |
| [Architecture](docs/blueprint.md) | Complete architecture overview and design patterns | 🇬🇧 English |
| [Development](docs/testing-guide.md) | Testing and development guide | 🇬🇧 English |
| [Components](docs/component-development-guide.md) | Component creation and maintenance guide | 🇬🇧 English |
| [Data Files](docs/data-file-creation-guide.md) | Static data creation and management | 🇬🇧 English |
| [API Docs](docs/api.md) | Service API documentation (EmailService, AuthService) | 🇬🇧 English |
| [Features](docs/features/) | Feature usage guides (Dark Mode, Blog, SEO) | 🇬🇧 English |

## Key Features

- ✅ **Edge Runtime** - Cloudflare Workers compatible
- ✅ **Data-Driven** - Static TypeScript data for content management
- ✅ **Service Layer** - Abstracted services with resilience patterns
- ✅ **RBAC** - Role-based access control
- ✅ **APM Integration** - Application performance monitoring
- ✅ **Comprehensive Testing** - 4000+ tests, 100% passing
- ✅ **SEO Optimized** - Structured data and meta tags
- ✅ **Accessibility** - WCAG 2.1 Level AA compliant

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/          # Next.js App Router
├── components/   # React components
├── data/        # Static TypeScript data
├── services/    # Service layer (EmailService, AuthService)
└── utils/       # Utilities and helpers
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run lint: `npm run lint`
6. Submit a pull request

## License

© 2026 Maskom Network. All rights reserved.
