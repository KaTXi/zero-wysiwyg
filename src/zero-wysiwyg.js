/**
 * Zero WYSIWYG Editor
 *
 * A lightweight, zero-dependency HTML editor using contentEditable.
 * Built-in YouTube embeds, image resize, dark/light themes, and i18n.
 *
 * Originally developed for the admin panel of https://todojuegos.com
 * by Alejandro Reyero (areyero@hotmail.com)
 *
 * @license MIT
 * @see https://github.com/KaTXi/zero-wysiwyg
 */
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD (RequireJS)
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS (Node, Webpack, Browserify)
        module.exports = factory();
    } else {
        // Browser global
        root.ZeroWysiwyg = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    var instances = {};
    var IFRAME_REGEX = /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;
    var YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    var PLACEHOLDER_ATTR = 'data-zw-iframe-placeholder';
    var activeResizeState = null;
    var _activeBalloon = null; // Track active balloon toolbar
    var _activeSlashMenu = null; // Track active slash command menu

    // ==============================
    // SVG Icons (18×18 viewBox, 1.5px stroke)
    // ==============================
    var SVG = (function() {
        var s = function(d, extra) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + d + '</svg>';
        };
        return {
            bold:       s('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>'),
            italic:     s('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
            underline:  s('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>'),
            strikethrough: s('<line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 5 10 5 10 8 0 2.5-2 4-5 4s-4-2-4-2"/>'),
            subscript:  s('<text x="3" y="15" font-size="14" fill="currentColor" stroke="none" font-weight="600">X</text><text x="13" y="20" font-size="10" fill="currentColor" stroke="none">2</text>'),
            superscript:s('<text x="3" y="17" font-size="14" fill="currentColor" stroke="none" font-weight="600">X</text><text x="13" y="10" font-size="10" fill="currentColor" stroke="none">2</text>'),
            h2:         s('<text x="2" y="17" font-size="16" fill="currentColor" stroke="none" font-weight="700">H2</text>'),
            h3:         s('<text x="2" y="17" font-size="16" fill="currentColor" stroke="none" font-weight="700">H3</text>'),
            h4:         s('<text x="2" y="17" font-size="16" fill="currentColor" stroke="none" font-weight="700">H4</text>'),
            paragraph:  s('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M13 4H9a4 4 0 0 0 0 8h4"/>'),
            blockquote: s('<path d="M6 17h2l2-4V7H4v6h4"/><path d="M16 17h2l2-4V7h-6v6h4"/>'),
            bulletList: s('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.5" fill="currentColor" stroke="none"/>'),
            numberedList: s('<line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="9" font-size="9" fill="currentColor" stroke="none" font-weight="600">1</text><text x="2" y="15" font-size="9" fill="currentColor" stroke="none" font-weight="600">2</text><text x="2" y="21" font-size="9" fill="currentColor" stroke="none" font-weight="600">3</text>'),
            indent:     s('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>'),
            outdent:    s('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>'),
            alignLeft:  s('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>'),
            alignCenter:s('<line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>'),
            alignRight: s('<line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>'),
            link:       s('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
            unlink:     s('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="1.5"/>'),
            image:      s('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
            youtube:    s('<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>'),
            table:      s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>'),
            hr:         s('<line x1="3" y1="12" x2="21" y2="12" stroke-width="3"/>'),
            textColor:  s('<path d="M4 20h16"/><path d="M9.5 4h5L18 16H6z" fill="none"/><text x="8" y="15" font-size="12" fill="currentColor" stroke="none" font-weight="700">A</text>', ' style="border-bottom:3px solid var(--zw-accent)"'),
            bgColor:    s('<rect x="2" y="14" width="20" height="7" rx="1" fill="currentColor" opacity="0.2" stroke="none"/><text x="6" y="14" font-size="14" fill="currentColor" stroke="none" font-weight="700">A</text>'),
            undo:       s('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>'),
            redo:       s('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/>'),
            clearFormat:s('<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="3" y1="21" x2="21" y2="3" stroke-width="1.5"/>'),
            source:     s('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
            fullscreen: s('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'),
            emoji:      s('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" stroke-width="3" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke-width="3" stroke-linecap="round"/>'),
            taskList:   s('<rect x="3" y="3" width="6" height="6" rx="1"/><polyline points="4.5 6 5.5 7.5 8 4.5" stroke-width="1.5"/><line x1="13" y1="6" x2="21" y2="6"/><rect x="3" y="15" width="6" height="6" rx="1"/><line x1="13" y1="18" x2="21" y2="18"/>'),
            search:     s('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
            slashCmd:   s('<text x="4" y="19" font-size="20" fill="currentColor" stroke="none" font-weight="300">/</text>'),
            codeBlock:  s('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="10" y1="2" x2="14" y2="22" stroke-width="1.5" opacity="0.5"/>'),
            tableMenu:  s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><circle cx="17" cy="17" r="4" fill="currentColor" stroke="none" opacity="0.6"/>')
        };
    })();

    // ==============================
    // i18n — Locale System
    // ==============================
    var locales = {};
    locales.en = {
        bold: 'Bold (Ctrl+B)', italic: 'Italic (Ctrl+I)', underline: 'Underline (Ctrl+U)',
        strikethrough: 'Strikethrough', subscript: 'Subscript', superscript: 'Superscript',
        heading2: 'Heading 2', heading3: 'Heading 3',
        heading4: 'Heading 4', paragraph: 'Paragraph', blockquote: 'Blockquote',
        bulletList: 'Bullet list',
        numberedList: 'Numbered list', indent: 'Increase indent / Nest list (Tab)',
        outdent: 'Decrease indent / Unnest list (Shift+Tab)', alignLeft: 'Align left',
        alignCenter: 'Center', alignRight: 'Align right', insertLink: 'Insert link',
        removeLink: 'Remove link', insertImage: 'Insert image',
        insertYouTube: 'Insert YouTube video', horizontalRule: 'Horizontal rule',
        clearFormat: 'Clear formatting', viewSource: 'View/edit HTML', fullscreen: 'Fullscreen',
        editLink: 'Edit Link', insertLinkTitle: 'Insert Link', url: 'URL:',
        openNewWindow: 'Open in new window', ok: 'OK', cancel: 'Cancel',
        removeLinkBtn: 'Remove link', editImage: 'Edit Image', insertImageTitle: 'Insert Image',
        imageUrl: 'Image URL:', altText: 'Alt text:', dimensions: 'Dimensions (px):',
        widthPlaceholder: 'Width', heightPlaceholder: 'Height', emptyOriginal: 'Empty = original',
        insertYouTubeTitle: 'Insert YouTube Video', youtubeUrl: 'YouTube URL or video ID:',
        placeholder: 'Write your content here...', deleteHint: 'Press Delete/Backspace to remove',
        iframeEmbed: 'Embedded iframe',
        undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)',
        insertTable: 'Insert table', insertTableTitle: 'Insert Table',
        rows: 'Rows:', columns: 'Columns:',
        tableGrid: 'Click to select size',
        textColor: 'Text color', bgColor: 'Background color',
        colorPickerTitle: 'Choose a color', removeColor: 'Remove color',
        insertEmoji: 'Insert emoji', emojiSearch: 'Search emojis...',
        emojiRecent: 'Frequently used', emojiSmileys: 'Smileys & People',
        emojiNature: 'Animals & Nature', emojiFood: 'Food & Drink',
        emojiTravel: 'Travel & Places', emojiObjects: 'Objects',
        emojiSymbols: 'Symbols',
        taskList: 'Task list',
        slashCommandHint: 'Type to filter commands...',
        find: 'Find', replace: 'Replace', replaceAll: 'Replace all',
        matchCase: 'Match case', noResults: 'No results',
        matchCount: '{current} of {total}',
        findReplace: 'Find & Replace (Ctrl+F)',
        slashParagraph: 'Paragraph', slashHeading2: 'Heading 2', slashHeading3: 'Heading 3',
        slashHeading4: 'Heading 4', slashBlockquote: 'Blockquote', slashBulletList: 'Bullet List',
        slashNumberedList: 'Numbered List', slashTaskList: 'Task List', slashTable: 'Table',
        slashHorizontalRule: 'Horizontal Rule', slashImage: 'Image', slashYouTube: 'YouTube Video',
        insertCodeBlock: 'Code block', codeLanguage: 'Language',
        addRowAbove: 'Add row above', addRowBelow: 'Add row below',
        addColLeft: 'Add column left', addColRight: 'Add column right',
        deleteRow: 'Delete row', deleteCol: 'Delete column', deleteTable: 'Delete table',
        toggleHeader: 'Toggle header row'
    };
    locales.es = {
        bold: 'Negrita (Ctrl+B)', italic: 'Cursiva (Ctrl+I)', underline: 'Subrayado (Ctrl+U)',
        strikethrough: 'Tachado', subscript: 'Subíndice', superscript: 'Superíndice',
        heading2: 'Encabezado 2', heading3: 'Encabezado 3',
        heading4: 'Encabezado 4', paragraph: 'Párrafo', blockquote: 'Cita',
        bulletList: 'Lista con viñetas',
        numberedList: 'Lista numerada', indent: 'Aumentar sangría / Anidar lista (Tab)',
        outdent: 'Reducir sangría / Desanidar lista (Shift+Tab)', alignLeft: 'Alinear izquierda',
        alignCenter: 'Centrar', alignRight: 'Alinear derecha', insertLink: 'Insertar enlace',
        removeLink: 'Quitar enlace', insertImage: 'Insertar imagen',
        insertYouTube: 'Insertar vídeo YouTube', horizontalRule: 'Línea horizontal',
        clearFormat: 'Limpiar formato', viewSource: 'Ver/editar HTML', fullscreen: 'Pantalla completa',
        editLink: 'Editar Enlace', insertLinkTitle: 'Insertar Enlace', url: 'URL:',
        openNewWindow: 'Abrir en ventana nueva', ok: 'Aceptar', cancel: 'Cancelar',
        removeLinkBtn: 'Quitar enlace', editImage: 'Editar Imagen', insertImageTitle: 'Insertar Imagen',
        imageUrl: 'URL de la imagen:', altText: 'Texto alternativo (alt):', dimensions: 'Dimensiones (px):',
        widthPlaceholder: 'Ancho', heightPlaceholder: 'Alto', emptyOriginal: 'Vacío = original',
        insertYouTubeTitle: 'Insertar Vídeo YouTube', youtubeUrl: 'URL de YouTube o ID del vídeo:',
        placeholder: 'Escribe el contenido aquí...', deleteHint: 'Pulsa Supr/Retroceso para eliminar',
        iframeEmbed: 'Iframe embebido',
        undo: 'Deshacer (Ctrl+Z)', redo: 'Rehacer (Ctrl+Y)',
        insertTable: 'Insertar tabla', insertTableTitle: 'Insertar Tabla',
        rows: 'Filas:', columns: 'Columnas:',
        tableGrid: 'Haz clic para seleccionar tamaño',
        textColor: 'Color de texto', bgColor: 'Color de fondo',
        colorPickerTitle: 'Elegir un color', removeColor: 'Quitar color',
        insertEmoji: 'Insertar emoji', emojiSearch: 'Buscar emojis...',
        emojiRecent: 'Usados frecuentemente', emojiSmileys: 'Emoticonos y personas',
        emojiNature: 'Animales y naturaleza', emojiFood: 'Comida y bebida',
        emojiTravel: 'Viajes y lugares', emojiObjects: 'Objetos',
        emojiSymbols: 'Símbolos',
        taskList: 'Lista de tareas',
        slashCommandHint: 'Escribe para filtrar comandos...',
        find: 'Buscar', replace: 'Reemplazar', replaceAll: 'Reemplazar todo',
        matchCase: 'Coincidir mayúsculas', noResults: 'Sin resultados',
        matchCount: '{current} de {total}',
        findReplace: 'Buscar y reemplazar (Ctrl+F)',
        slashParagraph: 'Párrafo', slashHeading2: 'Encabezado 2', slashHeading3: 'Encabezado 3',
        slashHeading4: 'Encabezado 4', slashBlockquote: 'Cita', slashBulletList: 'Lista con viñetas',
        slashNumberedList: 'Lista numerada', slashTaskList: 'Lista de tareas', slashTable: 'Tabla',
        slashHorizontalRule: 'Línea horizontal', slashImage: 'Imagen', slashYouTube: 'Vídeo YouTube',
        insertCodeBlock: 'Bloque de código', codeLanguage: 'Lenguaje',
        addRowAbove: 'Añadir fila arriba', addRowBelow: 'Añadir fila abajo',
        addColLeft: 'Añadir columna izquierda', addColRight: 'Añadir columna derecha',
        deleteRow: 'Eliminar fila', deleteCol: 'Eliminar columna', deleteTable: 'Eliminar tabla',
        toggleHeader: 'Alternar fila encabezado'
    };
    var _locale = 'en';
    function t(key) { var loc = locales[_locale] || locales.en; return loc[key] || locales.en[key] || key; }

    function getToolbarGroups() {
        return [
            { label: 'format', buttons: [
                { cmd: 'bold', icon: SVG.bold, titleKey: 'bold' },
                { cmd: 'italic', icon: SVG.italic, titleKey: 'italic' },
                { cmd: 'underline', icon: SVG.underline, titleKey: 'underline' },
                { cmd: 'strikeThrough', icon: SVG.strikethrough, titleKey: 'strikethrough' },
                { cmd: 'subscript', icon: SVG.subscript, titleKey: 'subscript' },
                { cmd: 'superscript', icon: SVG.superscript, titleKey: 'superscript' }
            ]},
            { label: 'headings', buttons: [
                { cmd: 'formatBlock', value: 'H2', icon: SVG.h2, titleKey: 'heading2' },
                { cmd: 'formatBlock', value: 'H3', icon: SVG.h3, titleKey: 'heading3' },
                { cmd: 'formatBlock', value: 'H4', icon: SVG.h4, titleKey: 'heading4' },
                { cmd: 'formatBlock', value: 'P', icon: SVG.paragraph, titleKey: 'paragraph' },
                { cmd: 'formatBlock', value: 'BLOCKQUOTE', icon: SVG.blockquote, titleKey: 'blockquote' }
            ]},
            { label: 'lists', buttons: [
                { cmd: 'insertUnorderedList', icon: SVG.bulletList, titleKey: 'bulletList' },
                { cmd: 'insertOrderedList', icon: SVG.numberedList, titleKey: 'numberedList' },
                { cmd: '_insertTaskList', icon: SVG.taskList, titleKey: 'taskList', custom: true },
                { cmd: 'indent', icon: SVG.indent, titleKey: 'indent' },
                { cmd: 'outdent', icon: SVG.outdent, titleKey: 'outdent' }
            ]},
            { label: 'alignment', buttons: [
                { cmd: 'justifyLeft', icon: SVG.alignLeft, titleKey: 'alignLeft' },
                { cmd: 'justifyCenter', icon: SVG.alignCenter, titleKey: 'alignCenter' },
                { cmd: 'justifyRight', icon: SVG.alignRight, titleKey: 'alignRight' }
            ]},
            { label: 'insert', buttons: [
                { cmd: '_createLink', icon: SVG.link, titleKey: 'insertLink', custom: true },
                { cmd: 'unlink', icon: SVG.unlink, titleKey: 'removeLink' },
                { cmd: '_insertImage', icon: SVG.image, titleKey: 'insertImage', custom: true },
                { cmd: '_insertYouTube', icon: SVG.youtube, titleKey: 'insertYouTube', custom: true },
                { cmd: '_insertTable', icon: SVG.table, titleKey: 'insertTable', custom: true },
                { cmd: 'insertHorizontalRule', icon: SVG.hr, titleKey: 'horizontalRule' },
                { cmd: '_insertEmoji', icon: SVG.emoji, titleKey: 'insertEmoji', custom: true },
                { cmd: '_insertCodeBlock', icon: SVG.codeBlock, titleKey: 'insertCodeBlock', custom: true }
            ]},
            { label: 'color', buttons: [
                { cmd: '_textColor', icon: SVG.textColor, titleKey: 'textColor', custom: true },
                { cmd: '_bgColor', icon: SVG.bgColor, titleKey: 'bgColor', custom: true }
            ]},
            { label: 'history', buttons: [
                { cmd: 'undo', icon: SVG.undo, titleKey: 'undo' },
                { cmd: 'redo', icon: SVG.redo, titleKey: 'redo' }
            ]},
            { label: 'utilities', buttons: [
                { cmd: 'removeFormat', icon: SVG.clearFormat, titleKey: 'clearFormat' },
                { cmd: '_toggleSource', icon: SVG.source, titleKey: 'viewSource', custom: true },
                { cmd: '_fullscreen', icon: SVG.fullscreen, titleKey: 'fullscreen', custom: true }
            ]}
        ];
    }

    /* ===========================
       IMAGE RESIZE
       =========================== */

    function showImageResizeHandles(inst, img) {
        removeImageResizeHandles(inst);
        var wrapper = document.createElement('span');
        wrapper.className = 'zw-img-resize-wrapper';
        wrapper.contentEditable = 'false';
        wrapper.setAttribute('data-zw-resize-wrapper', '1');
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        var positions = ['nw', 'ne', 'sw', 'se'];
        for (var i = 0; i < positions.length; i++) {
            var handle = document.createElement('div');
            handle.className = 'zw-img-resize-handle zw-img-resize-' + positions[i];
            handle.setAttribute('data-handle', positions[i]);
            handle.addEventListener('mousedown', startResize.bind(null, inst, img));
            wrapper.appendChild(handle);
        }

        var badge = document.createElement('div');
        badge.className = 'zw-img-size-badge';
        badge.textContent = (img.width || img.naturalWidth) + ' × ' + (img.height || img.naturalHeight);
        wrapper.appendChild(badge);

        inst._selectedImg = img;
        inst._resizeWrapper = wrapper;
    }

    function removeImageResizeHandles(inst) {
        if (inst._resizeWrapper) {
            var wrapper = inst._resizeWrapper;
            var img = inst._selectedImg;
            if (wrapper.parentNode && img) {
                wrapper.parentNode.insertBefore(img, wrapper);
                wrapper.remove();
            }
            inst._resizeWrapper = null;
            inst._selectedImg = null;
        }
    }

    function startResize(inst, img, e) {
        e.preventDefault();
        e.stopPropagation();
        activeResizeState = {
            inst: inst, img: img,
            startX: e.clientX, startY: e.clientY,
            startW: img.offsetWidth, startH: img.offsetHeight,
            aspectRatio: img.offsetWidth / img.offsetHeight,
            handle: e.target.getAttribute('data-handle')
        };
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);
    }

    function onResizeMove(e) {
        if (!activeResizeState) return;
        var s = activeResizeState;
        var dx = e.clientX - s.startX;
        var newW;
        if (s.handle === 'se' || s.handle === 'ne') {
            newW = Math.max(50, s.startW + dx);
        } else {
            newW = Math.max(50, s.startW - dx);
        }
        var newH = Math.round(newW / s.aspectRatio);
        s.img.style.width = newW + 'px';
        s.img.style.height = newH + 'px';
        s.img.setAttribute('width', newW);
        s.img.setAttribute('height', newH);
        var badge = s.inst._resizeWrapper ? s.inst._resizeWrapper.querySelector('.zw-img-size-badge') : null;
        if (badge) badge.textContent = newW + ' × ' + newH;
    }

    function onResizeEnd() {
        if (!activeResizeState) return;
        var s = activeResizeState;
        var finalW = s.img.offsetWidth;
        var finalH = s.img.offsetHeight;
        s.img.setAttribute('width', finalW);
        s.img.setAttribute('height', finalH);
        s.img.style.width = finalW + 'px';
        s.img.style.height = finalH + 'px';
        syncToTextarea(s.inst);
        activeResizeState = null;
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeEnd);
    }

    /* ===========================
       VIDEO RESIZE & ALIGNMENT
       =========================== */

    var activeVideoResizeState = null;

    function showVideoResizeHandles(inst, placeholder) {
        removeVideoResizeHandles(inst);
        removeImageResizeHandles(inst);

        // Add resize outline class
        placeholder.classList.add('zw-video-selected');

        // Add corner handles
        var positions = ['nw', 'ne', 'sw', 'se'];
        for (var i = 0; i < positions.length; i++) {
            var handle = document.createElement('div');
            handle.className = 'zw-video-resize-handle zw-video-resize-' + positions[i];
            handle.setAttribute('data-handle', positions[i]);
            handle.addEventListener('mousedown', startVideoResize.bind(null, inst, placeholder));
            placeholder.appendChild(handle);
        }

        // Add size badge
        var badge = document.createElement('div');
        badge.className = 'zw-video-size-badge';
        var w = placeholder.offsetWidth;
        var h = placeholder.offsetHeight;
        badge.textContent = w + ' × ' + h;
        placeholder.appendChild(badge);

        // Add alignment toolbar
        var alignBar = document.createElement('div');
        alignBar.className = 'zw-video-align-bar';
        alignBar.contentEditable = 'false';
        var aligns = [
            { val: 'left', icon: '⫷', titleKey: 'alignLeft' },
            { val: 'center', icon: '⫸', titleKey: 'alignCenter' },
            { val: 'right', icon: '⫸', titleKey: 'alignRight' }
        ];
        var currentAlign = placeholder.getAttribute('data-align') || 'center';
        for (var a = 0; a < aligns.length; a++) {
            var abtn = document.createElement('button');
            abtn.type = 'button';
            abtn.className = 'zw-video-align-btn' + (aligns[a].val === currentAlign ? ' active' : '');
            abtn.setAttribute('data-align', aligns[a].val);
            abtn.title = aligns[a].titleKey ? t(aligns[a].titleKey) : '';
            abtn.textContent = aligns[a].icon;
            abtn.addEventListener('click', (function(align, ph, bar) {
                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    setVideoAlignment(inst, ph, align);
                    // Update active state
                    var btns = bar.querySelectorAll('.zw-video-align-btn');
                    for (var bb = 0; bb < btns.length; bb++) btns[bb].classList.remove('active');
                    this.classList.add('active');
                };
            })(aligns[a].val, placeholder, alignBar));
            alignBar.appendChild(abtn);
        }
        placeholder.appendChild(alignBar);

        inst._selectedVideo = placeholder;
    }

    function removeVideoResizeHandles(inst) {
        if (inst._selectedVideo) {
            var ph = inst._selectedVideo;
            ph.classList.remove('zw-video-selected');
            var handles = ph.querySelectorAll('.zw-video-resize-handle');
            for (var i = 0; i < handles.length; i++) handles[i].remove();
            var badge = ph.querySelector('.zw-video-size-badge');
            if (badge) badge.remove();
            var bar = ph.querySelector('.zw-video-align-bar');
            if (bar) bar.remove();
            inst._selectedVideo = null;
        }
    }

    function setVideoAlignment(inst, placeholder, align) {
        placeholder.setAttribute('data-align', align);
        // Apply visual style
        if (align === 'center') {
            placeholder.style.marginLeft = 'auto';
            placeholder.style.marginRight = 'auto';
            placeholder.style.float = '';
        } else if (align === 'left') {
            placeholder.style.marginLeft = '0';
            placeholder.style.marginRight = 'auto';
            placeholder.style.float = '';
        } else if (align === 'right') {
            placeholder.style.marginLeft = 'auto';
            placeholder.style.marginRight = '0';
            placeholder.style.float = '';
        }
        syncToTextarea(inst);
    }

    function startVideoResize(inst, placeholder, e) {
        e.preventDefault();
        e.stopPropagation();
        var w = placeholder.offsetWidth;
        var h = placeholder.offsetHeight;
        activeVideoResizeState = {
            inst: inst, placeholder: placeholder,
            startX: e.clientX, startY: e.clientY,
            startW: w, startH: h,
            aspectRatio: w / h,
            handle: e.target.getAttribute('data-handle')
        };
        document.addEventListener('mousemove', onVideoResizeMove);
        document.addEventListener('mouseup', onVideoResizeEnd);
    }

    function onVideoResizeMove(e) {
        if (!activeVideoResizeState) return;
        var s = activeVideoResizeState;
        var dx = e.clientX - s.startX;
        var newW;
        if (s.handle === 'se' || s.handle === 'ne') {
            newW = Math.max(200, s.startW + dx);
        } else {
            newW = Math.max(200, s.startW - dx);
        }
        var newH = Math.round(newW / s.aspectRatio);
        s.placeholder.style.width = newW + 'px';
        s.placeholder.style.maxWidth = newW + 'px';
        s.placeholder.style.height = newH + 'px';
        s.placeholder.style.aspectRatio = '';
        // Update stored iframe dimensions
        updateVideoIframeDimensions(s.placeholder, newW, newH);
        // Update badge
        var badge = s.placeholder.querySelector('.zw-video-size-badge');
        if (badge) badge.textContent = newW + ' × ' + newH;
    }

    function onVideoResizeEnd() {
        if (!activeVideoResizeState) return;
        var s = activeVideoResizeState;
        syncToTextarea(s.inst);
        activeVideoResizeState = null;
        document.removeEventListener('mousemove', onVideoResizeMove);
        document.removeEventListener('mouseup', onVideoResizeEnd);
    }

    function updateVideoIframeDimensions(placeholder, w, h) {
        var iframeHtml = placeholder.getAttribute('data-iframe-html');
        if (!iframeHtml) return;
        // Update width/height in the stored iframe HTML
        iframeHtml = iframeHtml.replace(/width=["']?\d+["']?/i, 'width="' + w + '"');
        iframeHtml = iframeHtml.replace(/height=["']?\d+["']?/i, 'height="' + h + '"');
        placeholder.setAttribute('data-iframe-html', iframeHtml);
    }

    /* ===========================
       LINK DIALOG
       =========================== */

    function showLinkDialog(inst) {
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var existingLink = null;
        var existingUrl = '';
        var existingTarget = '_blank';
        if (sel.anchorNode) {
            var node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
            existingLink = node ? node.closest('a') : null;
            if (existingLink) {
                existingUrl = existingLink.href || '';
                existingTarget = existingLink.target || '_self';
            }
        }

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog';
        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + (existingLink ? t('editLink') : t('insertLinkTitle')) + '</div>' +
            '<div class="zw-link-dialog-field">' +
                '<label>' + t('url') + '</label>' +
                '<input type="url" class="zw-link-url" value="' + escapeAttr(existingUrl || 'https://') + '" />' +
            '</div>' +
            '<div class="zw-link-dialog-field zw-link-dialog-checkbox">' +
                '<label><input type="checkbox" class="zw-link-newtab" ' +
                (existingTarget === '_blank' || !existingLink ? 'checked' : '') +
                ' /> ' + t('openNewWindow') + '</label>' +
            '</div>' +
            '<div class="zw-link-dialog-actions">' +
                '<button type="button" class="zw-btn zw-btn-primary zw-link-ok">' + t('ok') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-link-cancel">' + t('cancel') + '</button>' +
                (existingLink ? '<button type="button" class="zw-btn zw-btn-danger-ghost zw-link-remove">' + t('removeLinkBtn') + '</button>' : '') +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var urlInput = dialog.querySelector('.zw-link-url');
        var newTabCheck = dialog.querySelector('.zw-link-newtab');
        setTimeout(function() { urlInput.focus(); urlInput.select(); }, 50);

        function close() { overlay.remove(); }
        function restore() {
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
        }
        function apply() {
            var url = urlInput.value.trim();
            if (!url) return close();
            var openNew = newTabCheck.checked;
            restore();
            inst.editor.focus();
            if (existingLink) {
                existingLink.href = url;
                existingLink.target = openNew ? '_blank' : '_self';
                existingLink.rel = openNew ? 'noopener' : '';
            } else {
                document.execCommand('createLink', false, url);
                var s2 = window.getSelection();
                if (s2.anchorNode) {
                    var n2 = s2.anchorNode.nodeType === 1 ? s2.anchorNode : s2.anchorNode.parentElement;
                    var link = n2 ? n2.closest('a') : null;
                    if (link) { link.target = openNew ? '_blank' : '_self'; link.rel = openNew ? 'noopener' : ''; }
                }
            }
            syncToTextarea(inst);
            close();
        }

        dialog.querySelector('.zw-link-ok').addEventListener('click', apply);
        dialog.querySelector('.zw-link-cancel').addEventListener('click', close);
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
            if (e.key === 'Escape') close();
        });
        var removeBtn = dialog.querySelector('.zw-link-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                restore(); inst.editor.focus();
                document.execCommand('unlink', false, null);
                syncToTextarea(inst); close();
            });
        }
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       TABLE DIALOG
       =========================== */

    function showTableDialog(inst) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog';

        // Build grid picker (10x10)
        var maxR = 10, maxC = 10;
        var gridHtml = '<div class="zw-table-grid-wrapper">' +
            '<div class="zw-table-grid-label">1 × 1</div>' +
            '<div class="zw-table-grid">';
        for (var r = 0; r < maxR; r++) {
            for (var c = 0; c < maxC; c++) {
                gridHtml += '<div class="zw-table-grid-cell" data-row="' + (r + 1) + '" data-col="' + (c + 1) + '"></div>';
            }
        }
        gridHtml += '</div></div>';

        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + t('insertTableTitle') + '</div>' +
            gridHtml +
            '<div class="zw-link-dialog-field zw-img-dimensions" style="margin-top:16px">' +
                '<label>' + t('rows') + ' / ' + t('columns') + '</label>' +
                '<div class="zw-img-dim-row">' +
                    '<input type="number" class="zw-table-rows" value="3" min="1" max="20" style="width:80px" />' +
                    '<span class="zw-img-dim-x">×</span>' +
                    '<input type="number" class="zw-table-cols" value="3" min="1" max="20" style="width:80px" />' +
                '</div>' +
            '</div>' +
            '<div class="zw-link-dialog-actions">' +
                '<button type="button" class="zw-btn zw-btn-primary zw-table-ok">' + t('ok') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-table-cancel">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var rowsInput = dialog.querySelector('.zw-table-rows');
        var colsInput = dialog.querySelector('.zw-table-cols');
        var gridLabel = dialog.querySelector('.zw-table-grid-label');
        var gridCells = dialog.querySelectorAll('.zw-table-grid-cell');

        // Grid hover highlighting
        function highlightGrid(hoverR, hoverC) {
            for (var i = 0; i < gridCells.length; i++) {
                var cr = parseInt(gridCells[i].getAttribute('data-row'));
                var cc = parseInt(gridCells[i].getAttribute('data-col'));
                gridCells[i].classList.toggle('zw-table-grid-active', cr <= hoverR && cc <= hoverC);
            }
            gridLabel.textContent = hoverR + ' × ' + hoverC;
        }

        for (var gi = 0; gi < gridCells.length; gi++) {
            gridCells[gi].addEventListener('mouseenter', function() {
                var r = parseInt(this.getAttribute('data-row'));
                var c = parseInt(this.getAttribute('data-col'));
                highlightGrid(r, c);
                rowsInput.value = r;
                colsInput.value = c;
            });
            gridCells[gi].addEventListener('click', function(e) {
                e.preventDefault();
                applyTable();
            });
        }

        function close() { overlay.remove(); }
        function applyTable() {
            var rows = parseInt(rowsInput.value) || 3;
            var cols = parseInt(colsInput.value) || 3;
            rows = Math.max(1, Math.min(20, rows));
            cols = Math.max(1, Math.min(20, cols));

            var html = '<table><tbody>';
            for (var r = 0; r < rows; r++) {
                html += '<tr>';
                for (var c = 0; c < cols; c++) {
                    if (r === 0) {
                        html += '<th>&nbsp;</th>';
                    } else {
                        html += '<td>&nbsp;</td>';
                    }
                }
                html += '</tr>';
            }
            html += '</tbody></table><p><br></p>';

            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            document.execCommand('insertHTML', false, html);
            syncToTextarea(inst);
            close();
        }

        dialog.querySelector('.zw-table-ok').addEventListener('click', applyTable);
        dialog.querySelector('.zw-table-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       COLOR PICKER
       =========================== */

    var COLOR_PALETTE = [
        // Row 1: Grays
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
        // Row 2: Vivid colors
        '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#f4cccc', '#fce5cd',
        // Row 3: Muted / document colors
        '#980000', '#ff6600', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47', '#e06666', '#f9cb9c',
        // Row 4: Darker tones
        '#660000', '#cc3300', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130', '#cc4125', '#e69138'
    ];

    function showColorPicker(inst, command) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog zw-color-picker-dialog';

        var titleKey = command === 'foreColor' ? 'textColor' : 'bgColor';
        var swatchesHtml = '<div class="zw-color-swatches">';
        for (var i = 0; i < COLOR_PALETTE.length; i++) {
            swatchesHtml += '<button type="button" class="zw-color-swatch" data-color="' +
                COLOR_PALETTE[i] + '" style="background:' + COLOR_PALETTE[i] + '" title="' +
                COLOR_PALETTE[i] + '"></button>';
        }
        swatchesHtml += '</div>';

        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + t(titleKey) + '</div>' +
            swatchesHtml +
            '<div class="zw-color-custom-row">' +
                '<input type="color" class="zw-color-input" value="#000000" />' +
                '<input type="text" class="zw-color-hex" value="#000000" placeholder="#hex" maxlength="7" />' +
                '<button type="button" class="zw-btn zw-btn-primary zw-color-apply">' + t('ok') + '</button>' +
            '</div>' +
            '<div class="zw-link-dialog-actions" style="border-top:none;padding-top:8px">' +
                '<button type="button" class="zw-btn zw-btn-danger-ghost zw-color-remove" style="margin-left:0">' + t('removeColor') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-color-cancel" style="margin-left:auto">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var colorInput = dialog.querySelector('.zw-color-input');
        var hexInput = dialog.querySelector('.zw-color-hex');

        // Sync native color picker ↔ hex input
        colorInput.addEventListener('input', function() {
            hexInput.value = colorInput.value;
        });
        hexInput.addEventListener('input', function() {
            if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
                colorInput.value = hexInput.value;
            }
        });

        function close() { overlay.remove(); }
        function applyColor(color) {
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            document.execCommand(command, false, color);
            syncToTextarea(inst);
            close();
        }

        // Swatch clicks
        var swatches = dialog.querySelectorAll('.zw-color-swatch');
        for (var si = 0; si < swatches.length; si++) {
            swatches[si].addEventListener('click', function(e) {
                e.preventDefault();
                applyColor(this.getAttribute('data-color'));
            });
        }

        // Custom color apply
        dialog.querySelector('.zw-color-apply').addEventListener('click', function() {
            applyColor(hexInput.value || colorInput.value);
        });

        // Remove color
        dialog.querySelector('.zw-color-remove').addEventListener('click', function() {
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            if (command === 'foreColor') {
                document.execCommand('removeFormat', false, null);
            } else {
                document.execCommand('hiliteColor', false, 'transparent');
            }
            syncToTextarea(inst);
            close();
        });

        dialog.querySelector('.zw-color-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       EMOJI PICKER
       =========================== */

    var EMOJI_DATA = {
        emojiSmileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','😝','🤗','🤔','🤭','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😡','🤯','😱','😨','😰','😥','🤫','🤥','😈','👻','💀','👽','🤖','💩','🤡'],
        emojiNature: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🌸','🌼','🌻','🌺','🌹','🌷','🌱','🌲','🌳','🍀','🍁','🍂','🍃','🌍','🌞','⭐','🌈','☁️','❄️','🔥','💧'],
        emojiFood: ['🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍑','🍒','🥝','🍅','🥑','🍆','🥕','🌽','🌶️','🥒','🥦','🍄','🥜','🍞','🥐','🥖','🧀','🥚','🍳','🥞','🥩','🍗','🍔','🍟','🍕','🌭','🥪','🌮','🍣','🍱','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','☕','🍵','🍺','🍷','🥤','🧃','🍹'],
        emojiTravel: ['🚗','🚕','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','✈️','🚀','🛸','🚁','⛵','🚢','🏠','🏢','🏰','🗼','🗽','⛪','🕌','🛕','🏥','🏦','🏨','🏪','🏫','🎡','🎢','🎠','⛱️','🏖️','🏔️','🗻','🌋','🏕️','🌄','🌅','🌉','🌁','🗺️'],
        emojiObjects: ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📷','📹','🎥','📺','📻','🎙️','🎧','🎤','🔔','📢','📣','🔊','🔇','💡','🔦','🕯️','📖','📚','📝','✏️','🖊️','📌','📎','🔑','🔒','🔓','❤️','🧡','💛','💚','💙','💜','🖤','💔','✨','🎉','🎊','🎁','🏆','🥇','🎵','🎶'],
        emojiSymbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☯️','✡️','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','🔀','🔁','▶️','⏩','⏭️','⏸️','⏹️','⏺️','🔆','🔅','✅','❌','❓','❗','‼️','⁉️','➕','➖','➗','💲','♻️','🔰']
    };

    function showEmojiPicker(inst) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog zw-emoji-picker-dialog';

        // Build category tabs + grids
        var categories = ['emojiSmileys', 'emojiNature', 'emojiFood', 'emojiTravel', 'emojiObjects', 'emojiSymbols'];
        var tabsHtml = '<div class="zw-emoji-tabs">';
        var tabIcons = ['😀', '🐶', '🍎', '🚗', '💻', '❤️'];
        for (var ci = 0; ci < categories.length; ci++) {
            tabsHtml += '<button type="button" class="zw-emoji-tab' + (ci === 0 ? ' active' : '') + '" data-cat="' + categories[ci] + '" title="' + t(categories[ci]) + '">' + tabIcons[ci] + '</button>';
        }
        tabsHtml += '</div>';

        var gridsHtml = '';
        for (var gi = 0; gi < categories.length; gi++) {
            var emojis = EMOJI_DATA[categories[gi]];
            gridsHtml += '<div class="zw-emoji-grid' + (gi === 0 ? ' active' : '') + '" data-cat="' + categories[gi] + '">';
            for (var ei = 0; ei < emojis.length; ei++) {
                gridsHtml += '<button type="button" class="zw-emoji-item" data-emoji="' + emojis[ei] + '">' + emojis[ei] + '</button>';
            }
            gridsHtml += '</div>';
        }

        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + t('insertEmoji') + '</div>' +
            '<div class="zw-emoji-search-row"><input type="text" class="zw-emoji-search" placeholder="' + t('emojiSearch') + '" /></div>' +
            tabsHtml + gridsHtml +
            '<div class="zw-link-dialog-actions" style="border-top:none;padding-top:8px">' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-emoji-cancel" style="margin-left:auto">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var searchInput = dialog.querySelector('.zw-emoji-search');
        setTimeout(function() { searchInput.focus(); }, 50);

        function close() { overlay.remove(); }
        function insertEmoji(emoji) {
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            document.execCommand('insertText', false, emoji);
            syncToTextarea(inst);
            close();
        }

        // Click on emoji
        var items = dialog.querySelectorAll('.zw-emoji-item');
        for (var ii = 0; ii < items.length; ii++) {
            items[ii].addEventListener('click', function(e) {
                e.preventDefault();
                insertEmoji(this.getAttribute('data-emoji'));
            });
        }

        // Tab switching
        var tabs = dialog.querySelectorAll('.zw-emoji-tab');
        var grids = dialog.querySelectorAll('.zw-emoji-grid');
        for (var ti = 0; ti < tabs.length; ti++) {
            tabs[ti].addEventListener('click', function() {
                var cat = this.getAttribute('data-cat');
                for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
                for (var j = 0; j < grids.length; j++) grids[j].classList.remove('active');
                this.classList.add('active');
                dialog.querySelector('.zw-emoji-grid[data-cat="' + cat + '"]').classList.add('active');
                searchInput.value = '';
            });
        }

        // Search filter
        searchInput.addEventListener('input', function() {
            var q = searchInput.value.toLowerCase().trim();
            if (!q) {
                // Show current tab
                for (var j = 0; j < grids.length; j++) {
                    grids[j].classList.toggle('active', tabs[j].classList.contains('active'));
                }
                return;
            }
            // Show all items that match, hide tabs
            for (var j = 0; j < grids.length; j++) grids[j].classList.add('active');
            for (var ii = 0; ii < items.length; ii++) {
                var emoji = items[ii].getAttribute('data-emoji');
                items[ii].style.display = emoji.indexOf(q) !== -1 ? '' : 'inline-flex';
            }
        });

        dialog.querySelector('.zw-emoji-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       AUTO-LINK DETECTION
       =========================== */

    var _autoLinkTimer = null;
    function autoLinkUrls(editor) {
        // Walk all text nodes and wrap bare URLs in <a> tags
        var walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        for (var i = 0; i < textNodes.length; i++) {
            var node = textNodes[i];
            // Skip if already inside a link
            if (node.parentElement && node.parentElement.closest('a')) continue;
            var text = node.textContent;
            var re = /(https?:\/\/[^\s<>"']+)/g;
            var match = re.exec(text);
            if (!match) continue;
            // Split text node and wrap URL in <a>
            var before = text.substring(0, match.index);
            var url = match[0];
            var after = text.substring(match.index + url.length);
            var frag = document.createDocumentFragment();
            if (before) frag.appendChild(document.createTextNode(before));
            var a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = url;
            frag.appendChild(a);
            if (after) frag.appendChild(document.createTextNode(after));
            node.parentNode.replaceChild(frag, node);
        }
    }

    /* ===========================
       TASK LIST (Checkboxes) — 6.3
       =========================== */

    function insertTaskList(inst) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        inst.editor.focus();
        var html = '<ul class="zw-task-list"><li class="zw-task-item"><input type="checkbox"> Task item</li></ul><p><br></p>';
        document.execCommand('insertHTML', false, html);
        syncToTextarea(inst);
    }

    function handleTaskListClick(inst, e) {
        var checkbox = e.target;
        if (checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') return;
        var li = checkbox.closest('.zw-task-item');
        if (!li) return;
        li.classList.toggle('zw-task-done', checkbox.checked);
        syncToTextarea(inst);
    }

    /* ===========================
       BALLOON / INLINE TOOLBAR — 6.2
       =========================== */

    function showBalloonToolbar(inst) {
        hideBalloonToolbar();
        var sel = window.getSelection();
        if (!sel.rangeCount || sel.isCollapsed) return;
        if (!inst.editor.contains(sel.anchorNode)) return;
        if (!sel.toString().trim()) return;

        var range = sel.getRangeAt(0);
        var rect = range.getBoundingClientRect();
        if (!rect.width) return;

        var balloon = document.createElement('div');
        balloon.className = 'zw-balloon-toolbar';
        balloon.setAttribute('role', 'toolbar');
        balloon.contentEditable = 'false';

        var btns = [
            { cmd: 'bold', icon: SVG.bold, title: t('bold') },
            { cmd: 'italic', icon: SVG.italic, title: t('italic') },
            { cmd: 'underline', icon: SVG.underline, title: t('underline') },
            { cmd: 'strikeThrough', icon: SVG.strikethrough, title: t('strikethrough') },
            { cmd: '_link', icon: SVG.link, title: t('insertLink'), custom: true },
            { cmd: 'formatBlock_H2', icon: SVG.h2, title: t('heading2') },
            { cmd: 'formatBlock_H3', icon: SVG.h3, title: t('heading3') }
        ];

        for (var i = 0; i < btns.length; i++) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'zw-balloon-btn';
            b.innerHTML = btns[i].icon;
            b.title = btns[i].title;
            b.addEventListener('mousedown', function(e) { e.preventDefault(); });
            b.addEventListener('click', (function(btnDef) {
                return function(ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (btnDef.custom) {
                        if (btnDef.cmd === '_link') showLinkDialog(inst);
                    } else if (btnDef.cmd.indexOf('formatBlock_') === 0) {
                        document.execCommand('formatBlock', false, '<' + btnDef.cmd.split('_')[1] + '>');
                    } else {
                        document.execCommand(btnDef.cmd, false, null);
                    }
                    syncToTextarea(inst);
                    setTimeout(function() { showBalloonToolbar(inst); }, 50);
                };
            })(btns[i]));
            balloon.appendChild(b);
        }

        document.body.appendChild(balloon);
        var bRect = balloon.getBoundingClientRect();
        var top = rect.top - bRect.height - 8 + window.scrollY;
        var left = rect.left + (rect.width / 2) - (bRect.width / 2) + window.scrollX;
        if (top < window.scrollY + 4) top = rect.bottom + 8 + window.scrollY;
        if (left < 4) left = 4;
        if (left + bRect.width > window.innerWidth - 4) left = window.innerWidth - bRect.width - 4;
        balloon.style.top = top + 'px';
        balloon.style.left = left + 'px';
        balloon.classList.add('zw-balloon-visible');
        _activeBalloon = balloon;
    }

    function hideBalloonToolbar() {
        if (_activeBalloon) { _activeBalloon.remove(); _activeBalloon = null; }
    }

    /* ===========================
       SLASH COMMANDS (/) — 6.4
       =========================== */

    function getSlashCommands(inst) {
        return [
            { key: 'paragraph', label: t('slashParagraph'), icon: SVG.paragraph, action: function() { document.execCommand('formatBlock', false, '<P>'); } },
            { key: 'h2', label: t('slashHeading2'), icon: SVG.h2, action: function() { document.execCommand('formatBlock', false, '<H2>'); } },
            { key: 'h3', label: t('slashHeading3'), icon: SVG.h3, action: function() { document.execCommand('formatBlock', false, '<H3>'); } },
            { key: 'h4', label: t('slashHeading4'), icon: SVG.h4, action: function() { document.execCommand('formatBlock', false, '<H4>'); } },
            { key: 'blockquote', label: t('slashBlockquote'), icon: SVG.blockquote, action: function() { document.execCommand('formatBlock', false, '<BLOCKQUOTE>'); } },
            { key: 'bullet', label: t('slashBulletList'), icon: SVG.bulletList, action: function() { document.execCommand('insertUnorderedList', false, null); } },
            { key: 'numbered', label: t('slashNumberedList'), icon: SVG.numberedList, action: function() { document.execCommand('insertOrderedList', false, null); } },
            { key: 'tasklist', label: t('slashTaskList'), icon: SVG.taskList, action: function() { insertTaskList(inst); } },
            { key: 'table', label: t('slashTable'), icon: SVG.table, action: function() { showTableDialog(inst); } },
            { key: 'hr', label: t('slashHorizontalRule'), icon: SVG.hr, action: function() { document.execCommand('insertHorizontalRule', false, null); } },
            { key: 'image', label: t('slashImage'), icon: SVG.image, action: function() { showImageDialog(inst); } },
            { key: 'youtube', label: t('slashYouTube'), icon: SVG.youtube, action: function() { insertYouTube(inst); } }
        ];
    }

    function showSlashMenu(inst, filterText) {
        hideSlashMenu();
        var commands = getSlashCommands(inst);
        var q = (filterText || '').toLowerCase();
        var filtered = commands.filter(function(c) {
            return c.label.toLowerCase().indexOf(q) !== -1 || c.key.indexOf(q) !== -1;
        });
        if (!filtered.length) return;

        var sel = window.getSelection();
        if (!sel.rangeCount) return;
        var rect = sel.getRangeAt(0).getBoundingClientRect();

        var menu = document.createElement('div');
        menu.className = 'zw-slash-menu';
        menu.setAttribute('role', 'listbox');

        for (var i = 0; i < filtered.length; i++) {
            var item = document.createElement('div');
            item.className = 'zw-slash-item' + (i === 0 ? ' zw-slash-active' : '');
            item.setAttribute('role', 'option');
            item.innerHTML = '<span class="zw-slash-icon">' + filtered[i].icon + '</span><span class="zw-slash-label">' + filtered[i].label + '</span>';
            item.addEventListener('mousedown', function(e) { e.preventDefault(); });
            item.addEventListener('click', (function(cmd) {
                return function(e) { e.preventDefault(); executeSlashCommand(inst, cmd); };
            })(filtered[i]));
            menu.appendChild(item);
        }

        document.body.appendChild(menu);
        var mRect = menu.getBoundingClientRect();
        var top = rect.bottom + 4 + window.scrollY;
        var left = rect.left + window.scrollX;
        if (top + mRect.height > window.innerHeight + window.scrollY) top = rect.top - mRect.height - 4 + window.scrollY;
        if (left + mRect.width > window.innerWidth) left = window.innerWidth - mRect.width - 8;
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        _activeSlashMenu = { el: menu, commands: filtered, activeIdx: 0 };
    }

    function hideSlashMenu() {
        if (_activeSlashMenu) { _activeSlashMenu.el.remove(); _activeSlashMenu = null; }
    }

    function navigateSlashMenu(direction) {
        if (!_activeSlashMenu) return;
        var items = _activeSlashMenu.el.querySelectorAll('.zw-slash-item');
        items[_activeSlashMenu.activeIdx].classList.remove('zw-slash-active');
        _activeSlashMenu.activeIdx += direction;
        if (_activeSlashMenu.activeIdx < 0) _activeSlashMenu.activeIdx = items.length - 1;
        if (_activeSlashMenu.activeIdx >= items.length) _activeSlashMenu.activeIdx = 0;
        items[_activeSlashMenu.activeIdx].classList.add('zw-slash-active');
        items[_activeSlashMenu.activeIdx].scrollIntoView({ block: 'nearest' });
    }

    function executeSlashCommand(inst, cmd) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var node = sel.anchorNode;
            if (node && node.nodeType === 3) {
                var text = node.textContent;
                var slashIdx = text.lastIndexOf('/');
                if (slashIdx !== -1) {
                    node.textContent = text.substring(0, slashIdx);
                    var r = document.createRange();
                    r.setStart(node, slashIdx);
                    r.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(r);
                }
            }
        }
        hideSlashMenu();
        cmd.action();
        syncToTextarea(inst);
    }

    /* ===========================
       CODE BLOCK — 7.2
       =========================== */

    var CODE_LANGUAGES = ['plain', 'javascript', 'html', 'css', 'python', 'php', 'sql', 'json'];

    function showCodeBlockDialog(inst) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog';
        var langOpts = '';
        for (var li = 0; li < CODE_LANGUAGES.length; li++) {
            langOpts += '<option value="' + CODE_LANGUAGES[li] + '">' + CODE_LANGUAGES[li] + '</option>';
        }
        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + t('insertCodeBlock') + '</div>' +
            '<div class="zw-link-dialog-field">' +
                '<label>' + t('codeLanguage') + '</label>' +
                '<select class="zw-code-lang" style="width:100%;padding:9px 12px;background:var(--zw-bg-input);border:1px solid var(--zw-border);border-radius:var(--zw-radius);color:var(--zw-text);font-size:14px;font-family:var(--zw-font)">' + langOpts + '</select>' +
            '</div>' +
            '<div class="zw-link-dialog-actions">' +
                '<button type="button" class="zw-btn zw-btn-primary zw-code-ok">' + t('ok') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-code-cancel">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function close() { overlay.remove(); }
        function apply() {
            var lang = dialog.querySelector('.zw-code-lang').value;
            var cls = lang !== 'plain' ? ' class="language-' + lang + '"' : '';
            var html = '<pre class="zw-code-block"><code' + cls + '>// code here</code></pre><p><br></p>';
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            document.execCommand('insertHTML', false, html);
            syncToTextarea(inst);
            close();
        }

        dialog.querySelector('.zw-code-ok').addEventListener('click', apply);
        dialog.querySelector('.zw-code-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       ADVANCED TABLE EDITING — 7.3
       =========================== */

    function showTableContextMenu(inst, table, cell, x, y) {
        // Remove any existing context menu
        var old = document.querySelector('.zw-table-context-menu');
        if (old) old.remove();

        var menu = document.createElement('div');
        menu.className = 'zw-table-context-menu';
        var items = [
            { label: t('addRowAbove'), action: function() { tableAddRow(table, cell, 'above'); } },
            { label: t('addRowBelow'), action: function() { tableAddRow(table, cell, 'below'); } },
            { label: t('addColLeft'), action: function() { tableAddCol(table, cell, 'left'); } },
            { label: t('addColRight'), action: function() { tableAddCol(table, cell, 'right'); } },
            { label: '—', action: null },
            { label: t('deleteRow'), action: function() { tableDeleteRow(table, cell); } },
            { label: t('deleteCol'), action: function() { tableDeleteCol(table, cell); } },
            { label: t('deleteTable'), action: function() { table.remove(); } },
            { label: '—', action: null },
            { label: t('toggleHeader'), action: function() { tableToggleHeader(table); } }
        ];

        for (var i = 0; i < items.length; i++) {
            if (items[i].label === '—') {
                var sep = document.createElement('div');
                sep.className = 'zw-table-ctx-sep';
                menu.appendChild(sep);
                continue;
            }
            var item = document.createElement('div');
            item.className = 'zw-table-ctx-item';
            item.textContent = items[i].label;
            item.addEventListener('click', (function(action) {
                return function(e) {
                    e.preventDefault();
                    menu.remove();
                    action();
                    syncToTextarea(inst);
                };
            })(items[i].action));
            menu.appendChild(item);
        }

        document.body.appendChild(menu);
        var mRect = menu.getBoundingClientRect();
        if (y + mRect.height > window.innerHeight) y = window.innerHeight - mRect.height - 8;
        if (x + mRect.width > window.innerWidth) x = window.innerWidth - mRect.width - 8;
        menu.style.top = y + window.scrollY + 'px';
        menu.style.left = x + window.scrollX + 'px';

        // Close on click outside
        var closeHandler = function(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeHandler); }
        };
        setTimeout(function() { document.addEventListener('click', closeHandler); }, 0);
    }

    function tableAddRow(table, cell, position) {
        var row = cell.closest('tr');
        if (!row) return;
        var cols = row.cells.length;
        var newRow = document.createElement('tr');
        for (var c = 0; c < cols; c++) newRow.appendChild(document.createElement('td')).innerHTML = '&nbsp;';
        if (position === 'above') { row.parentNode.insertBefore(newRow, row); }
        else { row.parentNode.insertBefore(newRow, row.nextSibling); }
    }

    function tableAddCol(table, cell, position) {
        var colIdx = cell.cellIndex;
        var rows = table.rows;
        for (var r = 0; r < rows.length; r++) {
            var isHeader = rows[r].cells[0] && rows[r].cells[0].tagName === 'TH';
            var newCell = document.createElement(isHeader && r === 0 ? 'th' : 'td');
            newCell.innerHTML = '&nbsp;';
            var ref = rows[r].cells[position === 'left' ? colIdx : colIdx + 1] || null;
            rows[r].insertBefore(newCell, ref);
        }
    }

    function tableDeleteRow(table, cell) {
        var row = cell.closest('tr');
        if (!row) return;
        if (table.rows.length <= 1) { table.remove(); return; }
        row.remove();
    }

    function tableDeleteCol(table, cell) {
        var colIdx = cell.cellIndex;
        var rows = table.rows;
        if (rows[0] && rows[0].cells.length <= 1) { table.remove(); return; }
        for (var r = rows.length - 1; r >= 0; r--) {
            if (rows[r].cells[colIdx]) rows[r].deleteCell(colIdx);
        }
    }

    function tableToggleHeader(table) {
        var firstRow = table.rows[0];
        if (!firstRow) return;
        var isHeader = firstRow.cells[0] && firstRow.cells[0].tagName === 'TH';
        for (var c = 0; c < firstRow.cells.length; c++) {
            var oldCell = firstRow.cells[c];
            var newCell = document.createElement(isHeader ? 'td' : 'th');
            newCell.innerHTML = oldCell.innerHTML;
            firstRow.replaceChild(newCell, oldCell);
        }
    }

    /* ===========================
       FIND & REPLACE — 6.5
       =========================== */

    function showFindReplace(inst) {
        if (inst._findBar) { closeFindReplace(inst); return; }
        if (inst.isSourceMode) toggleSourceMode(inst);

        var bar = document.createElement('div');
        bar.className = 'zw-find-bar';
        bar.contentEditable = 'false';
        bar.innerHTML =
            '<div class="zw-find-row">' +
                '<input type="text" class="zw-find-input" placeholder="' + t('find') + '" />' +
                '<span class="zw-find-count"></span>' +
                '<button type="button" class="zw-find-nav" data-dir="prev" title="Previous">&#9650;</button>' +
                '<button type="button" class="zw-find-nav" data-dir="next" title="Next">&#9660;</button>' +
                '<label class="zw-find-case-label"><input type="checkbox" class="zw-find-case" /> ' + t('matchCase') + '</label>' +
                '<button type="button" class="zw-find-close" title="Close">&times;</button>' +
            '</div>' +
            '<div class="zw-replace-row">' +
                '<input type="text" class="zw-replace-input" placeholder="' + t('replace') + '" />' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-replace-one">' + t('replace') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-replace-all">' + t('replaceAll') + '</button>' +
            '</div>';

        inst.wrapper.insertBefore(bar, inst.editor);
        inst._findBar = bar;
        inst._findState = { matches: [], current: -1, query: '', caseSensitive: false };

        var findInput = bar.querySelector('.zw-find-input');
        var replaceInput = bar.querySelector('.zw-replace-input');
        var countEl = bar.querySelector('.zw-find-count');
        var caseCheck = bar.querySelector('.zw-find-case');

        function doFind() {
            var q = findInput.value;
            var cs = caseCheck.checked;
            inst._findState.query = q;
            inst._findState.caseSensitive = cs;
            clearHighlights(inst);
            if (!q) { countEl.textContent = ''; inst._findState.matches = []; inst._findState.current = -1; return; }
            var matches = highlightMatches(inst, q, cs);
            inst._findState.matches = matches;
            inst._findState.current = matches.length > 0 ? 0 : -1;
            _updateFindCount(inst, countEl);
            if (matches.length > 0) _scrollToMatch(inst, 0);
        }

        findInput.addEventListener('input', doFind);
        caseCheck.addEventListener('change', doFind);
        findInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); _navigateFind(inst, countEl, e.shiftKey ? -1 : 1); }
            if (e.key === 'Escape') closeFindReplace(inst);
        });
        replaceInput.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeFindReplace(inst); });
        bar.querySelector('.zw-find-close').addEventListener('click', function() { closeFindReplace(inst); });

        var navBtns = bar.querySelectorAll('.zw-find-nav');
        for (var ni = 0; ni < navBtns.length; ni++) {
            navBtns[ni].addEventListener('click', (function(dir) {
                return function() { _navigateFind(inst, countEl, dir); };
            })(navBtns[ni].getAttribute('data-dir') === 'next' ? 1 : -1));
        }
        bar.querySelector('.zw-replace-one').addEventListener('click', function() { _replaceOne(inst, replaceInput.value, countEl); });
        bar.querySelector('.zw-replace-all').addEventListener('click', function() { _replaceAll(inst, replaceInput.value, countEl); });
        setTimeout(function() { findInput.focus(); }, 50);
    }

    function closeFindReplace(inst) {
        clearHighlights(inst);
        if (inst._findBar) { inst._findBar.remove(); inst._findBar = null; }
        inst._findState = null;
        inst.editor.focus();
    }

    function highlightMatches(inst, query, caseSensitive) {
        var matches = [];
        var walker = document.createTreeWalker(inst.editor, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        for (var i = 0; i < textNodes.length; i++) {
            var node = textNodes[i];
            if (node.parentElement && node.parentElement.classList.contains('zw-search-match')) continue;
            var text = node.textContent;
            var searchText = caseSensitive ? text : text.toLowerCase();
            var searchQuery = caseSensitive ? query : query.toLowerCase();
            var idx = searchText.indexOf(searchQuery);
            while (idx !== -1) {
                var before = node.splitText(idx);
                var matchNode = before.splitText(query.length);
                var mark = document.createElement('span');
                mark.className = 'zw-search-match';
                before.parentNode.insertBefore(mark, before);
                mark.appendChild(before);
                matches.push(mark);
                node = matchNode;
                text = node.textContent;
                searchText = caseSensitive ? text : text.toLowerCase();
                idx = searchText.indexOf(searchQuery);
            }
        }
        return matches;
    }

    function clearHighlights(inst) {
        var marks = inst.editor.querySelectorAll('.zw-search-match');
        for (var i = 0; i < marks.length; i++) {
            var mark = marks[i];
            var parent = mark.parentNode;
            while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
            parent.removeChild(mark);
            parent.normalize();
        }
    }

    function _updateFindCount(inst, countEl) {
        var st = inst._findState;
        if (!st || st.matches.length === 0) {
            countEl.textContent = st && st.query ? t('noResults') : '';
            return;
        }
        countEl.textContent = t('matchCount').replace('{current}', st.current + 1).replace('{total}', st.matches.length);
    }

    function _scrollToMatch(inst, idx) {
        var st = inst._findState;
        if (!st || !st.matches.length) return;
        for (var i = 0; i < st.matches.length; i++) st.matches[i].classList.remove('zw-search-match-active');
        st.matches[idx].classList.add('zw-search-match-active');
        st.matches[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function _navigateFind(inst, countEl, direction) {
        var st = inst._findState;
        if (!st || st.matches.length === 0) return;
        st.current += direction;
        if (st.current >= st.matches.length) st.current = 0;
        if (st.current < 0) st.current = st.matches.length - 1;
        _updateFindCount(inst, countEl);
        _scrollToMatch(inst, st.current);
    }

    function _replaceOne(inst, replacement, countEl) {
        var st = inst._findState;
        if (!st || st.current < 0 || !st.matches.length) return;
        var mark = st.matches[st.current];
        mark.textContent = replacement;
        var parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
        st.matches.splice(st.current, 1);
        if (st.current >= st.matches.length) st.current = 0;
        if (st.matches.length === 0) st.current = -1;
        _updateFindCount(inst, countEl);
        if (st.current >= 0) _scrollToMatch(inst, st.current);
        syncToTextarea(inst);
    }

    function _replaceAll(inst, replacement, countEl) {
        var st = inst._findState;
        if (!st || !st.matches.length) return;
        for (var i = st.matches.length - 1; i >= 0; i--) {
            var mark = st.matches[i];
            mark.textContent = replacement;
            var parent = mark.parentNode;
            while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
            parent.removeChild(mark);
            parent.normalize();
        }
        st.matches = [];
        st.current = -1;
        _updateFindCount(inst, countEl);
        syncToTextarea(inst);
    }

    /* ===========================
       IMAGE DIALOG
       =========================== */

    function showImageDialog(inst) {
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
        var existingImg = inst._selectedImg || null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog';
        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + (existingImg ? t('editImage') : t('insertImageTitle')) + '</div>' +
            '<div class="zw-link-dialog-field">' +
                '<label>' + t('imageUrl') + '</label>' +
                '<input type="url" class="zw-img-url" value="' + escapeAttr(existingImg ? existingImg.src : 'https://') + '" />' +
            '</div>' +
            '<div class="zw-link-dialog-field">' +
                '<label>' + t('altText') + '</label>' +
                '<input type="text" class="zw-img-alt" value="' + escapeAttr(existingImg ? (existingImg.alt || '') : '') + '" />' +
            '</div>' +
            '<div class="zw-link-dialog-field zw-img-dimensions">' +
                '<label>' + t('dimensions') + '</label>' +
                '<div class="zw-img-dim-row">' +
                    '<input type="number" class="zw-img-width" value="' + escapeAttr(existingImg ? (existingImg.getAttribute('width') || '') : '') + '" placeholder="' + t('widthPlaceholder') + '" min="1" />' +
                    '<span class="zw-img-dim-x">×</span>' +
                    '<input type="number" class="zw-img-height" value="' + escapeAttr(existingImg ? (existingImg.getAttribute('height') || '') : '') + '" placeholder="' + t('heightPlaceholder') + '" min="1" />' +
                    '<span class="zw-img-dim-hint">' + t('emptyOriginal') + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="zw-link-dialog-actions">' +
                '<button type="button" class="zw-btn zw-btn-primary zw-img-ok">' + t('ok') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-img-cancel">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var urlInput = dialog.querySelector('.zw-img-url');
        var altInput = dialog.querySelector('.zw-img-alt');
        var wInput = dialog.querySelector('.zw-img-width');
        var hInput = dialog.querySelector('.zw-img-height');
        setTimeout(function() { urlInput.focus(); if (!existingImg) urlInput.select(); }, 50);

        function close() { overlay.remove(); }
        function apply() {
            var url = urlInput.value.trim();
            if (!url) return close();
            var alt = altInput.value.trim();
            var w = wInput.value.trim();
            var h = hInput.value.trim();

            if (existingImg) {
                existingImg.src = url;
                existingImg.alt = alt;
                if (w) { existingImg.setAttribute('width', w); existingImg.style.width = w + 'px'; }
                else { existingImg.removeAttribute('width'); existingImg.style.width = ''; }
                if (h) { existingImg.setAttribute('height', h); existingImg.style.height = h + 'px'; }
                else { existingImg.removeAttribute('height'); existingImg.style.height = ''; }
                if (inst._resizeWrapper) {
                    var badge = inst._resizeWrapper.querySelector('.zw-img-size-badge');
                    if (badge) badge.textContent = (w || '?') + ' × ' + (h || '?');
                }
            } else {
                if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
                inst.editor.focus();
                var imgHtml = '<img src="' + escapeHtml(url) + '"';
                if (alt) imgHtml += ' alt="' + escapeHtml(alt) + '"';
                if (w) imgHtml += ' width="' + escapeHtml(w) + '"';
                if (h) imgHtml += ' height="' + escapeHtml(h) + '"';
                if (w) {
                    imgHtml += ' style="width:' + escapeHtml(w) + 'px;';
                    if (h) imgHtml += 'height:' + escapeHtml(h) + 'px;';
                    imgHtml += '"';
                } else {
                    imgHtml += ' style="max-width:100%;"';
                }
                imgHtml += ' />';
                document.execCommand('insertHTML', false, imgHtml);
            }
            syncToTextarea(inst);
            close();
        }

        dialog.querySelector('.zw-img-ok').addEventListener('click', apply);
        dialog.querySelector('.zw-img-cancel').addEventListener('click', close);
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
            if (e.key === 'Escape') close();
        });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       INIT
       =========================== */

    function init(textareaIdOrElement, options) {
        options = options || {};
        // Set locale if provided (affects all instances)
        if (options.locale) {
            if (typeof options.locale === 'string') {
                _locale = options.locale;
            } else if (typeof options.locale === 'object') {
                locales._custom = options.locale;
                _locale = '_custom';
            }
        }
        // Support both string ID and HTMLElement
        var textarea, textareaId;
        if (typeof textareaIdOrElement === 'string') {
            textareaId = textareaIdOrElement;
            textarea = document.getElementById(textareaId);
        } else if (textareaIdOrElement && textareaIdOrElement.nodeType === 1) {
            textarea = textareaIdOrElement;
            textareaId = textarea.id || ('zw-auto-' + Math.random().toString(36).substr(2, 8));
            if (!textarea.id) textarea.id = textareaId;
        }
        if (!textarea) { console.error('ZeroWysiwyg: textarea not found'); return; }
        if (instances[textareaId]) return instances[textareaId];

        var height = options.height || '400px';
        var wrapper = document.createElement('div');
        wrapper.className = 'zw-wysiwyg-wrapper';
        if (options.theme) wrapper.classList.add('zw-theme-' + options.theme);

        var toolbar = createToolbar(textareaId, options.toolbar || null);
        var editor = document.createElement('div');
        editor.className = 'zw-wysiwyg-editor';
        editor.contentEditable = 'true';
        editor.style.minHeight = height;
        editor.setAttribute('data-placeholder', t('placeholder'));
        editor.innerHTML = iframesToPlaceholders(textarea.value);

        var sourceView = document.createElement('textarea');
        sourceView.className = 'zw-wysiwyg-source';
        sourceView.style.display = 'none';
        sourceView.style.minHeight = height;

        wrapper.appendChild(toolbar);
        wrapper.appendChild(editor);
        wrapper.appendChild(sourceView);
        textarea.style.display = 'none';
        textarea.parentNode.insertBefore(wrapper, textarea);

        var instance = {
            textarea: textarea, wrapper: wrapper, toolbar: toolbar,
            editor: editor, sourceView: sourceView,
            isSourceMode: false, isFullscreen: false,
            _selectedImg: null, _resizeWrapper: null,
            _selectedVideo: null
        };
        instances[textareaId] = instance;

        // Event callbacks
        var _onChange = options.onChange || null;
        var _onReady = options.onReady || null;

        // Auto-link detection (enabled by default, disable with autoLink: false)
        var _autoLinkEnabled = options.autoLink !== false;

        editor.addEventListener('input', function() {
            syncToTextarea(instance);
            if (_onChange) _onChange(instance.textarea.value);
            // Debounced auto-link on Space/Enter
            if (_autoLinkEnabled) {
                clearTimeout(_autoLinkTimer);
                _autoLinkTimer = setTimeout(function() { autoLinkUrls(editor); }, 500);
            }
            // 6.4 Slash commands
            if (options.slashCommands) {
                var sSel = window.getSelection();
                if (sSel.rangeCount && sSel.anchorNode && sSel.anchorNode.nodeType === 3) {
                    var sText = sSel.anchorNode.textContent.substring(0, sSel.anchorOffset);
                    var slashMatch = sText.match(/(?:^|\s)\/(\S*)$/);
                    if (slashMatch) {
                        showSlashMenu(instance, slashMatch[1]);
                    } else {
                        hideSlashMenu();
                    }
                } else {
                    hideSlashMenu();
                }
            }
        });
        editor.addEventListener('focus', function() {
            if (options.onFocus) options.onFocus();
        });
        editor.addEventListener('blur', function() {
            if (options.onBlur) options.onBlur();
        });

        editor.addEventListener('paste', function(e) {
            e.preventDefault();
            var html = e.clipboardData.getData('text/html');
            var text = e.clipboardData.getData('text/plain');
            if (html) {
                html = cleanPastedHtml(html);
                html = iframesToPlaceholders(html);
                document.execCommand('insertHTML', false, html);
            } else {
                var ytMatch = text.match(YOUTUBE_URL_REGEX);
                if (ytMatch) {
                    document.execCommand('insertHTML', false, createYouTubePlaceholder(ytMatch[1]));
                } else {
                    // Convert plain text line breaks to <br> so paragraphs are preserved
                var htmlText = escapeHtml(text).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
                document.execCommand('insertHTML', false, htmlText);
                }
            }
            syncToTextarea(instance);
        });

        editor.addEventListener('keydown', function(e) {
            // 6.5 Find & Replace: Ctrl+F / Cmd+F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault(); showFindReplace(instance); return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault(); showFindReplace(instance); return;
            }
            // 6.4 Slash commands keyboard navigation
            if (options.slashCommands && _activeSlashMenu) {
                if (e.key === 'ArrowDown') { e.preventDefault(); navigateSlashMenu(1); return; }
                if (e.key === 'ArrowUp') { e.preventDefault(); navigateSlashMenu(-1); return; }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var slashCmd = _activeSlashMenu.commands[_activeSlashMenu.activeIdx];
                    executeSlashCommand(instance, slashCmd); return;
                }
                if (e.key === 'Escape') { hideSlashMenu(); return; }
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                if (isInsideList(editor)) {
                    // Inside a list: indent or outdent to create/remove nested lists
                    if (e.shiftKey) {
                        document.execCommand('outdent', false, null);
                    } else {
                        document.execCommand('indent', false, null);
                    }
                } else if (e.shiftKey) {
                    document.execCommand('outdent', false, null);
                } else {
                    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
                syncToTextarea(instance);
                updateActiveStates(instance);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && instance._selectedImg) {
                e.preventDefault();
                var imgToRemove = instance._selectedImg;
                removeImageResizeHandles(instance);
                if (imgToRemove && imgToRemove.parentNode) imgToRemove.remove();
                instance._selectedImg = null;
                syncToTextarea(instance);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && instance._selectedVideo) {
                e.preventDefault();
                var vidToRemove = instance._selectedVideo;
                removeVideoResizeHandles(instance);
                if (vidToRemove && vidToRemove.parentNode) vidToRemove.remove();
                instance._selectedVideo = null;
                syncToTextarea(instance);
            }
        });

        editor.addEventListener('click', function(e) {
            // 6.3 Task list checkbox click
            handleTaskListClick(instance, e);
            // Don't deselect if clicking on video resize controls
            if (e.target.closest('.zw-video-resize-handle') || e.target.closest('.zw-video-align-bar')) {
                return;
            }
            var clickedImg = e.target.closest('img');
            var clickedPh = e.target.closest('[' + PLACEHOLDER_ATTR + ']');
            if (clickedImg && !clickedPh) {
                e.preventDefault();
                removeVideoResizeHandles(instance);
                showImageResizeHandles(instance, clickedImg);
                return;
            }
            if (clickedPh) {
                e.preventDefault();
                removeImageResizeHandles(instance);
                showVideoResizeHandles(instance, clickedPh);
                return;
            }
            removeImageResizeHandles(instance);
            removeVideoResizeHandles(instance);
        });

        // 7.3 Table context menu on right-click
        editor.addEventListener('contextmenu', function(e) {
            var cell = e.target.closest('td, th');
            if (cell) {
                var table = cell.closest('table');
                if (table && instance.editor.contains(table)) {
                    e.preventDefault();
                    showTableContextMenu(instance, table, cell, e.clientX, e.clientY);
                }
            }
        });

        editor.addEventListener('dblclick', function(e) {
            var clickedImg = e.target.closest('img');
            if (clickedImg && !e.target.closest('[' + PLACEHOLDER_ATTR + ']')) {
                e.preventDefault();
                showImageResizeHandles(instance, clickedImg);
                showImageDialog(instance);
            }
            var clickedLink = e.target.closest('a');
            if (clickedLink) {
                e.preventDefault();
                var range = document.createRange();
                range.selectNodeContents(clickedLink);
                var sel = window.getSelection();
                sel.removeAllRanges(); sel.addRange(range);
                showLinkDialog(instance);
            }
        });

        document.addEventListener('selectionchange', function() {
            if (document.activeElement === editor) updateActiveStates(instance);
        });

        // 6.2 Balloon toolbar (enabled via toolbarMode option)
        var _toolbarMode = options.toolbarMode || 'top';
        if (_toolbarMode === 'balloon' || _toolbarMode === 'both') {
            editor.addEventListener('mouseup', function() {
                setTimeout(function() { showBalloonToolbar(instance); }, 100);
            });
            editor.addEventListener('keyup', function(e) {
                if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                    setTimeout(function() { showBalloonToolbar(instance); }, 100);
                } else if (!e.shiftKey) {
                    hideBalloonToolbar();
                }
            });
            // Hide balloon when clicking outside editor
            document.addEventListener('mousedown', function(e) {
                if (_activeBalloon && !_activeBalloon.contains(e.target) && !editor.contains(e.target)) {
                    hideBalloonToolbar();
                }
            });
            if (_toolbarMode === 'balloon') toolbar.style.display = 'none';
        }

        var oldToolbar = wrapper.parentNode.querySelector('.wysiwyg-toolbar');
        if (oldToolbar) oldToolbar.remove();

        syncToTextarea(instance);

        // Word count status bar
        if (options.wordCount) {
            var statusBar = document.createElement('div');
            statusBar.className = 'zw-status-bar';
            statusBar.innerHTML = '<span class="zw-word-count"></span>';
            wrapper.appendChild(statusBar);
            instance._statusBar = statusBar;
            _updateWordCount(instance);
            editor.addEventListener('input', function() { _updateWordCount(instance); });
        }

        if (_onReady) setTimeout(function() { _onReady(instance); }, 0);
        return instance;
    }

    function _updateWordCount(inst) {
        if (!inst._statusBar) return;
        var text = inst.editor.innerText || inst.editor.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        var words = text === '' ? 0 : text.split(/\s+/).length;
        var chars = text.length;
        var el = inst._statusBar.querySelector('.zw-word-count');
        if (el) el.textContent = words + ' ' + (words === 1 ? 'word' : 'words') + ' · ' + chars + ' chars';
    }

    /* ===========================
       IFRAME ↔ PLACEHOLDER
       =========================== */

    function iframesToPlaceholders(html) {
        return html.replace(IFRAME_REGEX, function(match) {
            var srcMatch = match.match(/src=["']([^"']+)["']/i);
            var src = srcMatch ? srcMatch[1] : '';
            var wM = match.match(/width=["']?(\d+)/i);
            var hM = match.match(/height=["']?(\d+)/i);
            var w = wM ? wM[1] : '560';
            var h = hM ? hM[1] : '315';
            var ytMatch = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
            if (ytMatch) return createYouTubePlaceholder(ytMatch[1], w, h, match);
            return '<div ' + PLACEHOLDER_ATTR + ' contenteditable="false" ' +
                   'data-iframe-html="' + escapeAttr(match) + '" ' +
                   'class="zw-iframe-placeholder">' +
                   '<div class="zw-placeholder-icon">⊞</div>' +
                   '<div class="zw-placeholder-label">' + t('iframeEmbed') + '</div>' +
                   '<div class="zw-placeholder-url">' + escapeHtml(src) + '</div></div>';
        });
    }

    function createYouTubePlaceholder(videoId, width, height, originalHtml) {
        width = width || '560'; height = height || '315';
        var iframeHtml = originalHtml ||
            '<iframe width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
        var thumbUrl = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
        // Default alignment is center
        return '<div ' + PLACEHOLDER_ATTR + ' contenteditable="false" ' +
               'data-iframe-html="' + escapeAttr(iframeHtml) + '" data-youtube-id="' + videoId + '" ' +
               'data-align="center" ' +
               'class="zw-iframe-placeholder zw-youtube-placeholder" ' +
               'style="background-image:url(\'' + thumbUrl + '\');margin-left:auto;margin-right:auto;width:' + width + 'px;max-width:' + width + 'px">' +
               '<div class="zw-yt-play">▶</div>' +
               '<div class="zw-placeholder-label">YouTube: ' + videoId + '</div></div>';
    }

    function placeholdersToIframes(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        // Remove image resize wrappers, extracting the img
        var wrappers = tmp.querySelectorAll('[data-zw-resize-wrapper]');
        for (var w = 0; w < wrappers.length; w++) {
            var wr = wrappers[w];
            var img = wr.querySelector('img');
            if (img) { wr.parentNode.insertBefore(img, wr); }
            wr.remove();
        }
        // Remove video resize UI elements from placeholders before converting
        var videoHandles = tmp.querySelectorAll('.zw-video-resize-handle, .zw-video-size-badge, .zw-video-align-bar');
        for (var vh = 0; vh < videoHandles.length; vh++) videoHandles[vh].remove();

        var phs = tmp.querySelectorAll('[' + PLACEHOLDER_ATTR + ']');
        for (var i = 0; i < phs.length; i++) {
            var ph = phs[i];
            var iframeHtml = ph.getAttribute('data-iframe-html');
            if (iframeHtml) {
                var align = ph.getAttribute('data-align') || 'center';
                // Wrap iframe in a div with alignment
                var wrapperDiv = document.createElement('div');
                if (align === 'center') {
                    wrapperDiv.style.textAlign = 'center';
                } else if (align === 'right') {
                    wrapperDiv.style.textAlign = 'right';
                }
                // else left = default, no style needed
                wrapperDiv.innerHTML = iframeHtml;
                ph.parentNode.replaceChild(wrapperDiv, ph);
            }
        }
        return tmp.innerHTML;
    }

    /* ===========================
       TOOLBAR
       =========================== */

    // Build a cmd-name lookup for toolbar filtering
    // toolbar option can be:
    //   - null/undefined: show all buttons (default)
    //   - array of strings: show only buttons matching these cmd names or group labels
    //     e.g. ['bold', 'italic', '|', 'link', 'image', 'youtube', 'source', 'fullscreen']
    //     Special: '|' inserts a group separator
    //     Group labels: 'format', 'headings', 'lists', 'alignment', 'insert', 'history', 'utilities'
    function _shouldShowButton(btn, toolbarFilter) {
        if (!toolbarFilter) return true;
        var cmd = btn.cmd.replace(/^_/, '').toLowerCase();
        for (var i = 0; i < toolbarFilter.length; i++) {
            var f = toolbarFilter[i].toLowerCase();
            if (f === cmd) return true;
            // Aliases for convenience
            if (f === 'link' && (cmd === 'createlink' || cmd === 'unlink')) return true;
            if (f === 'image' && cmd === 'insertimage') return true;
            if (f === 'youtube' && cmd === 'insertyoutube') return true;
            if (f === 'source' && cmd === 'togglesource') return true;
            if (f === 'hr' && cmd === 'inserthorizontalrule') return true;
            if (f === 'ul' && cmd === 'insertunorderedlist') return true;
            if (f === 'ol' && cmd === 'insertorderedlist') return true;
            if (f === 'h2' && cmd === 'formatblock' && btn.value === 'H2') return true;
            if (f === 'h3' && cmd === 'formatblock' && btn.value === 'H3') return true;
            if (f === 'h4' && cmd === 'formatblock' && btn.value === 'H4') return true;
            if (f === 'table' && cmd === 'inserttable') return true;
            if (f === 'textcolor' && cmd === 'textcolor') return true;
            if (f === 'bgcolor' && cmd === 'bgcolor') return true;
            if (f === 'blockquote' && cmd === 'formatblock' && btn.value === 'BLOCKQUOTE') return true;
            if (f === 'emoji' && cmd === 'insertemoji') return true;
            if (f === 'tasklist' && cmd === 'inserttasklist') return true;
            if (f === 'findreplace' && cmd === 'findreplace') return true;
        }
        return false;
    }

    function _shouldShowGroup(group, toolbarFilter) {
        if (!toolbarFilter) return true;
        // Show group if its label is in the filter or any of its buttons match
        for (var i = 0; i < toolbarFilter.length; i++) {
            if (toolbarFilter[i].toLowerCase() === group.label.toLowerCase()) return true;
        }
        for (var b = 0; b < group.buttons.length; b++) {
            if (_shouldShowButton(group.buttons[b], toolbarFilter)) return true;
        }
        return false;
    }

    function createToolbar(textareaId, toolbarFilter) {
        var toolbar = document.createElement('div');
        toolbar.className = 'zw-wysiwyg-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Editor toolbar');
        var toolbarGroups = getToolbarGroups();
        for (var g = 0; g < toolbarGroups.length; g++) {
            var group = toolbarGroups[g];
            if (!_shouldShowGroup(group, toolbarFilter)) continue;
            var groupEl = document.createElement('div');
            groupEl.className = 'zw-toolbar-group';
            groupEl.setAttribute('role', 'group');
            for (var b = 0; b < group.buttons.length; b++) {
                var btn = group.buttons[b];
                if (toolbarFilter && !_shouldShowButton(btn, toolbarFilter)) continue;
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'zw-toolbar-btn';
                button.innerHTML = btn.icon;
                button.title = btn.titleKey ? t(btn.titleKey) : (btn.title || '');
                button.setAttribute('aria-label', button.title);
                button.setAttribute('role', 'button');
                button.setAttribute('data-cmd', btn.cmd);
                if (btn.value) button.setAttribute('data-value', btn.value);
                if (btn.custom) button.setAttribute('data-custom', '1');
                button.addEventListener('click', (function(btnDef) {
                    return function(e) { e.preventDefault(); handleToolbarClick(textareaId, btnDef); };
                })(btn));
                groupEl.appendChild(button);
            }
            toolbar.appendChild(groupEl);
        }
        return toolbar;
    }

    function handleToolbarClick(textareaId, btn) {
        var inst = instances[textareaId];
        if (!inst) return;

        if (btn.custom) {
            if (btn.cmd === '_toggleSource') { toggleSourceMode(inst); return; }
            if (btn.cmd === '_fullscreen') { toggleFullscreen(inst); return; }
            if (btn.cmd === '_insertYouTube') { insertYouTube(inst); return; }
            if (btn.cmd === '_createLink') { showLinkDialog(inst); return; }
            if (btn.cmd === '_insertImage') { showImageDialog(inst); return; }
            if (btn.cmd === '_insertTable') { showTableDialog(inst); return; }
            if (btn.cmd === '_textColor') { showColorPicker(inst, 'foreColor'); return; }
            if (btn.cmd === '_bgColor') { showColorPicker(inst, 'hiliteColor'); return; }
            if (btn.cmd === '_insertEmoji') { showEmojiPicker(inst); return; }
            if (btn.cmd === '_insertTaskList') { insertTaskList(inst); return; }
            if (btn.cmd === '_findReplace') { showFindReplace(inst); return; }
            if (btn.cmd === '_insertCodeBlock') { showCodeBlockDialog(inst); return; }
            return;
        }

        if (inst.isSourceMode) toggleSourceMode(inst);
        inst.editor.focus();

        if (btn.cmd === 'formatBlock') {
            document.execCommand('formatBlock', false, '<' + btn.value + '>');
        } else {
            document.execCommand(btn.cmd, false, btn.value || null);
        }
        syncToTextarea(inst);
        updateActiveStates(inst);
    }

    function insertYouTube(inst) {
        if (inst.isSourceMode) toggleSourceMode(inst);
        var sel = window.getSelection();
        var savedRange = (sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;

        var overlay = document.createElement('div');
        overlay.className = 'zw-link-dialog-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'zw-link-dialog';
        dialog.innerHTML =
            '<div class="zw-link-dialog-title">' + t('insertYouTubeTitle') + '</div>' +
            '<div class="zw-link-dialog-field">' +
                '<label>' + t('youtubeUrl') + '</label>' +
                '<input type="text" class="zw-yt-url" value="https://www.youtube.com/watch?v=" />' +
            '</div>' +
            '<div class="zw-link-dialog-field zw-img-dimensions">' +
                '<label>' + t('dimensions') + '</label>' +
                '<div class="zw-img-dim-row">' +
                    '<input type="number" class="zw-yt-width" value="620" placeholder="' + t('widthPlaceholder') + '" min="200" />' +
                    '<span class="zw-img-dim-x">×</span>' +
                    '<input type="number" class="zw-yt-height" value="349" placeholder="' + t('heightPlaceholder') + '" min="100" />' +
                '</div>' +
            '</div>' +
            '<div class="zw-link-dialog-actions">' +
                '<button type="button" class="zw-btn zw-btn-primary zw-yt-ok">' + t('ok') + '</button>' +
                '<button type="button" class="zw-btn zw-btn-ghost zw-yt-cancel">' + t('cancel') + '</button>' +
            '</div>';
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        var urlInput = dialog.querySelector('.zw-yt-url');
        var wInput = dialog.querySelector('.zw-yt-width');
        var hInput = dialog.querySelector('.zw-yt-height');
        setTimeout(function() { urlInput.focus(); urlInput.select(); }, 50);

        function close() { overlay.remove(); }
        function apply() {
            var input = urlInput.value.trim();
            if (!input) return close();
            var videoId = null;
            var ytMatch = input.match(YOUTUBE_URL_REGEX);
            if (ytMatch) { videoId = ytMatch[1]; }
            else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) { videoId = input; }
            if (!videoId) {
                urlInput.style.borderColor = '#e74c3c';
                urlInput.focus();
                return;
            }
            var w = wInput.value.trim() || '620';
            var h = hInput.value.trim() || '349';
            if (savedRange) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
            inst.editor.focus();
            document.execCommand('insertHTML', false, createYouTubePlaceholder(videoId, w, h));
            syncToTextarea(inst);
            close();
        }

        dialog.querySelector('.zw-yt-ok').addEventListener('click', apply);
        dialog.querySelector('.zw-yt-cancel').addEventListener('click', close);
        urlInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
            if (e.key === 'Escape') close();
        });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    }

    /* ===========================
       SOURCE / FULLSCREEN
       =========================== */

    function toggleSourceMode(inst) {
        if (inst.isSourceMode) {
            inst.editor.innerHTML = iframesToPlaceholders(inst.sourceView.value);
            inst.sourceView.style.display = 'none';
            inst.editor.style.display = 'block';
            inst.isSourceMode = false;
        } else {
            // Remove resize wrappers before exporting to source
            removeImageResizeHandles(inst);
            removeVideoResizeHandles(inst);
            var realHtml = placeholdersToIframes(inst.editor.innerHTML);
            inst.sourceView.value = formatHtml(realHtml);
            inst.editor.style.display = 'none';
            inst.sourceView.style.display = 'block';
            inst.isSourceMode = true;
            inst.sourceView.focus();
        }
        var btn = inst.toolbar.querySelector('[data-cmd="_toggleSource"]');
        if (btn) btn.classList.toggle('active', inst.isSourceMode);
        syncToTextarea(inst);
    }

    function toggleFullscreen(inst) {
        inst.isFullscreen = !inst.isFullscreen;
        inst.wrapper.classList.toggle('zw-wysiwyg-fullscreen', inst.isFullscreen);
        document.body.classList.toggle('wysiwyg-fullscreen-active', inst.isFullscreen);
        var btn = inst.toolbar.querySelector('[data-cmd="_fullscreen"]');
        if (btn) btn.classList.toggle('active', inst.isFullscreen);
        if (inst.isFullscreen) {
            inst._escHandler = function(e) { if (e.key === 'Escape') toggleFullscreen(inst); };
            document.addEventListener('keydown', inst._escHandler);
        } else if (inst._escHandler) {
            document.removeEventListener('keydown', inst._escHandler);
            inst._escHandler = null;
        }
    }

    /* ===========================
       SYNC & UTILITIES
       =========================== */

    function syncToTextarea(inst) {
        if (inst.isSourceMode) {
            inst.textarea.value = inst.sourceView.value;
        } else {
            inst.textarea.value = placeholdersToIframes(inst.editor.innerHTML);
        }
    }

    function updateActiveStates(inst) {
        var buttons = inst.toolbar.querySelectorAll('.zw-toolbar-btn:not([data-custom])');
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            var cmd = b.getAttribute('data-cmd');
            if (cmd === 'formatBlock') {
                var value = b.getAttribute('data-value');
                try {
                    var block = document.queryCommandValue('formatBlock');
                    b.classList.toggle('active', block.toLowerCase() === value.toLowerCase());
                } catch(e) {}
            } else {
                try { b.classList.toggle('active', document.queryCommandState(cmd)); } catch(e) {}
            }
        }
    }

    function isInsideList(editor) {
        var sel = window.getSelection();
        if (!sel.rangeCount) return false;
        var node = sel.anchorNode;
        while (node && node !== editor) {
            if (node.nodeType === 1) {
                var tag = node.tagName;
                if (tag === 'UL' || tag === 'OL' || tag === 'LI') return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    function cleanPastedHtml(html) {
        html = html.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '');
        html = html.replace(/<\/?(?:xml|st\d|meta|link|font)\b[^>]*>/gi, '');
        html = html.replace(/<(?!img|iframe)([a-z][a-z0-9]*)\b([^>]*)\bclass="[^"]*"/gi, '<$1$2');
        html = html.replace(/<(?!img|iframe|video|embed)([a-z][a-z0-9]*)\b([^>]*)\bstyle="[^"]*"/gi, '<$1$2');
        html = html.replace(/<span\b[^>]*>\s*<\/span>/gi, '');
        html = html.replace(/<!--[\s\S]*?-->/g, '');
        html = html.replace(/<p[^>]*>\s*(&nbsp;)?\s*<\/p>/gi, '');
        html = html.replace(/\n{3,}/g, '\n\n');
        return html.trim();
    }

    function formatHtml(html) {
        html = html.replace(/(<\/(?:div|p|h[1-6]|ul|ol|li|table|tr|blockquote|hr|iframe)[^>]*>)/gi, '$1\n');
        html = html.replace(/(<(?:div|p|h[1-6]|ul|ol|table|tr|blockquote|hr|iframe)\b[^>]*>)/gi, '\n$1');
        html = html.replace(/(<br\s*\/?>)/gi, '$1\n');
        html = html.replace(/\n{3,}/g, '\n\n');
        return html.trim();
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ===========================
       PUBLIC API METHODS
       =========================== */

    function getHTML(textareaId) {
        var inst = instances[textareaId];
        if (!inst) return '';
        syncToTextarea(inst);
        return inst.textarea.value;
    }

    function setHTML(textareaId, html) {
        var inst = instances[textareaId];
        if (!inst) return;
        if (inst.isSourceMode) {
            inst.sourceView.value = html;
        } else {
            inst.editor.innerHTML = iframesToPlaceholders(html);
        }
        syncToTextarea(inst);
    }

    function isEmpty(textareaId) {
        var inst = instances[textareaId];
        if (!inst) return true;
        var text = inst.editor.innerText || inst.editor.textContent || '';
        return text.replace(/\s/g, '').length === 0;
    }

    function focus(textareaId) {
        var inst = instances[textareaId];
        if (inst) inst.editor.focus();
    }

    function enable(textareaId) {
        var inst = instances[textareaId];
        if (!inst) return;
        inst.editor.contentEditable = 'true';
        inst.wrapper.classList.remove('zw-disabled');
        var btns = inst.toolbar.querySelectorAll('.zw-toolbar-btn');
        for (var i = 0; i < btns.length; i++) btns[i].disabled = false;
    }

    function disable(textareaId) {
        var inst = instances[textareaId];
        if (!inst) return;
        inst.editor.contentEditable = 'false';
        inst.wrapper.classList.add('zw-disabled');
        var btns = inst.toolbar.querySelectorAll('.zw-toolbar-btn');
        for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
    }

    function getInstance(textareaId) { return instances[textareaId] || null; }

    function destroy(textareaId) {
        var inst = instances[textareaId];
        if (!inst) return;
        removeImageResizeHandles(inst);
        inst.textarea.style.display = '';
        inst.wrapper.remove();
        delete instances[textareaId];
    }

    return {
        init: init,
        getInstance: getInstance,
        destroy: destroy,
        getHTML: getHTML,
        setHTML: setHTML,
        isEmpty: isEmpty,
        focus: focus,
        enable: enable,
        disable: disable,
        locales: locales
    };
}));
