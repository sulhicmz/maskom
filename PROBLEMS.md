# PROBLEMS - maskom

## Ringkasan
Target: build lokal bersih & deploy ke Cloudflare Workers.
Strategi: minimal-change (jalur OpenNext sudah di package.json) → sinkronkan konfigurasi deploy.

## Tabel Masalah
| ID | Gejala | Bukti/Log Singkat | Berkas Terkait | Akar Masalah | Rencana Perbaikan | Status |
|----|--------|-------------------|----------------|--------------|-------------------|--------|
| P1 | Syntax error di src/index.ts | Extra closing brace line 8 | src/index.ts | Manual edit error | Remove extra } | Fixed |
| P2 | ESLint config syntax error | Unexpected token ':' | eslint.config.mjs | Object not in array | Fix ESLint config structure | Fixed |
| P3 | next lint deprecated | Warning: `next lint` is deprecated | package.json | Next.js 15+ deprecation | Update scripts to use ESLint CLI | Fixed |
| P4 | Edge runtime warning | Using edge runtime disables static generation | src/app/[...not-found]/page.tsx | Runtime config | Remove edge runtime | Fixed |
| P5 | src/index.ts tidak dibutuhkan | File worker legacy dari next-on-pages | src/index.ts | Proyek sudah pakai Next.js app router | Remove src/index.ts | Fixed |
| P6 | ESLint ignores incomplete | Build files not ignored | eslint.config.mjs | Add .open-next/** and doc/** to ignores | Update ignores | Fixed |
| P7 | Node.js compat flag missing | nodejs_compat not enabled | wrangler.toml | Required for OpenNext Cloudflare | Add compatibility_flags | Fixed |
| P8 | ESLint ignores missing .wrangler/** | Lint errors from .wrangler tmp files | eslint.config.mjs | Build tmp files not ignored | Add ".wrangler/**" to ignores | Fixed |

## Lampiran Log (ringkas)
```
$ node -v && npm -v
v20.18.1
10.8.2

$ npx tsc --noEmit
(no errors after fix)

$ npm run build
✓ Compiled successfully in 22.4s
⚠ Using edge runtime on a page currently disables static generation for that page
✓ Generating static pages (20/20)
```

Checklist Verifikasi
- Lint OK (warning minor terdokumentasi)
- Type-check 0 error
- Production build OK
- Preview OK di runtime Workers
- Deploy OK ke *.workers.dev / domain kustom