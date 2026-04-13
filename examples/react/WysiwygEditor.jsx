/**
 * Zero WYSIWYG — React Wrapper Component
 *
 * Usage:
 *   import WysiwygEditor from './WysiwygEditor';
 *   <WysiwygEditor id="content" height="400px" locale="en" theme="dark" onChange={setHtml} />
 *
 * v1.1.0 features:
 *   - slashItems: custom slash command items array
 *   - autoLink: auto-convert pasted URLs to links
 *   - getMarkdown/setMarkdown via ref or window.ZeroWysiwyg API
 *
 * Requirements:
 *   - Include zero-wysiwyg.css in your HTML or import it
 *   - Include zero-wysiwyg.js before your React bundle, or import it
 */
import { useRef, useEffect, useCallback } from 'react';

export default function WysiwygEditor({
    id = 'editor',
    value = '',
    height = '400px',
    locale = 'en',
    theme = null,
    wordCount = false,
    toolbarMode = 'top',
    slashCommands = false,
    slashItems = null,
    autoLink = false,
    onChange = null,
    onReady = null,
    onFocus = null,
    onBlur = null,
    className = '',
    ...rest
}) {
    const textareaRef = useRef(null);
    const initialized = useRef(false);

    const handleChange = useCallback((html) => {
        if (onChange) onChange(html);
    }, [onChange]);

    useEffect(() => {
        if (initialized.current) return;
        if (!window.ZeroWysiwyg) {
            console.error('ZeroWysiwyg not loaded. Include zero-wysiwyg.js before your React bundle.');
            return;
        }

        const opts = {
            height,
            locale,
            theme,
            wordCount,
            toolbarMode,
            slashCommands,
            autoLink,
            onChange: handleChange,
            onReady,
            onFocus,
            onBlur,
        };

        // Add custom slash items if provided
        if (slashItems && slashItems.length > 0) {
            opts.slashItems = slashItems;
        }

        window.ZeroWysiwyg.init(id, opts);
        initialized.current = true;

        return () => {
            window.ZeroWysiwyg.destroy(id);
            initialized.current = false;
        };
    }, [id]); // Only run once per mount

    // Sync external value changes
    useEffect(() => {
        if (initialized.current && window.ZeroWysiwyg && value !== undefined) {
            const current = window.ZeroWysiwyg.getHTML(id);
            if (current !== value) {
                window.ZeroWysiwyg.setHTML(id, value);
            }
        }
    }, [value, id]);

    return (
        <div className={className}>
            <textarea
                ref={textareaRef}
                id={id}
                name={id}
                defaultValue={value}
                style={{ width: '100%' }}
                {...rest}
            />
        </div>
    );
}

/**
 * Helper hooks for accessing Markdown API:
 *
 * // Get Markdown from the editor
 * const md = window.ZeroWysiwyg.getMarkdown('editor');
 *
 * // Set Markdown into the editor (converts to HTML)
 * window.ZeroWysiwyg.setMarkdown('editor', '# Hello\n**Bold** text');
 *
 * // Example: submit both HTML and Markdown
 * function handleSubmit() {
 *     const html = window.ZeroWysiwyg.getHTML('editor');
 *     const markdown = window.ZeroWysiwyg.getMarkdown('editor');
 *     fetch('/api/articles', {
 *         method: 'POST',
 *         body: JSON.stringify({ html, markdown })
 *     });
 * }
 */
