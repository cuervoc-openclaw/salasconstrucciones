<?php
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});
require_once get_template_directory() . '/assets/bootstrap.php';
