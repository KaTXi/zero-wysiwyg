# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] — 2026-04-21

### Table Column Resize
- **Drag-to-resize table columns** — Hover near any column border to see a `col-resize` cursor, then click and drag to adjust column widths
- Automatically sets explicit pixel widths on first drag for predictable resizing
- Full-viewport transparent overlay captures mouse during drag for smooth interaction
- Minimum column width of 30px enforced
- Adjacent columns resize inversely (total table width preserved)
- Column widths persist in the HTML output

### Security Fix: Markdown URL Protocol Whitelist
- **`_safeUrl()` protocol whitelist** — Blocks `javascript:`, `data:`, `vbscript:` and other dangerous URL schemes in Markdown link/image conversion
- Allows: `http:`, `https:`, `mailto:`, `tel:`, `#` anchors, `/` absolute paths, `.` relative paths, and URLs with no protocol (relative)
- `setMarkdown('[click](javascript:alert(1))')` now produces `href="#"` instead of executing the script
- Applied to both `[text](url)` links and `![alt](url)` images in Markdown→HTML conversion

### destroy() Listener Cleanup
- **Fixed memory leak**: `destroy()` now properly removes all document-level event listeners
  - `selectionchange` handler (toolbar active-state tracking)
  - Balloon toolbar `mousedown` handler (click-outside-to-close)
  - Fullscreen `keydown` Escape handler
- Also calls `hideBalloonToolbar()` and `hideSlashMenu()` on destroy to clean up any open UI
- Critical for multi-editor pages (adminNew review forms with up to 6 editors)

### Per-Instance Locale
- **Locale is now stored per-instance** — Two editors on the same page can have different languages
- `t(key, inst)` translation helper now accepts an optional instance parameter
- Each instance stores `_locale` from the `locale` option passed to `init()`
- Backward compatible: global `_locale` still works as fallback for non-instance calls

### Word Count i18n
- **Word count status bar now uses the i18n system** — no longer hardcoded English
- Added `wordSingular`, `wordPlural`, `charLabel` keys to EN and ES locales
- EN: "107 words · 677 chars" / ES: "107 palabras · 677 caracteres"
- Uses per-instance locale, so a Spanish editor shows Spanish word count

## [1.1.0] — 2026-04-12

### Custom Slash Commands
- **`slashItems` option** — Pass custom command arrays to `slashCommands` to override the default 12 commands

### Cell Background Color
- **Cell background color** in table right-click context menu — uses native color picker

### Enhanced Code Blocks
- **Tab key inserts 4 spaces** inside code blocks instead of changing focus
- Code blocks now behave like a proper code editor for indentation

### Enhanced Table Editing
- **Tab/Shift+Tab navigates between table cells** — Tab moves to next cell, Shift+Tab to previous
- Wraps around rows (last cell → first cell of next row)
- New helper functions: `getAncestorByClass`, `getAncestorTag`, `navigateTableCell`

### Markdown Mode
- **`getMarkdown(id)`** — New API method that converts editor HTML content to Markdown
- **`setMarkdown(id, md)`** — New API method that parses Markdown and loads it as HTML
- Full bidirectional HTML ↔ Markdown conversion supporting:
  - Headings (H1–H4), Paragraphs, Blockquotes
  - Bold (`**`), Italic (`_`), Strikethrough (`~~`), Inline code (`` ` ``)
  - Links `[text](url)`, Images `![alt](url)`
  - Ordered lists, Unordered lists, Task lists (`- [x]`)
  - Code blocks with language (` ```js `)
  - Tables with header row and separator
  - Horizontal rules (`---`)
- Zero dependencies — built-in converter, no external Markdown library needed

## [1.0.0] — 2026-09-04

### Core Editor
- **contentEditable-based WYSIWYG** with zero dependencies — no jQuery, no React, no build step required
- **Formatting** — Bold, Italic, Underline, Strikethrough, Subscript, Superscript
- **Block elements** — H2, H3, H4, Paragraph, Blockquote
- **Lists** — Ordered, Unordered, Task Lists (checkboxes), nested via Indent/Outdent (Tab/Shift+Tab)
- **Alignment** — Left, Center, Right
- **Links** — Create/edit dialog with "open in new window" option
- **Images** — Insert/edit dialog with dimensions, visual drag-to-resize handles
- **YouTube embeds** — URL/ID input, thumbnail preview placeholders, resize + alignment toolbar
- **Generic iframes** — Rendered as visual placeholders, preserved in HTML output
- **Tables** — Insert table dialog with visual 10×10 grid picker + manual rows/columns input; first row auto-generates `<th>` header cells
- **Color picker** — Text color and background color with 40-swatch palette, native `<input type="color">`, hex input, and "remove color" option
- **Emoji picker** — Built-in categorized emoji dialog (6 categories, ~320 emojis) with search filter, tabbed navigation, and one-click insertion
- **HTML source editing** — Toggle to view/edit raw HTML
- **Fullscreen mode** — Escape to exit
- **Smart paste** — Cleans Word/Office HTML, preserves plain text line breaks, auto-embeds YouTube URLs
- **Auto-link detection** — Automatically wraps bare URLs with `<a>` tags as user types (configurable, enabled by default)
- **Keyboard shortcuts** — Ctrl+B/I/U, Tab for list nesting, Shift+Tab to unnest
- **Undo/Redo** — Toolbar buttons (↩ / ↪) with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- **Horizontal rule** — Insert `<hr>` separator

### Code Block & Advanced Tables
- **Code block insertion** — Toolbar button with language selector dialog (8 languages: plain, JavaScript, HTML, CSS, Python, PHP, SQL, JSON). Inserts `<pre class="zw-code-block"><code class="language-xxx">` with monospace styling. Compatible with Prism.js/highlight.js for external syntax highlighting
- **Advanced table editing** — Right-click context menu on any table cell with: Add row above/below, Add column left/right, Delete row/column/table, Toggle header row. Automatic `<th>` ↔ `<td>` conversion for header toggle

### Modern UX Features
- **Balloon/Inline toolbar** — Floating toolbar appears on text selection with quick formatting (Bold, Italic, Underline, Strikethrough, Link, H2, H3). Three modes via `toolbarMode` option: `'top'` (default), `'balloon'`, `'both'`. Smart viewport-aware positioning with fade animation
- **Task lists (checkboxes)** — Toolbar button in `lists` group. Renders as `<ul class="zw-task-list">` with semantic `<input type="checkbox">`. Clicking toggles checked/done state with strikethrough styling. GitHub Markdown compatible output
- **Slash commands (/)** — Typing `/` triggers a dropdown menu with 12 block types (Paragraph, H2–H4, Blockquote, Lists, Task List, Table, HR, Image, YouTube). Type-ahead filtering, arrow key navigation, Enter to select, Escape to close. Enabled via `slashCommands: true` option
- **Find & Replace** — `Ctrl+F` / `Cmd+F` opens find bar with search input, match count, prev/next navigation, case-sensitive toggle, Replace and Replace All buttons. Highlights matches with `.zw-search-match` / `.zw-search-match-active`

### API & Programmatic Control
- **`init(id, options)`** — Creates editor; accepts string ID or HTMLElement reference
- **`destroy(id)`** — Removes editor, restores original textarea
- **`getInstance(id)`** — Returns existing instance or null
- **`getHTML(id)`** / **`setHTML(id, html)`** — Get/set editor content programmatically
- **`isEmpty(id)`** — Returns true if editor has no text content
- **`focus(id)`** — Focuses the editor area
- **`enable(id)`** / **`disable(id)`** — Toggle editability with visual feedback
- **`locales`** — Exposed for runtime locale registration
- **Event callbacks** — `onChange`, `onFocus`, `onBlur`, `onReady` options
- **Toolbar customization** — `toolbar` option filters buttons by command name, alias, or group label
- **Word count** — Optional status bar with word & character count (`wordCount: true`)

### Theming & i18n
- **CSS custom properties** (`--zw-*`) — 18 variables for easy dark/light/custom themes
- **Light theme** (default) — Clean white background, blue accent
- **Dark theme** — `themes/dark.css` with dark blue/purple background, red accent
- **7 built-in locales** — English (`en`), Spanish (`es`), French (`fr`), German (`de`), Portuguese (`pt`), Italian (`it`), Japanese (`ja`)
- Custom locale objects supported — pass any `{ key: 'translation' }` object
- External locale files loadable via `<script>` tag

### Visual Design
- **SVG toolbar icons** — All 35+ toolbar buttons use clean inline SVG icons (18×18 viewBox, Lucide-style). Professional, consistent appearance across all browsers
- **CSS variable theming** — Works with any design system via `--zw-*` variables

### Accessibility
- ARIA `aria-label` and `role="button"` on all toolbar buttons
- Toolbar has `role="toolbar"` and groups have `role="group"` for screen readers
- Disabled state with visual feedback (`.zw-disabled` class)

### TypeScript
- **Type declarations** — `src/zero-wysiwyg.d.ts` with full types for all API methods, `InitOptions` (including `toolbarMode`, `slashCommands`), `LocaleStrings`, `ToolbarButtonName`, `ToolbarGroupName`, and `EditorInstance` interfaces

### Examples & Framework Support
- **5 HTML examples** — basic, dark-theme, form-integration, custom-theme, multiple-editors
- **React wrapper** — `examples/react/WysiwygEditor.jsx` with hooks
- **Vue wrapper** — `examples/vue/WysiwygEditor.vue` with `v-model` support
- **PHP template** — `examples/php-template/editor.php` with CSRF and POST handling
- **Django template** — `examples/django/editor.html` with example views in comments

### Build & Distribution
- **IIFE module pattern** — works as global `ZeroWysiwyg` with `<script>` tag
- **UMD wrapper** — AMD, CommonJS, and browser global support
- **Build script** — `build.js` using terser + clean-css for minification
- **npm-ready** — `package.json` with `main`, `module`, `types`, `exports`, `unpkg`, `jsdelivr` fields

### Technical Details
- **~102 KB JS** (2090 lines), **~22 KB CSS** (585 lines), **~8 KB TypeScript declarations** (229 lines) — all unminified
- 10 public API methods + `locales` object exported
- 8 toolbar groups: format, headings, lists, alignment, insert, color, history, utilities
- 33 toolbar buttons with 35 inline SVG icons
- 40-color swatch palette (grays, vivid, muted/document, and dark tone rows)
- ~320 built-in emojis across 6 categories with search filter
- 12 slash commands (Paragraph, H2–H4, Blockquote, Bullet/Numbered/Task List, Table, HR, Image, YouTube)
- 7 locale files × 40+ i18n keys each (EN, ES, FR, DE, PT, IT, JA)
- Self-contained dialog buttons (`.zw-btn` classes, no external CSS dependency)
- Zero dependencies maintained throughout
