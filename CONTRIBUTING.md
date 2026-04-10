# Contributing to Zero WYSIWYG

Thank you for your interest in contributing to Zero WYSIWYG! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [areyero@hotmail.com](mailto:areyero@hotmail.com).

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/KaTXi/zero-wysiwyg/issues) to avoid duplicates.

When filing a bug report, please include:

- **A clear, descriptive title**
- **Steps to reproduce** — the minimum steps needed to trigger the bug
- **Expected behavior** — what you expected to happen
- **Actual behavior** — what actually happened
- **Browser and OS** — e.g., Chrome 120 on Windows 11
- **Screenshots or GIFs** — if the bug is visual
- **Code snippet** — a minimal HTML file that reproduces the issue

### Suggesting Features

Feature requests are welcome! Please open an issue and include:

- **Use case** — describe the problem you're trying to solve
- **Proposed solution** — how you'd like it to work
- **Alternatives considered** — other approaches you've thought about
- **Scope** — is this a small addition or a major change?

Keep in mind the project's core principle: **zero dependencies**. Feature suggestions that require adding external libraries will likely be declined.

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feature/my-feature`
3. **Make your changes** (see [Code Style](#code-style) below)
4. **Test manually** (see [Testing](#testing) below)
5. **Commit** with a clear message (see [Commit Messages](#commit-messages))
6. **Push** to your fork: `git push origin feature/my-feature`
7. **Open a Pull Request** against `main`

#### PR Requirements

- [ ] All existing examples still work without errors
- [ ] New features include at least one example or modification to an existing example
- [ ] New user-facing strings are added to **both** `locales.en` and `locales.es` in the JS file
- [ ] New CSS uses `--zw-*` variables (no hardcoded colors)
- [ ] No external dependencies added
- [ ] README updated if the API surface changes

## Development Setup

Zero WYSIWYG has **no build step** for development. Just open the example HTML files in your browser:

```bash
# Clone the repo
git clone https://github.com/KaTXi/zero-wysiwyg.git
cd zero-wysiwyg

# Open an example in your browser
open examples/basic.html        # macOS
xdg-open examples/basic.html    # Linux
start examples/basic.html       # Windows
```

All source files are in `src/` and are loaded directly by the examples via relative paths. Edit `src/zero-wysiwyg.js` or `src/zero-wysiwyg.css`, refresh the browser, and see your changes immediately.

### Project Structure

```
zero-wysiwyg/
├── src/
│   ├── zero-wysiwyg.js      # All editor logic (IIFE module)
│   ├── zero-wysiwyg.css     # All editor styles (light theme default)
│   ├── themes/
│   │   └── dark.css          # Dark theme overrides
│   └── i18n/
│       ├── en.js             # English locale (also embedded in main JS)
│       └── es.js             # Spanish locale (also embedded in main JS)
├── examples/                 # Self-contained HTML demos
├── package.json
├── README.md
├── CONTRIBUTING.md           # This file
├── CHANGELOG.md
└── LICENSE
```

### Key Architecture Decisions

- **Single JS file** — all logic lives in `src/zero-wysiwyg.js` as an IIFE. No modules, no imports, no bundler required.
- **CSS variables** — all colors, sizes, and fonts use `--zw-*` custom properties. Themes override these variables.
- **i18n embedded** — English and Spanish locales are defined inside the main JS file. External locale files in `src/i18n/` are provided as a convenience but are not required.
- **No `contentEditable` polyfills** — we rely on native browser `execCommand` and `contentEditable`. This is intentional and keeps the codebase small.

## Code Style

### JavaScript

- **Vanilla JS only** — no jQuery, no frameworks, no external libraries
- **IIFE pattern** — all code wrapped in `(function() { ... })()` to avoid polluting the global scope
- **`var` declarations** — we use `var` (not `let`/`const`) for maximum browser compatibility
- **Descriptive function names** — prefer `showLinkDialog()` over `sld()`
- **JSDoc comments** — public API methods should have JSDoc annotations
- **No semicolon-free style** — always use semicolons

### CSS

- **`zw-` prefix** — all class names must start with `zw-` (e.g., `.zw-toolbar-btn`)
- **`--zw-*` variables** — never hardcode colors; always use CSS custom properties
- **BEM-like naming** — `.zw-toolbar-btn`, `.zw-toolbar-btn--active`, `.zw-link-dialog`
- **No `!important`** — use specificity instead
- **Mobile-friendly** — test at 320px width minimum

### Localization (i18n)

- Every user-facing string must use the `t('key')` function
- New strings must be added to both `locales.en` and `locales.es` objects in `zero-wysiwyg.js`
- Tooltip format: include keyboard shortcut in parentheses, e.g., `"Bold (Ctrl+B)"`

## Testing

There is currently no automated test suite. Testing is done manually:

### Manual Testing Checklist

Before submitting a PR, verify these work:

1. **Open each example file** in your browser — no console errors
2. **Basic formatting** — Bold, Italic, Underline, headings, lists
3. **Link dialog** — create link, edit existing link, open in new window toggle
4. **Image dialog** — insert image URL, resize with drag handles
5. **YouTube embed** — paste URL, verify thumbnail preview, resize + alignment
6. **HTML source toggle** — switch to source, edit, switch back
7. **Fullscreen mode** — enter, edit, press Escape to exit
8. **Paste handling** — paste from Word, paste plain text, paste YouTube URL
9. **Dark theme** — open `dark-theme.html`, verify all dialogs render correctly
10. **Multiple editors** — open `multiple-editors.html`, create/destroy editors dynamically

### Browser Testing

Test in at least:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | CSS changes, formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, config changes |

### Examples

```
feat(toolbar): add table insertion button
fix(paste): preserve line breaks when pasting from Notepad
docs(readme): add CDN usage instructions
style(dark-theme): improve dialog contrast ratio
refactor(i18n): extract locale loading into separate function
```

---

## Questions?

If you have questions about contributing, feel free to [open an issue](https://github.com/KaTXi/zero-wysiwyg/issues) or email [areyero@hotmail.com](mailto:areyero@hotmail.com).

Thank you for helping make Zero WYSIWYG better! 🎉