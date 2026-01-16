# Dark Mode User Guide

## Overview

Maskom website supports **dark mode** - a visual theme with dark backgrounds and light text that reduces eye strain and saves battery on OLED screens. Dark mode is automatically enabled based on your system preferences, but can also be manually controlled.

## Features

### 1. Automatic System Preference Detection

Dark mode automatically detects your operating system's color scheme preference:

- **Windows 10/11**: Settings → Personalization → Colors → Choose your color (Light/Dark)
- **macOS**: System Preferences → General → Appearance (Light/Dark/Auto)
- **Linux**: Settings → Appearance → Dark Style
- **iOS**: Settings → Display & Brightness → Dark Mode
- **Android**: Settings → Display → Dark Theme

When you visit the website, it automatically matches your system preference (light or dark theme).

### 2. Manual Theme Toggle

You can manually switch between light and dark mode using the theme toggle button:

**Location**: Top navigation bar (Header)

**Button Appearance**:
- 🌙 (Moon icon) - Current theme is light, clicking switches to dark
- ☀️ (Sun icon) - Current theme is dark, clicking switches to light

**How to Use**:
1. Click the theme toggle button in the top navigation bar
2. Theme immediately switches between light and dark
3. Your choice is saved for future visits

### 3. Theme Persistence

Your theme preference is **automatically saved** to your browser's local storage:

- Settings persist across browser sessions
- Theme is remembered when you return to the website
- Works even if you close and reopen the browser
- No account or login required

### 4. Smooth Transitions

Theme switching includes **smooth visual transitions** (0.3 seconds) for a polished experience:
- Background colors fade smoothly
- Text colors transition gently
- No jarring or abrupt changes
- CSS `transition` property for all theme-related elements

## Usage Examples

### Example 1: Night Reading

**Scenario**: Reading blog posts at night

**Steps**:
1. Visit any blog page
2. Click the 🌙 (moon) icon in the navigation bar
3. Website switches to dark mode
4. Continue reading with reduced eye strain
5. Theme preference is saved for next visit

### Example 2: System Sync

**Scenario**: Your device is set to dark mode automatically

**Steps**:
1. Set your operating system to dark mode (Windows/macOS/Linux)
2. Visit the Maskom website
3. Website automatically loads in dark mode
4. No manual toggle required
5. Toggle button shows ☀️ (sun icon) indicating current state

### Example 3: Manual Override

**Scenario**: System is in dark mode, but you prefer light mode

**Steps**:
1. Visit the Maskom website (loads in dark mode initially)
2. Click the ☀️ (sun icon) in the navigation bar
3. Website switches to light mode
4. Your manual preference overrides system setting
5. Website remembers your manual choice

## Accessibility

Dark mode is **fully accessible** for all users:

### Keyboard Navigation
- Theme toggle button is fully keyboard accessible
- Use `Tab` to navigate to the theme toggle button
- Press `Enter` or `Space` to toggle theme

### Screen Reader Support
- Button has proper `aria-label` (e.g., "Switch to dark mode")
- Icon is hidden from screen readers (`aria-hidden="true"`)
- Screen readers announce current and target theme
- Button has `title` attribute for hover tooltips

### Focus Management
- Theme toggle maintains keyboard focus
- No focus loss during theme switching
- Focus remains on button after toggle

### Color Contrast
- Dark mode meets WCAG 2.1 AA contrast requirements
- Text is readable on dark backgrounds
- Links and buttons have sufficient contrast
- All UI elements remain usable in both themes

## Technical Details

### Theme System Architecture

The dark mode feature uses **React Context** for state management:

```
ThemeContext (src/contexts/ThemeContext.tsx)
    ├── theme: 'light' | 'dark'
    ├── toggleTheme: () => void
    └── setTheme: (theme) => void
```

**Components Using Theme**:
- `ThemeToggle` - Toggle button component
- `HeaderOne` - Navigation bar with theme toggle
- All pages inherit theme from context

### Theme Storage

**localStorage Key**: `maskom-theme`

**Storage Format**: JSON string (`"light"` or `"dark"`)

**Fallback Order**:
1. Check localStorage for saved preference
2. If no saved preference, check system preference
3. Default to light mode if neither is available

### CSS Implementation

Themes are implemented using **CSS custom properties (variables)**:

**Light Theme Variables**:
```css
--background-color: #ffffff;
--text-color: #333333;
--primary-color: #007bff;
```

**Dark Theme Variables**:
```css
--background-color: #1a1a1a;
--text-color: #e0e0e0;
--primary-color: #4dabf7;
```

**Application**:
```css
[data-theme="dark"] {
    --background-color: #1a1a1a;
    --text-color: #e0e0e0;
}
```

**Component Usage**:
```css
.my-component {
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Browser Compatibility

Dark mode is supported in all modern browsers:

| Browser | Minimum Version | System Detection | localStorage | Transitions |
|---------|----------------|------------------|---------------|--------------|
| Chrome | 76+ | ✅ | ✅ | ✅ |
| Firefox | 67+ | ✅ | ✅ | ✅ |
| Safari | 12.1+ | ✅ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ | ✅ |
| Opera | 62+ | ✅ | ✅ | ✅ |

**Note**: Older browsers may default to light mode but will still be functional.

## Troubleshooting

### Issue: Theme not persisting

**Possible Causes**:
- Browser privacy mode (incognito/private browsing)
- Browser localStorage disabled
- Browser extensions blocking localStorage

**Solutions**:
1. **Clear browser cache and cookies**:
   - Chrome: Settings → Privacy → Clear Browsing Data
   - Firefox: Options → Privacy → Clear Data
   - Safari: Develop → Empty Caches

2. **Check browser settings**:
   - Ensure localStorage is enabled
   - Disable privacy extensions temporarily
   - Try in regular browser window (not incognito)

3. **Manually set theme**:
   - Click theme toggle button
   - Verify theme changes
   - Refresh page to test persistence

### Issue: System preference not detected

**Possible Causes**:
- Browser doesn't support `prefers-color-scheme`
- System setting not configured correctly
- Browser overriding system setting

**Solutions**:
1. **Verify system setting**:
   - Check OS color scheme setting
   - Ensure dark mode is enabled (if desired)
   - Restart browser after changing system setting

2. **Update browser**:
   - Ensure browser is latest version
   - Modern browsers have better system detection

3. **Use manual toggle**:
   - Click theme toggle button to manually set theme
   - Manual preference takes priority over system setting

### Issue: Theme transition is jerky

**Possible Causes**:
- Browser doesn't support smooth transitions
- JavaScript blocking CSS transitions
- High CPU usage

**Solutions**:
1. **Check browser performance**:
   - Close unnecessary browser tabs
   - Disable heavy browser extensions
   - Try in different browser

2. **Disable animations**:
   - Some browsers have "Reduce motion" setting
   - Check OS accessibility settings

## Developer Guide

### Using Theme Context in Components

```typescript
'use client';

import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
    const { theme, toggleTheme, setTheme } = useTheme();

    return (
        <div>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={() => setTheme('dark')}>Set Dark Mode</button>
            <button onClick={() => setTheme('light')}>Set Light Mode</button>
        </div>
    );
}
```

### Styling for Dark Mode

Using CSS variables:
```css
/* Light mode (default) */
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
}

/* Dark mode override */
[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
}

/* Use variables */
.my-component {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

Using CSS modules with theme:
```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
    const { theme } = useTheme();
    const className = theme === 'dark' ? 'dark-theme' : 'light-theme';

    return <div className={className}>Content</div>;
}
```

### Testing Theme Functionality

**Manual Testing**:
1. Toggle theme using button
2. Verify all elements update colors
3. Refresh page and verify persistence
4. Change system preference and reload

**Automated Testing**:
```typescript
describe('ThemeToggle', () => {
    it('toggles theme on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Assert theme changed
    });

    it('persists theme to localStorage', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Assert localStorage updated
    });
});
```

## Best Practices

### 1. Always Use CSS Variables

✅ **Good**:
```css
background-color: var(--bg-color);
color: var(--text-color);
```

❌ **Bad**:
```css
background-color: #ffffff;
color: #333333;
```

### 2. Test Both Themes

Always test your components in both light and dark modes:
- Manual testing in both themes
- Automated tests with theme context
- Verify color contrast in both modes

### 3. Use Transitions

Add smooth transitions for theme switching:
```css
transition: background-color 0.3s ease, color 0.3s ease;
```

### 4. Respect User Preference

Never override user's system preference without their explicit action:
- Use system preference as default
- Allow manual override
- Save user's manual choice

### 5. Accessibility First

Ensure both themes are accessible:
- Check color contrast (WCAG 2.1 AA)
- Test with screen readers
- Verify keyboard navigation
- Test in both light and dark modes

## Related Documentation

- [Component Development Guide](../component-development-guide.md#8-themetoggle) - ThemeToggle component documentation
- [Blueprint](../blueprint.md#dark-mode-theme-system--completed---task-203) - Architecture documentation
- [Accessibility](../testing-guide.md#accessibility-testing) - Accessibility testing patterns

## Support

For issues or questions about dark mode:
1. Check this documentation
2. Review browser compatibility
3. Test in incognito mode to isolate extensions
4. Report issues with browser and OS version

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Related Task**: Task 203 (Dark Mode Theme System)
