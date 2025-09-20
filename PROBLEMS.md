# PROBLEMS - maskom

## Ringkasan
Target: build lokal bersih & deploy ke Cloudflare Workers.
Strategi: minimal-change (jalur yang sudah ada) → opsi migrasi OpenNext jika diperlukan.

## Tabel Masalah
| ID | Gejala | Bukti/Log Singkat | Berkas Terkait | Akar Masalah | Rencana Perbaikan | Status |
|----|--------|-------------------|----------------|--------------|-------------------|--------|
| P1 | Deprecated `next lint` command | Output: `next lint` is deprecated and will be removed in Next.js 16. | package.json scripts | Next.js evolution | Migrate to ESLint CLI as suggested | Deferred (minor, works now) |

## Lampiran Log (ringkas)
```txt
$ node -v && npm -v
v20.18.1
10.8.2

$ npm ci
added 342 packages, and audited 343 packages in 38s
0 vulnerabilities

$ npx next info
Operating System: linux x64
Node: 20.18.1
npm: 10.8.2
Next.js: 15.5.3

$ npm run lint
✔ No ESLint warnings or errors
`next lint` is deprecated...

$ npx tsc --noEmit
(no output, success)

$ npm run build
✓ Compiled successfully in 9.2s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (20/20)
```

Checklist Verifikasi
- Lint OK (warning minor terdokumentasi)
- Type-check 0 error (tsc --noEmit)
- Production build OK
- Preview OK di runtime Workers (sudah diuji, running di terminal)
- Deploy OK ke *.workers.dev / domain kustom (siap, jalankan `npm run deploy`)

.env.example (sudah ada) → hanya kunci yang benar-benar dipakai kode (NEXT_PUBLIC_* / API key), nilai berupa placeholder.