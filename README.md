# Zero WYSIWYG

A lightweight, **zero-dependency** HTML editor using `contentEditable`.  
Built-in YouTube embeds, image resize, dark/light themes, and i18n — all in **~30 KB** (JS + CSS, unminified).

> Originally developed from scratch by **Alejandro Reyero** (areyero@hotmail.com) for the admin panel of [https://todojuegos.com](https://todojuegos.com).

---

## Features

- ✅ **Zero dependencies** — no jQuery, no React, no build step required
- ✅ **Rich formatting** — Bold, Italic, Underline, Strikethrough, Headings (H2–H4), Paragraph
- ✅ **Lists** — Ordered, Unordered, nested via Indent/Outdent (Tab/Shift+Tab)
- ✅ **Alignment** — Left, Center, Right
- ✅ **Links** — Create/edit dialog with "open in new window" toggle
- ✅ **Images** — Insert/edit with dimensions, **visual resize handles** (drag corners)
- ✅ **YouTube embeds** — Paste URL or enter ID, thumbnail preview placeholders, **resize + alignment**
- ✅ **Generic iframes** — Rendered as placeholders, preserved in HTML output
- ✅ **HTML source editing** — Toggle to view/edit raw HTML with syntax-colored textarea
- ✅ **Fullscreen mode** — Escape to exit
- ✅ **Smart paste** — Cleans Word/Office HTML, plain text preserves line breaks, YouTube URLs auto-embed
- ✅ **Keyboard shortcuts** — Ctrl+B/I/U, Tab for list nesting
- ✅ **Tables** — Insert table dialog with visual grid picker (up to 10×10) and manual size input
- ✅ **Color picker** — Text color and background color with 40-swatch palette + custom hex input
- ✅ **Undo/Redo** — Toolbar buttons with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- ✅ **Word count** — Optional status bar showing words and characters
- ✅ **Event callbacks** — `onChange`, `onFocus`, `onBlur`, `onReady`
- ✅ **Programmatic API** — `getHTML()`, `setHTML()`, `isEmpty()`, `focus()`, `enable()`, `disable()`
- ✅ **Accessibility** — ARIA labels on all toolbar buttons
- ✅ **i18n** — Built-in English, Spanish, French, German, Portuguese, Italian, Japanese — extensible to any language
- ✅ **Theming** — CSS custom properties for easy dark/light/custom themes
- ✅ **Framework wrappers** — React and Vue 3 component examples included
- ✅ **Lightweight** — ~28 KB JS + ~9 KB CSS (unminified)

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