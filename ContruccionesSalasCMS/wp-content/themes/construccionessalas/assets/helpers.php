<?php
/**
 * Utilidades compartidas para los controladores del CMS.
 * Incluye saneamiento de texto y validación/mapeo de iconos.
 */
namespace CSalas\Helpers;
/**
 * Sanea una cadena y devuelve texto seguro para JSON/salida.
 * @param mixed $v Valor a sanear
 * @return string Texto saneado (o cadena vacía si no es string)
 */
function text($v){return is_string($v)?sanitize_text_field($v):'';}
/**
 * Valida el slug de icono contra la lista permitida y devuelve un valor seguro.
 * @param string $slug Slug de icono (bolt|pipe|paint|home)
 * @return string Slug permitido, o 'bolt' por defecto
 */
function icon($slug){
    $allowed=['bolt','pipe','paint','home'];
    return in_array($slug,$allowed,true)?$slug:'bolt';
}
