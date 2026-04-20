<?php
namespace CSalas\Admin;
class SettingsPage{
    public static function menu(){
        add_options_page('Construcciones Salas','Construcciones Salas','manage_options','csalas_options',[self::class,'render']);
    }
    public static function init(){
        add_settings_section('csalas_section_hero','Hero','__return_false','csalas_options');
        add_settings_field('csalas_hero_title','Título',[self::class,'field_input'],'csalas_options','csalas_section_hero',['option'=>'csalas_hero_title']);
        add_settings_field('csalas_hero_subtitle','Subtítulo',[self::class,'field_input'],'csalas_options','csalas_section_hero',['option'=>'csalas_hero_subtitle']);
        add_settings_section('csalas_section_slider','Slider (Hero)','__return_false','csalas_options');
        add_settings_field('csalas_slider_enabled','Activar slider',[self::class,'field_checkbox'],'csalas_options','csalas_section_slider',['option'=>'csalas_slider_enabled']);
        add_settings_field('csalas_slider_effect','Efecto',[self::class,'field_select'],'csalas_options','csalas_section_slider',[
            'option'=>'csalas_slider_effect',
            'choices'=>['fade'=>'Fade','slide'=>'Slide']
        ]);
        add_settings_field('csalas_slider_interval_ms','Intervalo (ms)',[self::class,'field_number'],'csalas_options','csalas_section_slider',[
            'option'=>'csalas_slider_interval_ms',
            'min'=>2000,
            'step'=>100
        ]);
        add_settings_field('csalas_slider_transition_ms','Transición (ms)',[self::class,'field_number'],'csalas_options','csalas_section_slider',[
            'option'=>'csalas_slider_transition_ms',
            'min'=>150,
            'step'=>50
        ]);
        add_settings_field('csalas_slider_slides_json','Slides (JSON)',[self::class,'field_textarea'],'csalas_options','csalas_section_slider',[ 'option'=>'csalas_slider_slides_json' ]);
        add_settings_section('csalas_section_cta','CTAs','__return_false','csalas_options');
        add_settings_field('csalas_cta_primary_label','CTA primaria (texto)',[self::class,'field_input'],'csalas_options','csalas_section_cta',['option'=>'csalas_cta_primary_label']);
        add_settings_field('csalas_cta_primary_href','CTA primaria (enlace)',[self::class,'field_input'],'csalas_options','csalas_section_cta',['option'=>'csalas_cta_primary_href']);
        add_settings_field('csalas_cta_secondary_label','CTA secundaria (texto)',[self::class,'field_input'],'csalas_options','csalas_section_cta',['option'=>'csalas_cta_secondary_label']);
        add_settings_field('csalas_cta_secondary_href','CTA secundaria (enlace)',[self::class,'field_input'],'csalas_options','csalas_section_cta',['option'=>'csalas_cta_secondary_href']);
        add_settings_section('csalas_section_home','Contenido Home','__return_false','csalas_options');
        add_settings_field('csalas_about_title','Sobre nosotros (título)',[self::class,'field_input'],'csalas_options','csalas_section_home',['option'=>'csalas_about_title']);
        add_settings_field('csalas_about_text','Sobre nosotros (texto)',[self::class,'field_textarea'],'csalas_options','csalas_section_home',['option'=>'csalas_about_text']);
        add_settings_field('csalas_coverage_title','Cobertura (título)',[self::class,'field_input'],'csalas_options','csalas_section_home',['option'=>'csalas_coverage_title']);
        add_settings_field('csalas_coverage_text','Cobertura (texto)',[self::class,'field_textarea'],'csalas_options','csalas_section_home',['option'=>'csalas_coverage_text']);
        add_settings_field('csalas_faq_enabled','Mostrar preguntas frecuentes',[self::class,'field_checkbox'],'csalas_options','csalas_section_home',['option'=>'csalas_faq_enabled']);
        add_settings_section('csalas_section_contact','Contacto','__return_false','csalas_options');
        add_settings_field('csalas_phone','Teléfono',[self::class,'field_input'],'csalas_options','csalas_section_contact',['option'=>'csalas_phone']);
        add_settings_field('csalas_whatsapp_phone','WhatsApp',[self::class,'field_input'],'csalas_options','csalas_section_contact',['option'=>'csalas_whatsapp_phone']);
        add_settings_field('csalas_email','Correo',[self::class,'field_input'],'csalas_options','csalas_section_contact',['option'=>'csalas_email']);
        add_settings_field('csalas_contact_title','Contacto (título)',[self::class,'field_input'],'csalas_options','csalas_section_contact',['option'=>'csalas_contact_title']);
        add_settings_field('csalas_contact_subtitle','Contacto (texto)',[self::class,'field_input'],'csalas_options','csalas_section_contact',['option'=>'csalas_contact_subtitle']);
    }
    public static function field_input($args){
        $opt = isset($args['option']) ? $args['option'] : '';
        $val = get_option($opt,'');
        echo '<input type="text" class="regular-text" name="'.esc_attr($opt).'" value="'.esc_attr($val).'" />';
    }
    public static function field_number($args){
        $opt = isset($args['option']) ? $args['option'] : '';
        $val = get_option($opt,'');
        $min = isset($args['min']) ? (int)$args['min'] : 0;
        $step = isset($args['step']) ? (int)$args['step'] : 1;
        echo '<input type="number" class="small-text" name="'.esc_attr($opt).'" value="'.esc_attr($val).'" min="'.esc_attr($min).'" step="'.esc_attr($step).'" />';
    }
    public static function field_select($args){
        $opt = isset($args['option']) ? $args['option'] : '';
        $val = get_option($opt,'');
        $choices = isset($args['choices']) && is_array($args['choices']) ? $args['choices'] : [];
        echo '<select name="'.esc_attr($opt).'">';
        foreach($choices as $k=>$label){
            $sel = ((string)$val === (string)$k) ? ' selected' : '';
            echo '<option value="'.esc_attr($k).'"'.$sel.'>'.esc_html($label).'</option>';
        }
        echo '</select>';
    }
    public static function field_textarea($args){
        $opt = isset($args['option']) ? $args['option'] : '';
        $val = get_option($opt,'');
        echo '<textarea name="'.esc_attr($opt).'" rows="10" class="large-text code">'.esc_textarea($val).'</textarea>';
    }
    public static function field_checkbox($args){
        $opt = isset($args['option']) ? $args['option'] : '';
        $val = get_option($opt, true);
        $checked = ($val === true || $val === '1' || $val === 1) ? ' checked' : '';
        echo '<label><input type="checkbox" name="'.esc_attr($opt).'" value="1"'.$checked.' /> Activado</label>';
    }
    public static function render(){
        echo '<div class="wrap"><h1>Construcciones Salas</h1><form method="post" action="options.php">';
        settings_fields('csalas');
        do_settings_sections('csalas_options');
        submit_button();
        echo '</form></div>';
    }
}
