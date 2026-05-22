<?php
$wp_load_path = dirname(dirname(dirname(__DIR__))) . '/wp-load.php';
if (file_exists($wp_load_path)) {
    require_once $wp_load_path;
} else {
    die("Could not find wp-load.php");
}

header('Content-Type: text/plain');

$registry = WP_Block_Type_Registry::get_instance();
$block_name = 'bpldl/document-library';

if ($registry->is_registered($block_name)) {
    echo "Block {$block_name} IS registered.\n";
} else {
    echo "Block {$block_name} is NOT registered.\n";
}

$shortcode_output = do_shortcode('[document_library id="201"]');
echo "Shortcode output length: " . strlen($shortcode_output) . "\n";
echo "Shortcode output snippet:\n" . substr($shortcode_output, 0, 500) . "\n";
