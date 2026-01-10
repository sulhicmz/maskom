# Known Issues

This document tracks current issues in the Maskom codebase with recommended handling.

## 1. CORS Header Restricts Production Domain Only

- **Detail**: `public/_headers` limits `Access-Control-Allow-Origin` to `https://maskom.co.id` only. 【F:public/_headers†L12】
- **Impact**: Cross-origin requests (e.g., staging, preview Workers) may be rejected by browsers.
- **Action**: Add a list of valid origins or use controlled wildcards during testing.

## 2. WOW Animations Not Initialized

- **Detail**: Many components use `wow fadeIn*` classes (e.g., hero landing page), but there is no `new WOW().init()` initialization in the React code. 【F:src/components/homes/home-one/Hero.tsx†L15-L20】
- **Impact**: Scroll animations won't work even though the `animate.css` stylesheet is imported via `src/styles/index.scss`. 【F:src/styles/index.scss†L1-L10】
- **Action**: Add WOW initialization in a client-side effect (e.g., in `Wrapper` or a dedicated component) or replace `wow` classes with CSS animations.

---

## Recently Resolved Issues (Removed from Active List)

### ~~EmailJS Credentials Hardcoded in Code~~
- **Status**: ✅ Fixed - Now using environment variables via `src/services/email/EmailService.ts`
- **Resolved in**: Task 1 - Service Layer Abstraction

### ~~Page Metadata Still Using Template Placeholders~~
- **Status**: ✅ Fixed - Metadata updated to Maskom branding
- **Resolved in**: Task 16 - Critical Doc Fix

### ~~Offcanvas Component Not Synchronized with Navigation~~
- **Status**: ✅ Fixed - Now uses `menu_data` from `MenuData.ts`
- **Resolved in**: Task 20 - Code Duplication - Sidebar & Footer Patterns

---

If you find a new issue:
1. Verify if it's already listed in this document.
2. Report via issue tracker with reproduction steps, environment info, and screenshots if needed.
3. After fixing, update status or remove entries that are no longer relevant.
