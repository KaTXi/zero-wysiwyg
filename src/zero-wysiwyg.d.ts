/**
 * Zero WYSIWYG Editor — TypeScript Declarations
 *
 * @license MIT
 * @see https://github.com/KaTXi/zero-wysiwyg
 */

declare namespace ZeroWysiwyg {
    /** Locale string keys used by the editor UI */
    interface LocaleStrings {
        bold?: string;
        italic?: string;
        underline?: string;
        strikethrough?: string;
        heading2?: string;
        heading3?: string;
        heading4?: string;
        paragraph?: string;
        bulletList?: string;
        numberedList?: string;
        indent?: string;
        outdent?: string;
        alignLeft?: string;
        alignCenter?: string;
        alignRight?: string;
        insertLink?: string;
        removeLink?: string;
        insertImage?: string;
        insertYouTube?: string;
        horizontalRule?: string;
        clearFormat?: string;
        viewSource?: string;
        fullscreen?: string;
        editLink?: string;
        insertLinkTitle?: string;
        url?: string;
        openNewWindow?: string;
        ok?: string;
        cancel?: string;
        removeLinkBtn?: string;
        editImage?: string;
        insertImageTitle?: string;
        imageUrl?: string;
        altText?: string;
        dimensions?: string;
        widthPlaceholder?: string;
        heightPlaceholder?: string;
        emptyOriginal?: string;
        insertYouTubeTitle?: string;
        youtubeUrl?: string;
        placeholder?: string;
        deleteHint?: string;
        iframeEmbed?: string;
        subscript?: string;
        superscript?: string;
        blockquote?: string;
        undo?: string;
        redo?: string;
        insertTable?: string;
        insertTableTitle?: string;
        rows?: string;
        columns?: string;
        tableGrid?: string;
        textColor?: string;
        bgColor?: string;
        colorPickerTitle?: string;
        removeColor?: string;
        insertEmoji?: string;
        emojiSearch?: string;
        emojiRecent?: string;
        emojiSmileys?: string;
        emojiNature?: string;
        emojiFood?: string;
        emojiTravel?: string;
        emojiObjects?: string;
        emojiSymbols?: string;
        taskList?: string;
        slashCommandHint?: string;
        find?: string;
        replace?: string;
        replaceAll?: string;
        matchCase?: string;
        noResults?: string;
        matchCount?: string;
        findReplace?: string;
        slashParagraph?: string;
        slashHeading2?: string;
        slashHeading3?: string;
        slashHeading4?: string;
        slashBlockquote?: string;
        slashBulletList?: string;
        slashNumberedList?: string;
        slashTaskList?: string;
        slashTable?: string;
        slashHorizontalRule?: string;
        slashImage?: string;
        slashYouTube?: string;
        insertCodeBlock?: string;
        codeLanguage?: string;
        addRowAbove?: string;
        addRowBelow?: string;
        addColLeft?: string;
        addColRight?: string;
        deleteRow?: string;
        deleteCol?: string;
        deleteTable?: string;
        toggleHeader?: string;
        [key: string]: string | undefined;
    }

    /** Button names that can be used in the toolbar filter */
    type ToolbarButtonName =
        | 'bold' | 'italic' | 'underline' | 'strikeThrough'
        | 'subscript' | 'superscript'
        | 'h2' | 'h3' | 'h4' | 'blockquote'
        | 'ul' | 'ol' | 'indent' | 'outdent'
        | 'justifyLeft' | 'justifyCenter' | 'justifyRight'
        | 'link' | 'unlink' | 'image' | 'youtube' | 'table' | 'hr' | 'emoji' | 'codeBlock'
        | 'textColor' | 'bgColor'
        | 'taskList'
        | 'undo' | 'redo'
        | 'removeFormat' | 'source' | 'fullscreen';

    /** Group labels that can be used in the toolbar filter */
    type ToolbarGroupName =
        | 'format' | 'headings' | 'lists' | 'alignment'
        | 'insert' | 'color' | 'history' | 'utilities';

    /** Options for ZeroWysiwyg.init() */
    interface InitOptions {
        /** Minimum height of the editor area. Default: '400px' */
        height?: string;

        /** Language code ('en', 'es') or custom locale object */
        locale?: string | LocaleStrings;

        /** Theme name — adds `zw-theme-{value}` class to wrapper (e.g., 'dark') */
        theme?: string;

        /** Show word/character count status bar at bottom. Default: false */
        wordCount?: boolean;

        /** Auto-detect and linkify URLs as user types. Default: true */
        autoLink?: boolean;

        /** Toolbar display mode: 'top' (default), 'balloon' (floating on selection), 'both' */
        toolbarMode?: 'top' | 'balloon' | 'both';

        /** Enable slash commands (type / to trigger). Default: false */
        slashCommands?: boolean;

        /** Called with HTML string on every content change */
        onChange?: (html: string) => void;

        /** Called when editor gains focus */
        onFocus?: () => void;

        /** Called when editor loses focus */
        onBlur?: () => void;

        /** Called with instance after initialization */
        onReady?: (instance: EditorInstance) => void;

        /** Filter visible toolbar buttons by command name or group label */
        toolbar?: Array<ToolbarButtonName | ToolbarGroupName | string>;
    }

    /** Internal editor instance (returned by init and getInstance) */
    interface EditorInstance {
        textarea: HTMLTextAreaElement;
        wrapper: HTMLDivElement;
        toolbar: HTMLDivElement;
        editor: HTMLDivElement;
        sourceView: HTMLTextAreaElement;
        isSourceMode: boolean;
        isFullscreen: boolean;
    }

    /**
     * Creates an editor instance for the given textarea.
     * @param textareaIdOrElement — string ID or HTMLTextAreaElement reference
     * @param options — configuration options
     * @returns The editor instance, or undefined if textarea not found
     */
    function init(textareaIdOrElement: string | HTMLTextAreaElement, options?: InitOptions): EditorInstance | undefined;

    /**
     * Returns the existing instance for a textarea, or null.
     */
    function getInstance(textareaId: string): EditorInstance | null;

    /**
     * Removes the editor and restores the original textarea.
     */
    function destroy(textareaId: string): void;

    /**
     * Returns the cleaned HTML content of the editor.
     */
    function getHTML(textareaId: string): string;

    /**
     * Programmatically sets the editor content.
     */
    function setHTML(textareaId: string, html: string): void;

    /**
     * Returns the editor content converted to Markdown.
     */
    function getMarkdown(textareaId: string): string;

    /**
     * Sets the editor content from a Markdown string.
     */
    function setMarkdown(textareaId: string, md: string): void;

    /**
     * Returns true if the editor has no text content.
     */
    function isEmpty(textareaId: string): boolean;

    /**
     * Focuses the editor area.
     */
    function focus(textareaId: string): void;

    /**
     * Re-enables a disabled editor and restores toolbar interactivity.
     */
    function enable(textareaId: string): void;

    /**
     * Disables the editor — makes it read-only and greys out the toolbar.
     */
    function disable(textareaId: string): void;

    /**
     * Object containing all registered locales.
     * Add your own: ZeroWysiwyg.locales.fr = { bold: 'Gras', ... }
     */
    const locales: {
        en: LocaleStrings;
        es: LocaleStrings;
        [key: string]: LocaleStrings;
    };
}

export = ZeroWysiwyg;
export as namespace ZeroWysiwyg;
