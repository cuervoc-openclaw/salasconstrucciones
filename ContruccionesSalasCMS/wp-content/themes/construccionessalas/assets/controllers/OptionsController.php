<?php
/**
 * Controlador de opciones del sitio para la landing.
 *
 * Qué hace:
 * - Registra claves en la opción del sitio (tabla wp_options) con prefijo "csalas_*".
 * - Habilita la exposición por REST (show_in_rest=true), por lo que aparecen en /wp-json/wp/v2/settings.
 * - Permite leer internamente con get_option('csalas_*') desde otros controladores.
 *
 * Cómo cambiar valores:
 * - Por REST (recomendado para headless): POST a /wp-json/wp/v2/settings con autenticación (Application Password).
 *   Ejemplo: {"csalas_phone":"+56 9 1234 5678","csalas_email":"contacto@salas.cl"}
 * - Por WP-CLI (si está disponible): wp option update csalas_phone "+56 9 1234 5678"
 * - Por Base de datos (último recurso): editar filas en wp_options donde option_name sea "csalas_*".
 *
 * Seguridad y saneamiento:
 * - Estos valores se consumen desde LandingController con la utilidad text() (helpers) que sanea strings.
 * - Evitar guardar HTML aquí; se espera texto plano (teléfono, correos, títulos).
 */
namespace CSalas\Controllers;
class OptionsController{
    public static function register(){
        /**
         * Hero: título principal de la landing.
         * type: string → texto simple
         * show_in_rest: true → visible en /wp-json/wp/v2/settings (lectura/escritura con auth)
         * default: '' → si no se define, se usa fallback en Astro
         */
        register_setting('csalas','csalas_hero_title',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        /**
         * Hero: subtítulo/descripción corta bajo el título.
         */
        register_setting('csalas','csalas_hero_subtitle',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        /**
         * CTA primaria: texto del botón (ej. "Solicitar presupuesto").
         */
        register_setting('csalas','csalas_cta_primary_label',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Solicitar presupuesto'
        ]);
        /**
         * CTA primaria: enlace del botón (ej. "#contacto" o URL absoluta).
         */
        register_setting('csalas','csalas_cta_primary_href',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'#contacto'
        ]);
        /**
         * CTA secundaria: texto del botón (ej. "Llamar ahora").
         */
        register_setting('csalas','csalas_cta_secondary_label',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Llamar ahora'
        ]);
        /**
         * CTA secundaria: enlace del botón (ej. "#contacto" o "tel:+56...").
         */
        register_setting('csalas','csalas_cta_secondary_href',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'#contacto'
        ]);
        /**
         * Contacto: teléfono principal (se usa en enlaces tel: del frontend).
         * Ejemplo de formato recomendado: +56 9 1234 5678
         */
        register_setting('csalas','csalas_phone',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        /**
         * Contacto: correo principal (se usa en enlaces mailto: del frontend).
         * Ejemplo: contacto@salas.cl
         */
        register_setting('csalas','csalas_email',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        register_setting('csalas','csalas_whatsapp_phone',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        register_setting('csalas','csalas_about_title',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Sobre nosotros'
        ]);
        register_setting('csalas','csalas_about_text',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        register_setting('csalas','csalas_coverage_title',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Zonas de cobertura'
        ]);
        register_setting('csalas','csalas_coverage_text',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>''
        ]);
        register_setting('csalas','csalas_contact_title',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Listos para ayudarte'
        ]);
        register_setting('csalas','csalas_contact_subtitle',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'Atención rápida y confiable. Agenda una visita o cotiza hoy.'
        ]);
        register_setting('csalas','csalas_faq_enabled',[
            'type'=>'boolean',
            'show_in_rest'=>true,
            'default'=>true,
            'sanitize_callback'=>function($v){
                return (bool)$v;
            }
        ]);
        register_setting('csalas','csalas_slider_enabled',[
            'type'=>'boolean',
            'show_in_rest'=>true,
            'default'=>true,
            'sanitize_callback'=>function($v){
                return (bool)$v;
            }
        ]);
        register_setting('csalas','csalas_slider_effect',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'fade',
            'sanitize_callback'=>function($v){
                $s = is_string($v) ? sanitize_text_field($v) : '';
                return in_array($s,['fade','slide'],true) ? $s : 'fade';
            }
        ]);
        register_setting('csalas','csalas_slider_interval_ms',[
            'type'=>'integer',
            'show_in_rest'=>true,
            'default'=>6000,
            'sanitize_callback'=>function($v){
                $n = absint($v);
                return $n < 2000 ? 6000 : $n;
            }
        ]);
        register_setting('csalas','csalas_slider_transition_ms',[
            'type'=>'integer',
            'show_in_rest'=>true,
            'default'=>600,
            'sanitize_callback'=>function($v){
                $n = absint($v);
                return $n < 150 ? 600 : $n;
            }
        ]);
        register_setting('csalas','csalas_slider_slides_json',[
            'type'=>'string',
            'show_in_rest'=>true,
            'default'=>'',
            'sanitize_callback'=>function($v){
                if (!is_string($v)) return '';
                $s = trim($v);
                if (strlen($s) > 20000) $s = substr($s,0,20000);
                return $s;
            }
        ]);
    }
}
