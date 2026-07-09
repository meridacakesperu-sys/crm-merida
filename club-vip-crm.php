<?php
/**
 * Plugin Name: CRM Club VIP - María Cakes
 * Description: Panel administrativo premium para gestionar a las alumnas del Club VIP y su integración con ARmember.
 * Version: 1.0.0
 * Author: Antigravity AI
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// 1. Agregar el menú en el panel de administración
add_action( 'admin_menu', 'club_vip_crm_menu' );
function club_vip_crm_menu() {
    add_menu_page(
        'CRM Club VIP',
        'CRM Club VIP',
        'manage_options',
        'club-vip-crm',
        'club_vip_crm_render_page',
        'dashicons-groups',
        3
    );
}

// 2. Renderizar el contenedor de React
function club_vip_crm_render_page() {
    echo '<div id="root"></div>';
}

// 3. Cargar los archivos compilados de React (JS y CSS)
add_action( 'admin_enqueue_scripts', 'club_vip_crm_enqueue_scripts' );
function club_vip_crm_enqueue_scripts( $hook ) {
    if ( $hook != 'toplevel_page_club-vip-crm' ) {
        return;
    }

    $plugin_url = plugin_dir_url( __FILE__ );
    
    // Aquí cargamos los archivos de la carpeta 'dist' generada por Vite
    // Nota: El nombre exacto del archivo JS/CSS cambiará en cada build.
    // Usaremos un método dinámico para encontrar los archivos en la carpeta dist/assets
    
    $dist_dir = plugin_dir_path( __FILE__ ) . 'dist/assets/';
    if ( is_dir( $dist_dir ) ) {
        $files = scandir( $dist_dir );
        foreach ( $files as $file ) {
            if ( pathinfo( $file, PATHINFO_EXTENSION ) === 'js' ) {
                wp_enqueue_script( 'club-vip-crm-js', $plugin_url . 'dist/assets/' . $file, array(), '1.0.0', true );
            }
            if ( pathinfo( $file, PATHINFO_EXTENSION ) === 'css' ) {
                wp_enqueue_style( 'club-vip-crm-css', $plugin_url . 'dist/assets/' . $file, array(), '1.0.0' );
            }
        }
    }

    // Pasar variables a React
    wp_localize_script( 'club-vip-crm-js', 'clubVipSettings', array(
        'root'  => esc_url_raw( rest_url() ),
        'nonce' => wp_create_nonce( 'wp_rest' )
    ) );
}

// 4. Registrar Rutas de la API REST
add_action( 'rest_api_init', function () {
    register_rest_route( 'clubvip/v1', '/students', array(
        'methods'             => 'GET',
        'callback'            => 'club_vip_get_students',
        'permission_callback' => function () {
            return current_user_can( 'manage_options' );
        }
    ) );

    register_rest_route( 'clubvip/v1', '/students/(?P<id>\d+)', array(
        'methods'             => 'POST',
        'callback'            => 'club_vip_update_student_status',
        'permission_callback' => function () {
            return current_user_can( 'manage_options' );
        }
    ) );
} );

// Obtener datos (Simulado para ARmember o tabla de usuarios)
function club_vip_get_students() {
    global $wpdb;
    $users = get_users(array('role' => 'subscriber')); // Obtener suscriptores
    
    $data = array();
    
    // Si tienes muchos usuarios, aquí idealmente haríamos una query a las tablas de ARmember.
    // Para esta demostración, leeremos a los usuarios y su estatus.
    foreach($users as $user) {
        $status = get_user_meta($user->ID, '_club_vip_status', true);
        if(!$status) $status = 'Activo';

        $data[] = array(
            'id' => $user->ID,
            'nombre' => $user->display_name,
            'email' => $user->user_email,
            'estatus' => $status,
            'plan' => 'Mensual', // Esto se conectaría con arm_get_user_memberships()
            'plataforma' => 'Yape',
            'fechaPendiente' => '30/12/25'
        );
    }
    
    return rest_ensure_response( $data );
}

// Actualizar estado
function club_vip_update_student_status( $request ) {
    $user_id = $request['id'];
    $new_status = $request->get_param( 'estatus' ); // 'Activo' o 'Eliminado'
    
    // 1. Guardar en User Meta
    update_user_meta( $user_id, '_club_vip_status', $new_status );
    
    // 2. Aquí va la integración exacta de ARmember.
    // Si ARmember está activo, podemos suspender o activar su plan usando código PHP:
    // global $arm_members_class; 
    // Si quieres bloquear el acceso, podrías cambiar su rol o usar la API de ARMember.
    
    if ( $new_status === 'Eliminado' ) {
        // Ejemplo genérico: quitarle el rol
        $user = new WP_User($user_id);
        // $user->remove_role('subscriber');
    }

    return rest_ensure_response( array( 'success' => true, 'new_status' => $new_status ) );
}
