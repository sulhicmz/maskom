This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Workers

This project is configured to deploy to Cloudflare Workers using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages).

1. Build the worker-compatible bundle:

   ```bash
   npm run cf:build
   ```

   This generates the Worker entry point at `.vercel/output/static/_worker.js` and the static asset bundle used during deploy.

2. Deploy the Worker with Wrangler:

   ```bash
   npm run cf:deploy
   ```

   The command bundles the latest build output and publishes it using the settings defined in `wrangler.toml`.

Refer to [Cloudflare's deployment guide](https://developers.cloudflare.com/workers/wrangler/get-started/) for additional options such as environment-specific deploys.
# Maskom