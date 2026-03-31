=== RelahConvert Image Tools ===
Contributors: relahconvert
Tags: image compression, image converter, resize image, remove background, image optimization
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Free image tools powered by RelahConvert — compress, convert, resize, watermark, and remove backgrounds from your WordPress media library.

== Description ==

**RelahConvert Image Tools** adds quick-access buttons to your WordPress media library for the most common image operations:

* **Compress** — Reduce file size of JPG, PNG, and WebP images while maintaining quality.
* **Watermark** — Add text or image watermarks to your photos.
* **Resize** — Resize images by pixels or percentage.
* **Remove Background** — Remove image backgrounds using AI.
* **More Tools** — Access 30+ additional tools including Convert, Crop, Rotate, Flip, Grayscale, Meme Generator, and more.

= How It Works =

1. Go to your WordPress Media Library.
2. Click any RelahConvert action button on an image (Compress, Watermark, Resize, Remove BG, or More Tools).
3. The tool opens on RelahConvert.com with your image auto-loaded.
4. Process your image with one click.
5. Click "Send to WordPress" to add the processed image directly back to your Media Library.

= Third-Party Service: RelahConvert.com =

This plugin relies on [RelahConvert.com](https://relahconvert.com) to provide image processing tools. When you click a tool button, your browser opens RelahConvert.com where the processing takes place.

* **Most tools** (compress, resize, convert, crop, rotate, flip, watermark, grayscale) process images **entirely in your browser** using JavaScript. Your files never leave your device for these tools.
* **Some tools** (Remove Background) use server-side AI processing.
* **Send to WordPress** feature sends the processed image from your browser directly back to your WordPress site via a secure REST API endpoint.

By using this plugin, you agree to [RelahConvert's Terms of Service](https://relahconvert.com/terms) and [Privacy Policy](https://relahconvert.com/privacy).

= CORS Configuration =

On activation, this plugin adds a CORS header to your `wp-content/uploads/.htaccess` file to allow RelahConvert.com to load your images for processing:

`Header set Access-Control-Allow-Origin "https://relahconvert.com"`

This rule is automatically removed when the plugin is deactivated.

= Features =

* Action buttons in Media Library list view and grid view
* "More Tools" dropdown with 14+ image tools
* Auto-loads your image into the selected tool
* "Send to WordPress" button sends processed images directly back to your Media Library
* Smart format detection — suggests the right conversion tool based on file type
* Settings page with quick links to all available tools
* Lightweight — no bloat, minimal database usage (temporary tokens only)
* Works with the Classic Editor and Block Editor

= Available Tools =

* Compress Image
* Resize Image
* Remove Background
* Watermark Image
* Convert Formats (JPG, PNG, WebP, GIF, BMP, TIFF, SVG)
* Crop Image
* Rotate Image
* Flip Image
* Grayscale (Black & White)
* Round Corners
* Image to PDF
* Meme Generator
* Merge Images
* Passport Photo
* And more at [RelahConvert.com](https://relahconvert.com)

== Installation ==

1. Upload the `relahconvert-image-tools` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings > RelahConvert** to see all available tools.
4. Open your **Media Library** to start using the action buttons.

== Frequently Asked Questions ==

= Does this plugin upload my images to a server? =

For most tools (compress, resize, convert, crop, etc.), all processing happens in your browser on RelahConvert.com. Your files never leave your device. Some AI-powered tools like Remove Background may use server-side processing.

= Is it free? =

Yes. RelahConvert tools are completely free with no limits, no watermarks, and no account required.

= Do I need an API key? =

No. The plugin uses temporary authentication tokens to securely send processed images back to your WordPress site. No external API keys are needed.

= Does it work with the Block Editor (Gutenberg)? =

Yes. The plugin adds action buttons in the media library modal used by both the Classic Editor and Block Editor.

= What does "Send to WordPress" do? =

After processing an image on RelahConvert.com, you can click "Send to WordPress" to upload the processed image directly to your WordPress Media Library without manually downloading and re-uploading.

= Does this plugin modify my .htaccess file? =

Yes. On activation, the plugin adds a CORS header to `wp-content/uploads/.htaccess` to allow RelahConvert.com to load your images. This is removed on deactivation.

== Screenshots ==

1. Media Library grid view with RelahConvert buttons and More Tools dropdown.
2. Image auto-loaded on RelahConvert with Send to WordPress button.
3. Settings page with all available tools.

== Changelog ==

= 1.0.0 =
* Initial release.
* Compress, Watermark, Resize, and Remove Background buttons in Media Library.
* More Tools dropdown with 10+ additional tools.
* Auto-load images from WordPress into RelahConvert tools.
* Send processed images directly back to WordPress Media Library.
* Smart format detection for conversion tools.
* Settings page with tool overview.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
