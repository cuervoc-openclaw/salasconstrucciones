<?php
/**
 * Endpoint REST agregado para la landing de Astro.
 * Ruta: GET /wp-json/csalas/v1/landing
 * Devuelve JSON con hero, services y contact listo para consumir en frontend.
 */
namespace CSalas\Controllers;
use WP_Query;
use function CSalas\Helpers\text;
use function CSalas\Helpers\icon;
use const CSalas\Config\REST_NAMESPACE;
class LandingController{
    public static function register(){
        register_rest_route(REST_NAMESPACE,'/landing',[
            'methods'=>'GET',
            'callback'=>[self::class,'handleLanding'],
            'permission_callback'=>'__return_true'
        ]);
        register_rest_route(REST_NAMESPACE,'/hero-slider',[
            'methods'=>'GET',
            'callback'=>[self::class,'handleHeroSlider'],
            'permission_callback'=>'__return_true'
        ]);
    }
    private static function sanitizeHref($v){
        $s = is_string($v) ? trim($v) : '';
        if ($s === '') return '';
        if (strpos($s,'#') === 0) return $s;
        if (strpos($s,'tel:') === 0) return $s;
        if (strpos($s,'mailto:') === 0) return $s;
        return esc_url_raw($s);
    }
    private static function buildSlidesFromCpt(){
        $q = new WP_Query([
            'post_type'=>'hero_slide',
            'post_status'=>'publish',
            'posts_per_page'=>10,
            'orderby'=>'menu_order',
            'order'=>'ASC',
            'no_found_rows'=>true
        ]);
        $slides = [];
        foreach($q->posts as $p){
            $thumbId = get_post_thumbnail_id($p);
            $image = $thumbId ? wp_get_attachment_image_url($thumbId,'full') : '';
            $imageAlt = $thumbId ? get_post_meta($thumbId,'_wp_attachment_image_alt',true) : '';
            $title = text(get_the_title($p));
            $slides[]=[
                'title'=>$title,
                'subtitle'=>'',
                'image'=>esc_url_raw($image ?: ''),
                'imageAlt'=>text($imageAlt ?: $title),
                'primaryCta'=>[ 'label'=>'', 'href'=>'' ],
                'secondaryCta'=>[ 'label'=>'', 'href'=>'' ],
                'align'=>'left',
                'overlay'=>'',
                'textColor'=>''
            ];
            if (count($slides) >= 10) break;
        }
        return $slides;
    }
    private static function normalizeSlider(){
        $effect = text(get_option('csalas_slider_effect'));
        if (!in_array($effect,['fade','slide'],true)) $effect = 'fade';
        $intervalMs = absint(get_option('csalas_slider_interval_ms'));
        if ($intervalMs < 2000) $intervalMs = 6000;
        $transitionMs = absint(get_option('csalas_slider_transition_ms'));
        if ($transitionMs < 150 || $transitionMs >= $intervalMs) $transitionMs = 600;
        $cptSlides = self::buildSlidesFromCpt();
        if (count($cptSlides) > 0) {
            return [
                'settings'=>[
                    'effect'=>$effect,
                    'intervalMs'=>$intervalMs,
                    'transitionMs'=>$transitionMs
                ],
                'slides'=>$cptSlides
            ];
        }

        $raw = get_option('csalas_slider_slides_json');
        $decoded = is_string($raw) ? json_decode($raw,true) : null;
        $slidesRaw = [];
        if (is_array($decoded) && isset($decoded['slides']) && is_array($decoded['slides'])) $slidesRaw = $decoded['slides'];
        if (is_array($decoded)) {
            $keys = array_keys($decoded);
            $isList = ($keys === range(0, count($decoded) - 1));
            if ($isList) $slidesRaw = $decoded;
        }
        $slides = [];
        foreach($slidesRaw as $s){
            if (!is_array($s)) continue;
            $title = text($s['title'] ?? '');
            $subtitle = text($s['subtitle'] ?? '');
            $image = esc_url_raw(is_string($s['image'] ?? null) ? $s['image'] : '');
            $imageAlt = text($s['imageAlt'] ?? '');
            $primary = is_array($s['primaryCta'] ?? null) ? $s['primaryCta'] : [];
            $secondary = is_array($s['secondaryCta'] ?? null) ? $s['secondaryCta'] : [];
            $slides[]=[
                'title'=>$title,
                'subtitle'=>$subtitle,
                'image'=>$image,
                'imageAlt'=>$imageAlt,
                'primaryCta'=>[
                    'label'=>text($primary['label'] ?? ''),
                    'href'=>self::sanitizeHref($primary['href'] ?? ''),
                ],
                'secondaryCta'=>[
                    'label'=>text($secondary['label'] ?? ''),
                    'href'=>self::sanitizeHref($secondary['href'] ?? ''),
                ],
                'align'=>in_array(($s['align'] ?? ''),['left','center','right'],true) ? $s['align'] : 'left',
                'overlay'=>sanitize_hex_color($s['overlay'] ?? '') ?: '',
                'textColor'=>sanitize_hex_color($s['textColor'] ?? '') ?: ''
            ];
            if (count($slides) >= 10) break;
        }
        return [
            'settings'=>[
                'effect'=>$effect,
                'intervalMs'=>$intervalMs,
                'transitionMs'=>$transitionMs
            ],
            'slides'=>$slides
        ];
    }
    public static function handleHeroSlider($request){
        return self::normalizeSlider();
    }
    public static function handleLanding($request){
        // Hero: construido desde opciones de sitio
        $hero=[
            'title'=>text(get_option('csalas_hero_title')),
            'subtitle'=>text(get_option('csalas_hero_subtitle')),
            'ctaPrimary'=>[
                'label'=>text(get_option('csalas_cta_primary_label')),
                'href'=>text(get_option('csalas_cta_primary_href')),
            ],
            'ctaSecondary'=>[
                'label'=>text(get_option('csalas_cta_secondary_label')),
                'href'=>text(get_option('csalas_cta_secondary_href')),
            ],
        ];
        // Servicios: consulta al CPT 'servicio' (sin conteo total para eficiencia)
        $q=new WP_Query(['post_type'=>'servicio','posts_per_page'=>12,'no_found_rows'=>true]);
        $services=[];
        foreach($q->posts as $p){
            // Normalización de datos para el frontend
            $services[]=[
                'title'=>text(get_the_title($p)),
                'excerpt'=>text(get_the_excerpt($p)),
                'icon'=>icon(get_post_meta($p->ID,'icon_slug',true)),
                'image'=>get_the_post_thumbnail_url($p,'medium')?:'',
                'price'=>[
                    'base'=>absint(get_post_meta($p->ID,'csalas_price_base',true)),
                    'unit'=>text(get_post_meta($p->ID,'csalas_price_unit',true)),
                    'min'=>absint(get_post_meta($p->ID,'csalas_price_min',true)),
                    'note'=>text(get_post_meta($p->ID,'csalas_price_note',true)),
                ]
            ];
        }
        $about=[
            'title'=>text(get_option('csalas_about_title')),
            'text'=>text(get_option('csalas_about_text')),
        ];
        $coverage=[
            'title'=>text(get_option('csalas_coverage_title')),
            'text'=>text(get_option('csalas_coverage_text')),
        ];
        $sliderEnabledOpt = get_option('csalas_slider_enabled', true);
        $sliderEnabled = ($sliderEnabledOpt === true || $sliderEnabledOpt === '1' || $sliderEnabledOpt === 1);
        // Contacto básico desde opciones
        $contact=[
            'phone'=>text(get_option('csalas_phone')),
            'whatsapp'=>text(get_option('csalas_whatsapp_phone')),
            'email'=>text(get_option('csalas_email')),
        ];
        $contactCopy=[
            'title'=>text(get_option('csalas_contact_title')),
            'subtitle'=>text(get_option('csalas_contact_subtitle')),
        ];

        $faqs=[];
        $faqEnabledOpt = get_option('csalas_faq_enabled', true);
        $faqEnabled = ($faqEnabledOpt === true || $faqEnabledOpt === '1' || $faqEnabledOpt === 1);
        if ($faqEnabled){
            $qFaq=new WP_Query(['post_type'=>'faq','post_status'=>'publish','posts_per_page'=>20,'orderby'=>'menu_order','order'=>'ASC','no_found_rows'=>true]);
            foreach($qFaq->posts as $p){
                $faqs[]=[
                    'question'=>text(get_the_title($p)),
                    'answer'=>text(wp_strip_all_tags($p->post_content)),
                ];
            }
        }

        $qTest=new WP_Query(['post_type'=>'testimonio','post_status'=>'publish','posts_per_page'=>12,'orderby'=>'menu_order','order'=>'ASC','no_found_rows'=>true]);
        $testimonials=[];
        foreach($qTest->posts as $p){
            $rating=absint(get_post_meta($p->ID,'csalas_testimonial_rating',true));
            if ($rating < 1) $rating = 1;
            if ($rating > 5) $rating = 5;
            $testimonials[]=[
                'name'=>text(get_the_title($p)),
                'text'=>text(wp_strip_all_tags($p->post_content)),
                'service'=>text(get_post_meta($p->ID,'csalas_testimonial_service',true)),
                'location'=>text(get_post_meta($p->ID,'csalas_testimonial_location',true)),
                'rating'=>$rating,
                'image'=>get_the_post_thumbnail_url($p,'thumbnail')?:'',
            ];
        }

        $qProj=new WP_Query(['post_type'=>'proyecto','post_status'=>'publish','posts_per_page'=>12,'orderby'=>'menu_order','order'=>'ASC','no_found_rows'=>true]);
        $projects=[];
        foreach($qProj->posts as $p){
            $projects[]=[
                'slug'=>text($p->post_name),
                'title'=>text(get_the_title($p)),
                'excerpt'=>text(get_the_excerpt($p)),
                'image'=>get_the_post_thumbnail_url($p,'medium')?:'',
            ];
        }
        // Respuesta agregada
        return [
            'hero'=>$hero,
            'services'=>$services,
            'about'=>$about,
            'coverage'=>$coverage,
            'sliderEnabled'=>$sliderEnabled,
            'faqs'=>$faqs,
            'faqEnabled'=>$faqEnabled,
            'testimonials'=>$testimonials,
            'projects'=>$projects,
            'contact'=>$contact
            ,'contactCopy'=>$contactCopy
        ];
    }
}
