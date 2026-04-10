#!/usr/bin/env node

/**
 * build.js — Zero WYSIWYG build script
 *
 * Minifies JS and CSS into dist/ folder.
 * Run: npm run build (or: node build.js)
 *
 * Requires devDependencies: terser, clean-css
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

// ── Helpers ──────────────────────────────────────────────────

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function fileSize(filepath) {
    var bytes = fs.statSync(filepath).size;
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
}

// ── JS Minification ──────────────────────────────────────────

async function minifyJS() {
    var src = fs.readFileSync(path.join(SRC, 'zero-wysiwyg.js'), 'utf8');
    var result = await minify(src, {
        compress: {
            drop_console: false,
            passes: 2
        },
        mangle: {
            reserved: ['ZeroWysiwyg']  // preserve the global name
        },
        output: {
            comments: /^!/  // keep banner comments starting with !
        }
    });

    if (result.error) {
        throw result.error;
    }

    var outPath = path.join(DIST, 'zero-wysiwyg.min.js');
    fs.writeFileSync(outPath, result.code);
    console.log('  JS  ' + fileSize(path.join(SRC, 'zero-wysiwyg.js')) + ' → ' + fileSize(outPath) + '  dist/zero-wysiwyg.min.js');
}

// ── CSS Minification ─────────────────────────────────────────

function minifyCSS(srcFile, outFile) {
    var src = fs.readFileSync(srcFile, 'utf8');
    var result = new CleanCSS({
        level: 2,
        returnPromise: false
    }).minify(src);

    if (result.errors && result.errors.length) {
        throw new Error(result.errors.join('\n'));
    }

    var outPath = path.join(DIST, outFile);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, result.styles);
    console.log('  CSS ' + fileSize(srcFile) + ' → ' + fileSize(outPath) + '  dist/' + outFile);
}

// ── Copy i18n files ──────────────────────────────────────────

function copyI18n() {
    var i18nSrc = path.join(SRC, 'i18n');
    var i18nDist = path.join(DIST, 'i18n');
    ensureDir(i18nDist);

    var files = fs.readdirSync(i18nSrc);
    files.forEach(function(file) {
        if (file.endsWith('.js')) {
            fs.copyFileSync(path.join(i18nSrc, file), path.join(i18nDist, file));
            console.log('  i18n copied  dist/i18n/' + file);
        }
    });
}

// ── Main ─────────────────────────────────────────────────────

async function build() {
    console.log('\nzero-wysiwyg build\n' + '─'.repeat(40));

    // Clean dist/
    if (fs.existsSync(DIST)) {
        fs.rmSync(DIST, { recursive: true });
    }
    ensureDir(DIST);

    // Minify JS
    await minifyJS();

    // Minify CSS
    minifyCSS(path.join(SRC, 'zero-wysiwyg.css'), 'zero-wysiwyg.min.css');
    minifyCSS(path.join(SRC, 'themes', 'dark.css'), 'themes/dark.min.css');

    // Copy i18n
    copyI18n();

    console.log('─'.repeat(40));
    console.log('✅ Build complete → dist/\n');
}

build().catch(function(err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
});