<?php
/*
Plugin Name: TT Order-Form
Plugin URI:
Description: TT Order-Form. Add order form by shortcode, include setting page
Author: Kuzin Evgeniy
Version: 1.0
Author URI: https://
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

/* add func on activate plugin */

define('TT_ORDER_FORM_VER', '1.0');

register_activation_hook(__FILE__, 'tt_order_form_activate');
function tt_order_form_activate() {

}

/* add func on deactivate plugin */
register_deactivation_hook( __FILE__, 'tt_order_form_deactivation');
function tt_order_form_deactivation() {

}

add_shortcode('order-form', function (){

    tt_order_form_enqueue_js_css();
    include __DIR__ . '/template.php';

});

include __DIR__ . '/admin.php';


add_action('wp_enqueue_scripts', function (){
    $order_form_settings = [
        'ttorderform_card|value' => get_option( "ttorderform_card|value"),
        'ttorderform_card|status' => get_option( "ttorderform_card|status"),
        'ttorderform_redirect_url|value' => get_option( "ttorderform_redirect_url|value"),
    ];
    wp_localize_script('jquery', 'order_form_settings', $order_form_settings);

});

function tt_order_form_enqueue_js_css(){

    wp_enqueue_script( 'order-form-js', plugin_dir_url(__FILE__ ) . 'assets/js/order-form.js', ['jquery'], TT_ORDER_FORM_VER );
    wp_enqueue_script( 'fancybox-js', plugin_dir_url(__FILE__ ) . 'assets/js/jquery.fancybox.js', ['jquery'], TT_ORDER_FORM_VER );
    wp_enqueue_style( 'order-form-css', plugin_dir_url(__FILE__ ) . 'assets/css/order-form.css', [], TT_ORDER_FORM_VER );
    wp_enqueue_style( 'fancybox-css', plugin_dir_url(__FILE__ ) . 'assets/css/jquery.fancybox.css', [], TT_ORDER_FORM_VER );

}

/**
 * Add GitHub Updater
 */
require 'plugin-update-checker/plugin-update-checker.php';
$myUpdateChecker = Puc_v4_Factory::buildUpdateChecker(
    'https://github.com/boosta-ltd/plagiarism-checker',
    __FILE__,
    'plagiarism-checker'
);

//Optional: If you're using a private repository, specify the access token like this:
$myUpdateChecker->setAuthentication('269c6898194e0e532df553dd194bcc3a6a7b4a5b');

//Optional: Set the branch that contains the stable release.
$myUpdateChecker->setBranch('master');