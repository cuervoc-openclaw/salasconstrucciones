<?php
/**
 * Arranque del tema headless.
 * - Carga configuración, utilidades y controladores del CMS.
 * - Registra hooks de WordPress para opciones, CPT y endpoints REST.
 * - Define CORS de desarrollo para permitir llamadas desde Astro.
 * Uso: este archivo se incluye una sola vez desde functions.php.
 */
// Configuración compartida (namespace REST, etc.)
require_once get_template_directory() . '/assets/config.php';
// Utilidades para saneamiento y mapeo de iconos
require_once get_template_directory() . '/assets/helpers.php';
// Controladores del CMS (opciones, servicios, landing)
require_once get_template_directory() . '/assets/controllers/OptionsController.php';
require_once get_template_directory() . '/assets/controllers/ServicesController.php';
require_once get_template_directory() . '/assets/controllers/LandingController.php';
// Página de ajustes en el admin
require_once get_template_directory() . '/assets/admin/SettingsPage.php';
// Registrar opciones del sitio y CPT de servicios al iniciar WordPress
add_action('init', ['\\CSalas\\Controllers\\OptionsController','register']);
add_action('init', ['\\CSalas\\Controllers\\ServicesController','register']);
// Registrar endpoints REST personalizados
add_action('rest_api_init', ['\\CSalas\\Controllers\\LandingController','register']);
// CORS de desarrollo: permite llamadas desde Astro Dev (ajustar en producción)
add_action('rest_api_init', function () {
    header('Access-Control-Allow-Origin: http://localhost:4322');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
});
// Registrar menú y campos de ajustes en el admin
add_action('admin_menu', ['\\CSalas\\Admin\\SettingsPage','menu']);
add_action('admin_init', ['\\CSalas\\Admin\\SettingsPage','init']);
