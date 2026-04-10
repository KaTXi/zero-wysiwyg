<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zero WYSIWYG — PHP Template Example</title>
    <link rel="stylesheet" href="../../src/zero-wysiwyg.css">
    <link rel="stylesheet" href="../../src/themes/dark.css">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { margin-bottom: 8px; }
        p.desc { color: #666; margin-bottom: 24px; }
        label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        input[type="text"] { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
        .btn-submit { padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; }
        .btn-submit:hover { background: #1d4ed8; }
        .result { margin-top: 24px; padding: 20px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; }
        .result h3 { margin: 0 0 12px; color: #166534; }
        .result pre { white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 12px; background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd; }
    </style>
</head>
<body>
<?php
/**
 * Zero WYSIWYG — PHP Template Integration Example
 *
 * This shows how to use Zero WYSIWYG in a standard PHP form.
 * The editor syncs to the hidden <textarea>, so $_POST receives the HTML.
 *
 * Usage in your PHP project:
 *   1. Include zero-wysiwyg.css and zero-wysiwyg.js in your layout
 *   2. Add a <textarea> in your form
 *   3. Call ZeroWysiwyg.init() after the page loads
 *   4. On POST, access the HTML via $_POST['content']
 */

// CSRF token (simple example — use your framework's CSRF mechanism in production)
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

// Handle form submission
$submitted = false;
$title = '';
$content = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
        die('CSRF validation failed');
    }
    $title = htmlspecialchars($_POST['title'] ?? '', ENT_QUOTES, 'UTF-8');
    $content = $_POST['content'] ?? ''; // HTML content from the editor
    $submitted = true;
}
?>

<h1>Zero WYSIWYG — PHP Template</h1>
<p class="desc">Standard PHP form with CSRF protection. The editor content is submitted as a regular POST field.</p>

<form method="POST" action="">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">

    <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" value="<?= $title ?>" required>
    </div>

    <div class="form-group">
        <label for="content">Content</label>
        <textarea id="content" name="content" style="width:100%"><?= htmlspecialchars($content) ?></textarea>
    </div>

    <button type="submit" class="btn-submit">Save Article</button>
</form>

<?php if ($submitted): ?>
<div class="result">
    <h3>✅ Form submitted successfully</h3>
    <p><strong>Title:</strong> <?= $title ?></p>
    <p><strong>HTML Content:</strong></p>
    <pre><?= htmlspecialchars($content) ?></pre>
</div>
<?php endif; ?>

<script src="../../src/zero-wysiwyg.js"></script>
<script>
    ZeroWysiwyg.init('content', {
        height: '350px',
        locale: 'en',
        wordCount: true,
        slashCommands: true
    });
</script>
</body>
</html>