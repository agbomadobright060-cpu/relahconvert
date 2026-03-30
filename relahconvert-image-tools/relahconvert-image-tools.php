<?php
/**
 * Plugin Name: RelahConvert Image Tools
 * Plugin URI: https://relahconvert.com
 * Description: Free image tools powered by RelahConvert — compress, convert, resize, and remove backgrounds directly from your WordPress media library.
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Author: RelahConvert
 * Author URI: https://relahconvert.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: relahconvert-image-tools
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'RELAHCONVERT_VERSION', '1.0.0' );
define( 'RELAHCONVERT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'RELAHCONVERT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RELAHCONVERT_BASE_URL', 'https://relahconvert.com' );

/**
 * On activation, add CORS headers for uploads so RelahConvert can fetch images.
 */
function relahconvert_activate() {
    $uploads_dir = wp_upload_dir();
    $htaccess = $uploads_dir['basedir'] . '/.htaccess';
    $marker = '# BEGIN RelahConvert CORS';
    $rule = $marker . "\n<IfModule mod_headers.c>\nHeader set Access-Control-Allow-Origin \"https://relahconvert.com\"\n</IfModule>\n# END RelahConvert CORS\n";

    if ( file_exists( $htaccess ) ) {
        $content = file_get_contents( $htaccess );
        if ( strpos( $content, $marker ) === false ) {
            file_put_contents( $htaccess, $rule . $content );
        }
    } else {
        file_put_contents( $htaccess, $rule );
    }
}
register_activation_hook( __FILE__, 'relahconvert_activate' );

/**
 * On deactivation, remove CORS headers.
 */
function relahconvert_deactivate() {
    $uploads_dir = wp_upload_dir();
    $htaccess = $uploads_dir['basedir'] . '/.htaccess';
    if ( file_exists( $htaccess ) ) {
        $content = file_get_contents( $htaccess );
        $content = preg_replace( '/# BEGIN RelahConvert CORS.*?# END RelahConvert CORS\n?/s', '', $content );
        file_put_contents( $htaccess, $content );
    }
}
register_deactivation_hook( __FILE__, 'relahconvert_deactivate' );

/**
 * Enqueue admin assets.
 */
function relahconvert_enqueue_admin_assets( $hook ) {
    $allowed = array( 'upload.php', 'post.php', 'post-new.php', 'settings_page_relahconvert-settings' );
    if ( ! in_array( $hook, $allowed, true ) ) {
        return;
    }

    wp_enqueue_style(
        'relahconvert-admin',
        RELAHCONVERT_PLUGIN_URL . 'assets/css/admin.css',
        array(),
        RELAHCONVERT_VERSION
    );

    wp_enqueue_script(
        'relahconvert-admin',
        RELAHCONVERT_PLUGIN_URL . 'assets/js/admin.js',
        array( 'jquery' ),
        RELAHCONVERT_VERSION,
        true
    );

    wp_localize_script( 'relahconvert-admin', 'relahconvert', array(
        'baseUrl' => RELAHCONVERT_BASE_URL,
        'nonce'   => wp_create_nonce( 'relahconvert_nonce' ),
        'wpsite'  => rest_url( 'relahconvert/v1/upload' ),
        'token'   => relahconvert_generate_token(),
    ) );
}
add_action( 'admin_enqueue_scripts', 'relahconvert_enqueue_admin_assets' );

/**
 * Add action buttons to media library list view.
 */
function relahconvert_media_row_actions( $actions, $post ) {
    if ( ! wp_attachment_is_image( $post->ID ) ) {
        return $actions;
    }

    $mime = get_post_mime_type( $post->ID );
    $convert_tool = relahconvert_get_convert_tool( $mime );

    $image_url = wp_get_attachment_url( $post->ID );
    $actions['relahconvert_compress'] = sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
        esc_url( relahconvert_tool_url( 'compress', $image_url ) ),
        esc_attr__( 'Compress with RelahConvert', 'relahconvert-image-tools' ),
        esc_html__( 'Compress', 'relahconvert-image-tools' )
    );

    if ( $convert_tool ) {
        $actions['relahconvert_convert'] = sprintf(
            '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
            esc_url( relahconvert_tool_url( $convert_tool, $image_url ) ),
            esc_attr__( 'Convert with RelahConvert', 'relahconvert-image-tools' ),
            esc_html__( 'Convert', 'relahconvert-image-tools' )
        );
    }

    $actions['relahconvert_resize'] = sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
        esc_url( relahconvert_tool_url( 'resize', $image_url ) ),
        esc_attr__( 'Resize with RelahConvert', 'relahconvert-image-tools' ),
        esc_html__( 'Resize', 'relahconvert-image-tools' )
    );

    $actions['relahconvert_remove_bg'] = sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
        esc_url( relahconvert_tool_url( 'remove-background', $image_url ) ),
        esc_attr__( 'Remove Background', 'relahconvert-image-tools' ),
        esc_html__( 'Remove BG', 'relahconvert-image-tools' )
    );

    return $actions;
}
add_filter( 'media_row_actions', 'relahconvert_media_row_actions', 10, 2 );

/**
 * Add buttons to attachment details modal (grid view).
 */
function relahconvert_attachment_fields( $form_fields, $post ) {
    if ( ! wp_attachment_is_image( $post->ID ) ) {
        return $form_fields;
    }

    $mime = get_post_mime_type( $post->ID );
    $image_url = wp_get_attachment_url( $post->ID );
    $convert_tool = relahconvert_get_convert_tool( $mime );

    $buttons = '<div class="relahconvert-buttons">';
    $buttons .= sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="button relahconvert-btn relahconvert-btn-compress">%s</a>',
        esc_url( relahconvert_tool_url( 'compress', $image_url ) ),
        esc_html__( 'Compress', 'relahconvert-image-tools' )
    );

    if ( $convert_tool ) {
        $buttons .= sprintf(
            '<a href="%s" target="_blank" rel="noopener" class="button relahconvert-btn relahconvert-btn-convert">%s</a>',
            esc_url( relahconvert_tool_url( $convert_tool, $image_url ) ),
            esc_html__( 'Convert', 'relahconvert-image-tools' )
        );
    }

    $buttons .= sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="button relahconvert-btn relahconvert-btn-resize">%s</a>',
        esc_url( relahconvert_tool_url( 'resize', $image_url ) ),
        esc_html__( 'Resize', 'relahconvert-image-tools' )
    );

    $buttons .= sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="button relahconvert-btn relahconvert-btn-remove-bg">%s</a>',
        esc_url( relahconvert_tool_url( 'remove-background', $image_url ) ),
        esc_html__( 'Remove BG', 'relahconvert-image-tools' )
    );
    $buttons .= '</div>';

    $form_fields['relahconvert'] = array(
        'label' => __( 'RelahConvert', 'relahconvert-image-tools' ),
        'input' => 'html',
        'html'  => $buttons,
    );

    return $form_fields;
}
add_filter( 'attachment_fields_to_edit', 'relahconvert_attachment_fields', 10, 2 );

/**
 * Determine the best convert tool based on MIME type.
 */
function relahconvert_get_convert_tool( $mime ) {
    $map = array(
        'image/jpeg' => 'jpg-to-png',
        'image/png'  => 'png-to-jpg',
        'image/webp' => 'webp-to-jpg',
        'image/gif'  => 'gif-to-jpg',
        'image/bmp'  => 'bmp-to-jpg',
        'image/tiff' => 'tiff-to-jpg',
    );

    return isset( $map[ $mime ] ) ? $map[ $mime ] : '';
}

/**
 * Register settings page.
 */
function relahconvert_register_settings_page() {
    add_options_page(
        __( 'RelahConvert Image Tools', 'relahconvert-image-tools' ),
        __( 'RelahConvert', 'relahconvert-image-tools' ),
        'manage_options',
        'relahconvert-settings',
        'relahconvert_settings_page'
    );
}
add_action( 'admin_menu', 'relahconvert_register_settings_page' );

/**
 * Render settings page.
 */
function relahconvert_settings_page() {
    ?>
    <div class="wrap relahconvert-settings">
        <h1><?php esc_html_e( 'RelahConvert Image Tools', 'relahconvert-image-tools' ); ?></h1>

        <div class="relahconvert-settings-card">
            <h2><?php esc_html_e( 'Available Tools', 'relahconvert-image-tools' ); ?></h2>
            <p><?php esc_html_e( 'RelahConvert provides free browser-based image tools. No files are uploaded to any server — all processing happens in your browser.', 'relahconvert-image-tools' ); ?></p>

            <table class="widefat relahconvert-tools-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Tool', 'relahconvert-image-tools' ); ?></th>
                        <th><?php esc_html_e( 'Description', 'relahconvert-image-tools' ); ?></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong><?php esc_html_e( 'Compress Image', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Reduce file size of JPG, PNG, and WebP images while maintaining quality.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/compress' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Resize Image', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Resize images by pixels or percentage.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/resize' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Remove Background', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Remove image backgrounds with AI — free, no upload required.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/remove-background' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Convert Formats', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Convert between JPG, PNG, WebP, GIF, BMP, TIFF, and more.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/jpg-to-png' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Crop Image', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Crop images with exact pixel dimensions.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/crop' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Watermark Image', 'relahconvert-image-tools' ); ?></strong></td>
                        <td><?php esc_html_e( 'Add text or image watermarks to your photos.', 'relahconvert-image-tools' ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/watermark' ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="relahconvert-settings-card">
            <h2><?php esc_html_e( 'How It Works', 'relahconvert-image-tools' ); ?></h2>
            <ol>
                <li><?php esc_html_e( 'Go to your Media Library.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'Click any RelahConvert action button (Compress, Convert, Resize, Remove BG) on an image.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'The tool opens in a new tab on RelahConvert.com — drop your image and process it.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'Download the result and re-upload to WordPress.', 'relahconvert-image-tools' ); ?></li>
            </ol>
            <p><em><?php esc_html_e( 'All processing happens in your browser. Your files are never uploaded to any server.', 'relahconvert-image-tools' ); ?></em></p>
        </div>

        <p class="relahconvert-footer">
            <?php
            printf(
                /* translators: %s: RelahConvert link */
                esc_html__( 'Powered by %s', 'relahconvert-image-tools' ),
                '<a href="' . esc_url( RELAHCONVERT_BASE_URL ) . '" target="_blank" rel="noopener">RelahConvert</a>'
            );
            ?>
        </p>
    </div>
    <?php
}

/**
 * Add settings link on plugin page.
 */
function relahconvert_plugin_action_links( $links ) {
    $settings_link = sprintf(
        '<a href="%s">%s</a>',
        esc_url( admin_url( 'options-general.php?page=relahconvert-settings' ) ),
        esc_html__( 'Settings', 'relahconvert-image-tools' )
    );
    array_unshift( $links, $settings_link );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'relahconvert_plugin_action_links' );

/**
 * Generate a temporary upload token (valid for 30 minutes).
 */
function relahconvert_generate_token() {
    $token = wp_generate_password( 32, false );
    set_transient( 'relahconvert_token_' . $token, get_current_user_id(), 30 * MINUTE_IN_SECONDS );
    return $token;
}

/**
 * Build tool URL with auth params for sending images back.
 */
function relahconvert_tool_url( $tool, $image_url ) {
    $token = relahconvert_generate_token();
    $params = http_build_query( array(
        'url'    => $image_url,
        'wpsite' => rest_url( 'relahconvert/v1/upload' ),
        'token'  => $token,
    ) );
    return RELAHCONVERT_BASE_URL . '/' . $tool . '?' . $params;
}

/**
 * Register REST API endpoint for receiving processed images.
 */
function relahconvert_register_rest_routes() {
    register_rest_route( 'relahconvert/v1', '/upload', array(
        'methods'             => 'POST',
        'callback'            => 'relahconvert_handle_upload',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'relahconvert_register_rest_routes' );

/**
 * Handle image upload from RelahConvert.
 */
function relahconvert_handle_upload( $request ) {
    // Allow CORS from RelahConvert.
    header( 'Access-Control-Allow-Origin: https://relahconvert.com' );
    header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Content-Type' );

    $token = $request->get_param( 'token' );
    if ( ! $token ) {
        return new WP_Error( 'missing_token', 'Authentication token is required.', array( 'status' => 401 ) );
    }

    $user_id = get_transient( 'relahconvert_token_' . $token );
    if ( ! $user_id ) {
        return new WP_Error( 'invalid_token', 'Token is invalid or expired.', array( 'status' => 401 ) );
    }

    // Set the current user for upload permissions.
    wp_set_current_user( $user_id );
    if ( ! current_user_can( 'upload_files' ) ) {
        return new WP_Error( 'no_permission', 'User cannot upload files.', array( 'status' => 403 ) );
    }

    $files = $request->get_file_params();
    if ( empty( $files['file'] ) ) {
        return new WP_Error( 'no_file', 'No file was uploaded.', array( 'status' => 400 ) );
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $attachment_id = media_handle_upload( 'file', 0 );
    if ( is_wp_error( $attachment_id ) ) {
        return $attachment_id;
    }

    // Delete the token after successful use.
    delete_transient( 'relahconvert_token_' . $token );

    return rest_ensure_response( array(
        'success'       => true,
        'attachment_id'  => $attachment_id,
        'url'           => wp_get_attachment_url( $attachment_id ),
    ) );
}

/**
 * Handle CORS preflight for the upload endpoint.
 */
function relahconvert_cors_preflight() {
    if ( isset( $_SERVER['REQUEST_METHOD'] ) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS' ) {
        $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
        if ( strpos( $request_uri, 'relahconvert/v1/upload' ) !== false ) {
            header( 'Access-Control-Allow-Origin: https://relahconvert.com' );
            header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Content-Type' );
            header( 'Access-Control-Max-Age: 86400' );
            status_header( 204 );
            exit;
        }
    }
}
add_action( 'init', 'relahconvert_cors_preflight' );
