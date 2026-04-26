<?php
/**
 * Plugin Name: RelahConvert Image Tools
 * Plugin URI: https://relahconvert.com/wordpress
 * Description: Free image tools powered by RelahConvert — compress, convert, resize, watermark, and remove backgrounds directly from your WordPress media library.
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
 * Allowed tool slugs for URL building.
 */
function relahconvert_allowed_tools() {
    return array(
        'compress', 'watermark', 'resize', 'remove-background',
        'crop', 'rotate', 'flip', 'grayscale', 'round-corners',
        'jpg-to-pdf', 'meme-generator', 'merge-images', 'passport-photo',
        'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'gif-to-jpg',
        'bmp-to-jpg', 'tiff-to-jpg', 'jpg-to-webp', 'png-to-webp',
        'webp-to-png', 'bmp-to-png', 'gif-to-png', 'svg-to-png',
        'svg-to-jpg', 'png-to-gif', 'jpg-to-gif', 'jpg-to-svg',
        'heic-to-jpg', 'image-to-ico', 'png-to-pdf',
        'image-splitter', 'resize-in-kb', 'pixelate-image',
        'blur-face', 'html-to-image',
    );
}

/**
 * On activation, add CORS headers for uploads so RelahConvert can fetch images.
 */
function relahconvert_activate() {
    $uploads_dir = wp_upload_dir();
    $basedir = $uploads_dir['basedir'];
    $htaccess = $basedir . '/.htaccess';
    $marker = '# BEGIN RelahConvert CORS';
    $rule = $marker . "\n<IfModule mod_headers.c>\nHeader set Access-Control-Allow-Origin \"https://relahconvert.com\"\n</IfModule>\n# END RelahConvert CORS\n";

    if ( ! wp_is_writable( $basedir ) ) {
        return;
    }

    if ( file_exists( $htaccess ) ) {
        $content = file_get_contents( $htaccess ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
        if ( strpos( $content, $marker ) === false ) {
            file_put_contents( $htaccess, $rule . $content ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
        }
    } else {
        file_put_contents( $htaccess, $rule ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
    }
}
register_activation_hook( __FILE__, 'relahconvert_activate' );

/**
 * On deactivation, remove CORS headers.
 */
function relahconvert_deactivate() {
    $uploads_dir = wp_upload_dir();
    $htaccess = $uploads_dir['basedir'] . '/.htaccess';

    if ( file_exists( $htaccess ) && wp_is_writable( $uploads_dir['basedir'] ) ) {
        $content = file_get_contents( $htaccess ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
        $content = preg_replace( '/# BEGIN RelahConvert CORS.*?# END RelahConvert CORS\n?/s', '', $content );
        file_put_contents( $htaccess, $content ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
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

    $image_url = wp_get_attachment_url( $post->ID );
    $actions['relahconvert_compress'] = sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
        esc_url( relahconvert_tool_url( 'compress', $image_url ) ),
        esc_attr__( 'Compress with RelahConvert', 'relahconvert-image-tools' ),
        esc_html__( 'Compress', 'relahconvert-image-tools' )
    );

    $actions['relahconvert_watermark'] = sprintf(
        '<a href="%s" target="_blank" rel="noopener" class="relahconvert-action" title="%s">%s</a>',
        esc_url( relahconvert_tool_url( 'watermark', $image_url ) ),
        esc_attr__( 'Watermark with RelahConvert', 'relahconvert-image-tools' ),
        esc_html__( 'Watermark', 'relahconvert-image-tools' )
    );

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
 * Grid view modal buttons are handled entirely by admin.js.
 * We skip the PHP attachment_fields filter for AJAX requests to avoid duplicates.
 */
function relahconvert_attachment_fields( $form_fields, $post ) {
    if ( wp_doing_ajax() || ! wp_attachment_is_image( $post->ID ) ) {
        return $form_fields;
    }

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
            <p><?php esc_html_e( 'RelahConvert provides 38 free image tools. 35 run entirely in your browser (compress, resize, crop, rotate, flip, watermark, grayscale, round corners, format conversions, PDF generation, meme generator, passport photo cropping, image splitter, merge, pixelate, blur face, etc.). 2 tools use the Remove.bg API for AI background removal (Remove Background, Passport Photo). 1 tool (HTML to Image) uses the ApiFlash API to screenshot a URL you provide.', 'relahconvert-image-tools' ); ?></p>

            <table class="widefat relahconvert-tools-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Tool', 'relahconvert-image-tools' ); ?></th>
                        <th><?php esc_html_e( 'Description', 'relahconvert-image-tools' ); ?></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $tools = array(
                        // Optimization
                        array( 'compress',          __( 'Compress Image', 'relahconvert-image-tools' ),    __( 'Reduce file size of JPG, PNG, and WebP images while maintaining quality.', 'relahconvert-image-tools' ) ),
                        array( 'resize',            __( 'Resize Image', 'relahconvert-image-tools' ),      __( 'Resize images by pixels or percentage.', 'relahconvert-image-tools' ) ),
                        array( 'resize-in-kb',      __( 'Resize to KB', 'relahconvert-image-tools' ),      __( 'Resize images to a specific target file size in KB.', 'relahconvert-image-tools' ) ),
                        // Edit
                        array( 'crop',              __( 'Crop Image', 'relahconvert-image-tools' ),        __( 'Crop images with exact pixel dimensions.', 'relahconvert-image-tools' ) ),
                        array( 'rotate',            __( 'Rotate Image', 'relahconvert-image-tools' ),      __( 'Rotate images by any angle.', 'relahconvert-image-tools' ) ),
                        array( 'flip',              __( 'Flip Image', 'relahconvert-image-tools' ),        __( 'Flip images horizontally or vertically.', 'relahconvert-image-tools' ) ),
                        array( 'grayscale',         __( 'Grayscale', 'relahconvert-image-tools' ),         __( 'Convert images to black and white.', 'relahconvert-image-tools' ) ),
                        array( 'round-corners',     __( 'Round Corners', 'relahconvert-image-tools' ),     __( 'Add rounded corners to images.', 'relahconvert-image-tools' ) ),
                        array( 'watermark',         __( 'Watermark Image', 'relahconvert-image-tools' ),   __( 'Add text or image watermarks to your photos.', 'relahconvert-image-tools' ) ),
                        // Layout
                        array( 'merge-images',      __( 'Merge Images', 'relahconvert-image-tools' ),      __( 'Combine multiple images side-by-side or stacked.', 'relahconvert-image-tools' ) ),
                        array( 'image-splitter',    __( 'Image Splitter', 'relahconvert-image-tools' ),    __( 'Split an image into a grid of smaller tiles.', 'relahconvert-image-tools' ) ),
                        // Privacy / Effects
                        array( 'remove-background', __( 'Remove Background', 'relahconvert-image-tools' ), __( 'Remove image backgrounds with AI (uses Remove.bg API).', 'relahconvert-image-tools' ) ),
                        array( 'blur-face',         __( 'Blur Face', 'relahconvert-image-tools' ),         __( 'Automatically detect and blur faces in photos.', 'relahconvert-image-tools' ) ),
                        array( 'pixelate-image',    __( 'Pixelate Image', 'relahconvert-image-tools' ),    __( 'Pixelate an entire image or a selected region.', 'relahconvert-image-tools' ) ),
                        // Create
                        array( 'meme-generator',    __( 'Meme Generator', 'relahconvert-image-tools' ),    __( 'Create memes with custom text on images or templates.', 'relahconvert-image-tools' ) ),
                        array( 'passport-photo',    __( 'Passport Photo', 'relahconvert-image-tools' ),    __( 'Create passport-sized photos for 170+ countries.', 'relahconvert-image-tools' ) ),
                        array( 'html-to-image',     __( 'HTML to Image', 'relahconvert-image-tools' ),     __( 'Screenshot any URL to an image (uses ApiFlash API).', 'relahconvert-image-tools' ) ),
                        // Format conversion
                        array( 'jpg-to-png',        __( 'JPG to PNG', 'relahconvert-image-tools' ),        __( 'Convert JPG images to PNG format.', 'relahconvert-image-tools' ) ),
                        array( 'png-to-jpg',        __( 'PNG to JPG', 'relahconvert-image-tools' ),        __( 'Convert PNG images to JPG format.', 'relahconvert-image-tools' ) ),
                        array( 'jpg-to-webp',       __( 'JPG to WebP', 'relahconvert-image-tools' ),       __( 'Convert JPG images to WebP format.', 'relahconvert-image-tools' ) ),
                        array( 'webp-to-jpg',       __( 'WebP to JPG', 'relahconvert-image-tools' ),       __( 'Convert WebP images to JPG format.', 'relahconvert-image-tools' ) ),
                        array( 'png-to-webp',       __( 'PNG to WebP', 'relahconvert-image-tools' ),       __( 'Convert PNG images to WebP format.', 'relahconvert-image-tools' ) ),
                        array( 'webp-to-png',       __( 'WebP to PNG', 'relahconvert-image-tools' ),       __( 'Convert WebP images to PNG format.', 'relahconvert-image-tools' ) ),
                        array( 'gif-to-jpg',        __( 'GIF to JPG', 'relahconvert-image-tools' ),        __( 'Convert GIF images to JPG format.', 'relahconvert-image-tools' ) ),
                        array( 'gif-to-png',        __( 'GIF to PNG', 'relahconvert-image-tools' ),        __( 'Convert GIF images to PNG format.', 'relahconvert-image-tools' ) ),
                        array( 'jpg-to-gif',        __( 'JPG to GIF', 'relahconvert-image-tools' ),        __( 'Convert JPG images to GIF format.', 'relahconvert-image-tools' ) ),
                        array( 'png-to-gif',        __( 'PNG to GIF', 'relahconvert-image-tools' ),        __( 'Convert PNG images to GIF format.', 'relahconvert-image-tools' ) ),
                        array( 'bmp-to-jpg',        __( 'BMP to JPG', 'relahconvert-image-tools' ),        __( 'Convert BMP images to JPG format.', 'relahconvert-image-tools' ) ),
                        array( 'bmp-to-png',        __( 'BMP to PNG', 'relahconvert-image-tools' ),        __( 'Convert BMP images to PNG format.', 'relahconvert-image-tools' ) ),
                        array( 'tiff-to-jpg',       __( 'TIFF to JPG', 'relahconvert-image-tools' ),       __( 'Convert TIFF images to JPG format.', 'relahconvert-image-tools' ) ),
                        array( 'heic-to-jpg',       __( 'HEIC to JPG', 'relahconvert-image-tools' ),       __( 'Convert iPhone HEIC photos to JPG.', 'relahconvert-image-tools' ) ),
                        array( 'svg-to-png',        __( 'SVG to PNG', 'relahconvert-image-tools' ),        __( 'Convert SVG vector graphics to PNG.', 'relahconvert-image-tools' ) ),
                        array( 'svg-to-jpg',        __( 'SVG to JPG', 'relahconvert-image-tools' ),        __( 'Convert SVG vector graphics to JPG.', 'relahconvert-image-tools' ) ),
                        array( 'jpg-to-svg',        __( 'JPG to SVG', 'relahconvert-image-tools' ),        __( 'Convert JPG raster images to SVG.', 'relahconvert-image-tools' ) ),
                        array( 'image-to-ico',      __( 'Image to ICO', 'relahconvert-image-tools' ),      __( 'Convert images to ICO favicon format.', 'relahconvert-image-tools' ) ),
                        // PDF
                        array( 'jpg-to-pdf',        __( 'JPG to PDF', 'relahconvert-image-tools' ),        __( 'Combine JPG images into a single PDF document.', 'relahconvert-image-tools' ) ),
                        array( 'png-to-pdf',        __( 'PNG to PDF', 'relahconvert-image-tools' ),        __( 'Combine PNG images into a single PDF document.', 'relahconvert-image-tools' ) ),
                        array( 'pdf-to-png',        __( 'PDF to PNG', 'relahconvert-image-tools' ),        __( 'Extract every page of a PDF as a PNG image.', 'relahconvert-image-tools' ) ),
                    );
                    foreach ( $tools as $tool ) :
                    ?>
                    <tr>
                        <td><strong><?php echo esc_html( $tool[1] ); ?></strong></td>
                        <td><?php echo esc_html( $tool[2] ); ?></td>
                        <td><a href="<?php echo esc_url( RELAHCONVERT_BASE_URL . '/' . $tool[0] ); ?>" target="_blank" rel="noopener" class="button"><?php esc_html_e( 'Open', 'relahconvert-image-tools' ); ?></a></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div class="relahconvert-settings-card">
            <h2><?php esc_html_e( 'How It Works', 'relahconvert-image-tools' ); ?></h2>
            <ol>
                <li><?php esc_html_e( 'Go to your Media Library.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'Click any RelahConvert action button (Compress, Watermark, Resize, Remove BG, or More Tools) on an image.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'The tool opens with your image auto-loaded — process it with one click.', 'relahconvert-image-tools' ); ?></li>
                <li><?php esc_html_e( 'Click "Send to WordPress" to add the processed image directly to your Media Library.', 'relahconvert-image-tools' ); ?></li>
            </ol>
            <p><em><?php esc_html_e( '35 of the 38 tools process your image entirely in your browser — files never leave your device. Remove Background and Passport Photo send your image to the Remove.bg API. HTML to Image uses the ApiFlash API to screenshot a URL you provide.', 'relahconvert-image-tools' ); ?></em></p>
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
 * Generate a temporary upload token (valid for 30 minutes, multi-use).
 */
function relahconvert_generate_token() {
    $token = wp_generate_password( 32, false );
    set_transient( 'relahconvert_token_' . sanitize_key( $token ), get_current_user_id(), 30 * MINUTE_IN_SECONDS );
    return $token;
}

/**
 * Build tool URL with auth params for sending images back.
 */
function relahconvert_tool_url( $tool, $image_url ) {
    $allowed = relahconvert_allowed_tools();
    if ( ! in_array( $tool, $allowed, true ) ) {
        return '';
    }

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
        'permission_callback' => 'relahconvert_upload_permission_check',
    ) );
}
add_action( 'rest_api_init', 'relahconvert_register_rest_routes' );

/**
 * Permission callback for the upload endpoint.
 * Validates the token and sets the current user.
 */
function relahconvert_upload_permission_check( $request ) {
    $token = sanitize_text_field( $request->get_param( 'token' ) );
    if ( ! $token ) {
        return new WP_Error( 'missing_token', 'Authentication token is required.', array( 'status' => 401 ) );
    }

    $user_id = get_transient( 'relahconvert_token_' . sanitize_key( $token ) );
    if ( ! $user_id ) {
        return new WP_Error( 'invalid_token', 'Token is invalid or expired.', array( 'status' => 401 ) );
    }

    wp_set_current_user( $user_id );
    return current_user_can( 'upload_files' );
}

/**
 * Handle image upload from RelahConvert.
 */
function relahconvert_handle_upload( $request ) {
    // CORS headers for cross-origin upload from RelahConvert.
    header( 'Access-Control-Allow-Origin: https://relahconvert.com' );
    header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Content-Type' );

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

    return rest_ensure_response( array(
        'success'        => true,
        'attachment_id'  => $attachment_id,
        'url'            => wp_get_attachment_url( $attachment_id ),
    ) );
}

/**
 * Handle CORS preflight for the upload endpoint.
 */
function relahconvert_cors_preflight() {
    if ( ! isset( $_SERVER['REQUEST_METHOD'] ) || 'OPTIONS' !== $_SERVER['REQUEST_METHOD'] ) {
        return;
    }

    $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
    if ( strpos( $request_uri, 'relahconvert/v1/upload' ) !== false ) {
        header( 'Access-Control-Allow-Origin: https://relahconvert.com' );
        header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type' );
        header( 'Access-Control-Max-Age: 86400' );
        status_header( 204 );
        exit;
    }
}
add_action( 'init', 'relahconvert_cors_preflight' );
