# OpenNext Cloudflare Configuration for Maskom

## Issue Description
The build process is failing during OpenNext Cloudflare deployment due to certain pages being incompatible with edge runtime. The error specifically mentions that pages cannot use edge runtime and that OpenNext requires edge runtime functions to be defined in a separate function.

## Solution Approach
Rather than changing the entire application's runtime strategy, we're selectively setting nodejs runtime for specific pages that may have compatibility issues with OpenNext's Cloudflare deployment while keeping the root layout with edge runtime for performance.

## Pages Updated to Use NodeJS Runtime
The following pages have been updated to use `export const runtime = 'nodejs';`:

- /about
- /contact
- /dashboard
- /blog
- /blog-details
- /faq
- /home-one-dark
- /login
- /sign-up
- /pricing
- /team
- /team-details
- /use-cases
- /use-case-details
- / (home page)

The root layout (/src/app/layout.tsx) remains with edge runtime to maintain the performance benefits for pages that are compatible.

## Why This Approach
1. The root layout uses edge runtime to provide performance benefits for static content
2. Specific pages that potentially use server-side dependencies or features not compatible with OpenNext's Cloudflare edge runtime are set to nodejs
3. This provides a balance between performance and compatibility

## OpenNext Configuration
The configuration in open-next.config.ts remains as default, using `defineCloudflareConfig()` which is the recommended approach for Cloudflare deployment.

## Asset Prefix & Static Assets

- `next.config.ts` intentionally omits `assetPrefix` so that generated CSS/JS references stay relative (e.g. `/_next/static/...`).
- Production builds deployed to Cloudflare Workers have been verified via `curl https://maskom.sulhi.workers.dev` to confirm all assets resolve relative to the worker host.
- If a canonical domain requires a CDN prefix in the future, prefer configuring it at the CDN level rather than hardcoding `assetPrefix`, to keep previews and staging environments functional.
