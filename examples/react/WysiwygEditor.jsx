/**
 * Zero WYSIWYG — React Wrapper Component
 *
 * Usage:
 *   import WysiwygEditor from './WysiwygEditor';
 *   <WysiwygEditor id="content" height="400px" locale="en" theme="dark" onChange={setHtml} />
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

        const inst = window.ZeroWysiwyg.init(id, {
            height,
            locale,
            theme,
            wordCount,
            toolbarMode,
            slashCommands,
            onChange: handleChange,
            onReady,
            onFocus,
            onBlur,
        });

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