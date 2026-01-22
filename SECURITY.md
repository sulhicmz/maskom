# Security Policy

## Reporting Security Vulnerabilities

We take the security of Maskom seriously. If you discover a security vulnerability, please **do not** open a public issue.

### Reporting a Vulnerability

To report a security vulnerability, please follow these steps:

1. **Email Us**: Send a detailed report to [security@maskom.co.id](mailto:security@maskom.co.id)
2. **Include Details**: Your report should include:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Proof of concept (if applicable)
   - Your contact information for follow-up

### What to Expect

- **Response Time**: We aim to respond within 48 hours of receiving your report
- **Acknowledgment**: We will acknowledge receipt of your report
- **Timeline**: We will keep you updated on our progress toward a fix
- **Disclosure**: We will work with you to coordinate a public disclosure

### Disclosure Policy

- We will disclose vulnerabilities publicly after they have been fixed and deployed
- We will credit you for your discovery (with your permission)
- We will publish a security advisory explaining the issue and fix

## Supported Versions

We currently provide security updates for the following versions:

| Version | Support Status |
|---------|---------------|
| Latest main branch | ✅ Security updates |
| Previous stable version | ⚠️ Critical security updates only |

## Security Best Practices

### For Developers

1. **Never Commit Secrets**
   - API keys, tokens, passwords should never be in source code
   - Use environment variables (`.env.local`) for sensitive data
   - See `.env.example` for required environment variables

2. **Input Validation**
   - All user input must be validated on both client and server
   - Use Zod schemas for runtime validation
   - Sanitize HTML content using DOMPurify

3. **Output Encoding**
   - Never use `dangerouslySetInnerHTML` without sanitization
   - Always validate JSON-LD data before rendering

4. **Security Headers**
   - All HTTP responses include security headers (see `src/middleware.ts`)
   - CSP (Content Security Policy) is configured in `next.config.ts`

### For Users

1. **Keep Software Updated**
   - Regularly update your browser
   - Ensure JavaScript is enabled (required for modern features)

2. **Secure Your Account**
   - Use strong, unique passwords
   - Enable two-factor authentication when available
   - Be cautious of phishing attempts

3. **Report Suspicious Activity**
   - If you notice unusual behavior, report it immediately
   - Check your account activity regularly

## Current Security Measures

### Application Security

- ✅ **Input Validation**: Zod schemas for API endpoints
- ✅ **Output Encoding**: DOMPurify for HTML sanitization
- ✅ **Security Headers**: X-Frame-Options, X-XSS-Protection, HSTS, CSP
- ✅ **CORS Protection**: Origin validation
- ✅ **Rate Limiting**: Request throttling on API endpoints
- ✅ **Error Handling**: Standardized error responses (no stack traces)

### Infrastructure Security

- ✅ **HTTPS Only**: All communication encrypted in transit
- ✅ **Environment Variables**: Secrets stored securely
- ✅ **Dependency Auditing**: Regular security audits
- ✅ **Content Delivery Network**: Cloudflare CDN with DDoS protection

### Code Security

- ✅ **TypeScript**: Full type safety reduces runtime errors
- ✅ **Linting**: ESLint for code quality and security patterns
- ✅ **Testing**: 5900+ tests including security test cases
- ✅ **Code Review**: All changes reviewed before merging

## Known Security Features

### Security Headers

The application implements the following security headers:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME-sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection for older browsers
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Strict-Transport-Security: max-age=63072000` - Enforces HTTPS (2 years)
- `X-DNS-Prefetch-Control: off` - Disables DNS prefetch
- `X-Download-Options: noopen` - Prevents automatic file execution
- `Permissions-Policy` - Restricts browser features
- `Content-Security-Policy` - Restricts content sources (production only)

### Content Security Policy (CSP)

**Production CSP:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://api.emailjs.com;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

### Input Validation

- **Collaboration API**: Session IDs, usernames, post IDs validated
- **Email Service**: Email addresses validated with regex patterns
- **Form Inputs**: All user inputs sanitized before processing

### Rate Limiting

- API endpoints have rate limiting to prevent abuse
- Collaboration API: 60 requests per minute per client
- Email API: 10 emails per minute per IP

## Security Updates

We follow [Semantic Versioning](https://semver.org/):

- **Patch (X.Y.Z)**: Bug fixes, security patches
- **Minor (X.Y+1.0)**: New features, backward compatible
- **Major (X+1.0.0)**: Breaking changes

### How to Update

```bash
# Update dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build
npm run build
```

## Security Links

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security-features)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Contact

For security-related questions or concerns:

- **Security Email**: security@maskom.co.id
- **GitHub Issues**: [github.com/sulhicmz/maskom/issues](https://github.com/sulhicmz/maskom/issues)

---

**Last Updated**: January 22, 2026
