# Zero WYSIWYG

[![npm version](https://img.shields.io/npm/v/zero-wysiwyg.svg)](https://www.npmjs.com/package/zero-wysiwyg)
[![license](https://img.shields.io/npm/l/zero-wysiwyg.svg)](https://github.com/KaTXi/zero-wysiwyg/blob/main/LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/zero-wysiwyg)
[![bundle size](https://img.shields.io/badge/bundle-~120KB-blue.svg)](https://github.com/KaTXi/zero-wysiwyg)

A lightweight, **zero-dependency** WYSIWYG HTML editor with **35+ built-in features**.  
Tables, code blocks, YouTube embeds, slash commands, emoji picker, balloon toolbar, find & replace, dark/light themes, and 7 languages — all with **zero dependencies**.

**[Live Demo](https://katxi.github.io/zero-wysiwyg/)** · **[npm](https://www.npmjs.com/package/zero-wysiwyg)** · **[GitHub](https://github.com/KaTXi/zero-wysiwyg)**

> Originally developed from scratch by **Alejandro Reyero** (areyero@hotmail.com) for the admin panel of [https://todojuegos.com](https://todojuegos.com).

---

## Features

- ✅ **Zero dependencies** — no jQuery, no React, no build step required
- ✅ **Rich formatting** — Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Blockquote
- ✅ **Headings** — H2, H3, H4, Paragraph with SVG toolbar icons
- ✅ **Lists** — Ordered, Unordered, **Task Lists** (checkboxes), nested via Indent/Outdent
- ✅ **Alignment** — Left, Center, Right
- ✅ **Links** — Create/edit dialog with "open in new window" toggle
- ✅ **Images** — Insert/edit with dimensions, **visual resize handles** (drag corners)
- ✅ **YouTube embeds** — Paste URL or enter ID, thumbnail preview placeholders, **resize + alignment**
- ✅ **Tables** — Visual 10×10 grid picker, **right-click context menu** (add/delete rows/cols, toggle header)
- ✅ **Code blocks** — Insert with 8-language selector, compatible with Prism.js/highlight.js
- ✅ **Color picker** — Text color + background color, 40-swatch palette, hex input, remove color
- ✅ **Emoji picker** — 320+ built-in emojis across 6 categories with search filter
- ✅ **Balloon toolbar** — Floating toolbar on text selection (`toolbarMode: 'balloon'` or `'both'`)
- ✅ **Slash commands** — Type `/` to trigger command menu with 12 block types (`slashCommands: true`)
- ✅ **Find & Replace** — Ctrl+F with match highlighting, case toggle, Replace All
- ✅ **Auto-link detection** — Bare URLs automatically wrapped in `<a>` tags as you type
- ✅ **HTML source editing** — Toggle to view/edit raw HTML
- ✅ **Fullscreen mode** — Escape to exit
- ✅ **Smart paste** — Cleans Word/Office HTML, preserves line breaks, YouTube URLs auto-embed
- ✅ **Undo/Redo** — Toolbar buttons + Ctrl+Z / Ctrl+Y
- ✅ **Word count** — Optional status bar showing words and characters
- ✅ **SVG toolbar icons** — 37 clean inline SVG icons, Lucide-style
- ✅ **Programmatic API** — 10 methods: `getHTML`, `setHTML`, `isEmpty`, `focus`, `enable`, `disable`, etc.
- ✅ **Event callbacks** — `onChange`, `onFocus`, `onBlur`, `onReady`
- ✅ **Toolbar customization** — Filter by button name, alias, or group label
- ✅ **Accessibility** — ARIA labels, roles on all toolbar buttons
- ✅ **i18n** — 7 built-in languages (EN, ES, FR, DE, PT, IT, JA) — extensible to any language
- ✅ **Theming** — 18 CSS custom properties (`--zw-*`) for dark/light/custom themes
- ✅ **TypeScript** — Full `.d.ts` declarations for all API methods and options
- ✅ **Framework wrappers** — React, Vue 3, PHP, Django examples included
- ✅ **Lightweight** — ~102 KB JS + ~22 KB CSS (unminified, zero dependencies)

## Quick Start

### Via `<script>` tag (no build step)

```html
<!-- CSS -->
<link rel="stylesheet" href="zero-wysiwyg.css">
<!-- Optional: Dark theme -->
<link rel="stylesheet" href="themes/dark.css">

<!-- JS -->
<script src="zero-wysiwyg.js"></script>

<!-- Your textarea -->
<textarea id="content" name="content"></textarea>

<!-- Initialize -->
<script>
  ZeroWysiwyg.init('content', {
    height: '400px',
    locale: 'en',       // 'en' | 'es' | custom object
    theme: 'dark'        // adds .zw-theme-dark class
  });
</script>
```

### Via npm

```bash
npm install zero-wysiwyg
```

```js
import 'zero-wysiwyg/src/zero-wysiwyg.css';
import ZeroWysiwyg from 'zero-wysiwyg';

ZeroWysiwyg.init('content', { locale: 'en' });
```

### Via CDN

```html
<link rel="stylesheet" href="https://unpkg.com/zero-wysiwyg/src/zero-wysiwyg.css">
<script src="https://unpkg.com/zero-wysiwyg/src/zero-wysiwyg.js"></script>
```

Or via jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/zero-wysiwyg/src/zero-wysiwyg.css">
<script src="https://cdn.jsdelivr.net/npm/zero-wysiwyg/src/zero-wysiwyg.js"></script>
```

## API

### `ZeroWysiwyg.init(textareaId, options)`

Creates an editor instance for the given `<textarea>`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `height` | `string` | `'400px'` | Minimum height of the editor area |
| `locale` | `string\|object` | `'en'` | Language code (`'en'`, `'es'`, `'fr'`, `'de'`, `'pt'`, `'it'`, `'ja'`) or custom locale object |
| `theme` | `string` | — | Adds `zw-theme-{value}` class to wrapper (e.g., `'dark'`) |
| `wordCount` | `boolean` | `false` | Show word/character count status bar at bottom |
| `onChange` | `function` | — | Called with HTML string on every content change |
| `onFocus` | `function` | — | Called when editor gains focus |
| `onBlur` | `function` | — | Called when editor loses focus |
| `onReady` | `function` | — | Called with instance after initialization |
| `toolbarMode` | `string` | `'top'` | `'top'`, `'balloon'` (floating on selection), or `'both'` |
| `slashCommands` | `boolean` | `false` | Enable slash commands — type `/` to trigger block menu |
| `autoLink` | `boolean` | `true` | Auto-detect and linkify bare URLs as user types |
| `toolbar` | `array` | — | Filter visible buttons by command name or group label (see below) |

The first argument can be a **string ID** or an **HTMLElement** reference:

```js
// By ID
ZeroWysiwyg.init('myTextarea', { height: '400px' });

// By element reference
var el = document.querySelector('.my-editor');
ZeroWysiwyg.init(el, { height: '400px' });
```

Returns the editor instance.

### Toolbar Customization

Pass a `toolbar` array to show only specific buttons:

```js
// Minimal toolbar — just basic formatting + link
ZeroWysiwyg.init('editor', {
    toolbar: ['bold', 'italic', 'underline', 'link', 'image']
});

// Show entire groups by label
ZeroWysiwyg.init('editor', {
    toolbar: ['format', 'lists', 'link', 'image', 'youtube', 'source']
});
```

**Available button names:** `bold`, `italic`, `underline`, `strikeThrough`, `h2`, `h3`, `h4`, `ul`, `ol`, `indent`, `outdent`, `justifyLeft`, `justifyCenter`, `justifyRight`, `link`, `unlink`, `image`, `youtube`, `table`, `hr`, `textColor`, `bgColor`, `undo`, `redo`, `removeFormat`, `source`, `fullscreen`

**Group labels** (include all buttons in the group): `format`, `headings`, `lists`, `alignment`, `insert`, `color`, `history`, `utilities`

### `ZeroWysiwyg.getHTML(textareaId)`

Returns the cleaned HTML content of the editor.

### `ZeroWysiwyg.setHTML(textareaId, html)`

Programmatically sets the editor content.

### `ZeroWysiwyg.getMarkdown(textareaId)`

Returns the editor content converted to Markdown. Supports headings, bold, italic, strikethrough, links, images, lists, task lists, code blocks, tables, blockquotes, and horizontal rules.

### `ZeroWysiwyg.setMarkdown(textareaId, md)`

Sets the editor content from a Markdown string. Parses Markdown to HTML and loads it into the editor.

### `ZeroWysiwyg.isEmpty(textareaId)`

Returns `true` if the editor has no text content.

### `ZeroWysiwyg.focus(textareaId)`

Focuses the editor area.

### `ZeroWysiwyg.enable(textareaId)`

Re-enables a disabled editor and restores toolbar interactivity.

### `ZeroWysiwyg.disable(textareaId)`

Disables the editor — makes it read-only and greys out the toolbar.

### `ZeroWysiwyg.getInstance(textareaId)`

Returns the existing instance for a textarea, or `null`.

### `ZeroWysiwyg.destroy(textareaId)`

Removes the editor and restores the original textarea.

### `ZeroWysiwyg.locales`

Object containing all registered locales. Add your own:

```js
ZeroWysiwyg.locales.fr = {
  bold: 'Gras (Ctrl+B)',
  italic: 'Italique (Ctrl+I)',
  // ... see locales.en for all keys
};
ZeroWysiwyg.init('editor', { locale: 'fr' });
```

## Theming

The editor uses CSS custom properties (variables) scoped with `--zw-*`. Override them to match your design:

```css
/* Custom brand theme */
.my-brand .zw-wysiwyg-wrapper,
.my-brand .zw-link-dialog {
  --zw-accent: #8b5cf6;
  --zw-accent-hover: #7c3aed;
  --zw-accent-light: rgba(139, 92, 246, 0.1);
  --zw-bg: #fafafa;
  --zw-bg-toolbar: #f0f0f0;
}
```

### Available Variables

| Variable | Description |
|----------|-------------|
| `--zw-bg` | Editor background |
| `--zw-bg-toolbar` | Toolbar background |
| `--zw-bg-input` | Input fields in dialogs |
| `--zw-bg-dialog` | Dialog background |
| `--zw-bg-hover` | Hover state background |
| `--zw-bg-source` | HTML source view background |
| `--zw-text` | Primary text color |
| `--zw-text-heading` | Heading text color |
| `--zw-text-secondary` | Secondary text (toolbar, labels) |
| `--zw-text-muted` | Muted text (hints, placeholders) |
| `--zw-accent` | Accent color (buttons, links, active states) |
| `--zw-accent-hover` | Accent hover color |
| `--zw-accent-light` | Accent background tint |
| `--zw-border` | Border color |
| `--zw-radius` | Border radius |
| `--zw-radius-lg` | Large border radius (dialogs) |
| `--zw-font` | Font family |
| `--zw-font-mono` | Monospace font (source view) |

### Built-in Themes

- **Light** (default) — clean white background, blue accent
- **Dark** (`themes/dark.css`) — dark blue/purple background, red accent (inspired by TodoJuegos)

## i18n

Built-in locales: `en` (English), `es` (Spanish), `fr` (French), `de` (German), `pt` (Portuguese), `it` (Italian), `ja` (Japanese).

Load external locales with a separate `<script>` tag:

```html
<script src="zero-wysiwyg.js"></script>
<script src="i18n/fr.js"></script>
<script>
  ZeroWysiwyg.init('editor', { locale: 'fr' });
</script>
```

Pass a locale code or a custom object:

```js
// Use built-in Spanish
ZeroWysiwyg.init('editor', { locale: 'es' });

// Use custom locale
ZeroWysiwyg.init('editor', {
  locale: {
    bold: 'Fett (Strg+B)',
    italic: 'Kursiv (Strg+I)',
    placeholder: 'Schreiben Sie hier...',
    ok: 'OK',
    cancel: 'Abbrechen',
    // ... see ZeroWysiwyg.locales.en for all keys
  }
});
```

## Browser Support

Works in all modern browsers: Chrome, Firefox, Safari, Edge.  
Uses `contentEditable` and `document.execCommand` — standard across all browsers.

## License

MIT — see [LICENSE](LICENSE).

## Author

**Alejandro Reyero** — [areyero@hotmail.com](mailto:areyero@hotmail.com)  
Originally built for the admin panel of [TodoJuegos.com](https://todojuegos.com)