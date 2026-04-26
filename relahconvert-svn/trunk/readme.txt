=== RelahConvert Image Tools ===
Contributors: brightagbomado
Tags: media library, meme generator, passport photo, image editor, image tools
Requires at least: 5.0
Tested up to: 6.9
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

38 image tools in your Media Library — meme generator, passport photo, blur face, watermark, format conversion, and more. Round-trip auto-upload.

== Description ==

**RelahConvert Image Tools** is a Media Library extension that integrates 38 image tools under a single plugin. Click a tool button on any attachment, process the image on RelahConvert.com, and the result is sent back to your Media Library automatically.

Individual tools in this plugin's toolkit — watermarking, compression, meme generation, passport photos — also exist as standalone plugins in the directory. What this plugin offers is the **combination and round-trip workflow**:

* **38 tools in one plugin** instead of installing 10+ separate single-purpose plugins
* **35 of the 38 tools run entirely in the user's browser** using JavaScript and Canvas — no server roundtrip, no API calls, no third-party upload for those 35 tools
* **"Send to WordPress"** — processed image is POSTed back to the Media Library via a token-authenticated REST endpoint, no manual download / re-upload
* **Signup is optional** — the 38 tools work without an account. Signing in (Google or email) is only needed if the user wants to use Save to Account (stores processed files on Supabase Storage) or sync preferences across devices.
* **No API keys required** — all third-party API calls (Remove.bg, ApiFlash) are proxied through RelahConvert
* **No image quotas, no paid tier, no watermark on output**

= The 38 tools =

* **Create** — Meme Generator, Passport Photo (170+ country sizes), Watermark, Round Corners, HTML to Image (screenshot a URL)
* **Layout** — Image Splitter (grid), Merge Images, Crop, Rotate, Flip
* **Privacy / effects** — Blur Face (local face detection), Pixelate, Grayscale
* **Format conversion** — 20+ conversions: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, HEIC, ICO in various combinations
* **Optimization** — Compress, Resize, Resize to exact KB size
* **AI** — Remove Background (uses Remove.bg API)
* **PDF** — JPG to PDF, PNG to PDF, PDF to PNG (extract each page as an image)

= Where Processing Happens =

**35 of the 38 tools run entirely in the user's browser** using JavaScript and the Canvas API. Your image never leaves the device for these tools:

compress, resize, resize-in-kb, crop, rotate, flip, grayscale, watermark, round-corners, image-to-ico, merge-images, image-splitter, pixelate, blur-face (face detection runs locally), meme-generator, and 20+ format conversions (JPG, PNG, WebP, GIF, BMP, TIFF, SVG, HEIC, PDF in both directions).

**3 tools use external services** because the work can't be done in the browser:

* **Remove Background** — sends your image to the Remove.bg API for AI processing
* **Passport Photo** — uses the same Remove.bg API for its background-removal step
* **HTML to Image** — takes a URL you type in (not one of your images) and uses the ApiFlash API to return a screenshot

**Optional, only if the user signs in:** Save to Account uploads the processed file to Supabase Storage so it can be re-downloaded later. Sign-in is not required to use any tool.

= Seamless WordPress Integration =

Click a tool button in the Media Library → image opens on RelahConvert.com with your image auto-loaded → process it → click "Send to WordPress" → processed image lands back in your Media Library. No manual download and re-upload.

= How It Works =

1. Go to your WordPress Media Library.
2. Click any RelahConvert action button on an image (Compress, Watermark, Resize, Remove BG, or More Tools).
3. The tool opens on RelahConvert.com with your image auto-loaded.
4. Process your image with one click.
5. Click "Send to WordPress" to add the processed image directly back to your Media Library.

= Third-Party Services =

This plugin loads the processing UI from [RelahConvert.com](https://relahconvert.com). When you click a tool button in the Media Library, your browser opens RelahConvert.com with your image auto-loaded.

What happens there depends on which tool you choose:

* **Client-side tools (35 tools)** — Processing runs in your browser via JavaScript and Canvas. No network roundtrip for the image.
* **Remove Background / Passport Photo** — Your image is sent to the [Remove.bg API](https://www.remove.bg/) (a third-party service) for AI background removal. Subject to [Remove.bg Terms](https://www.remove.bg/terms) and [Privacy](https://www.remove.bg/privacy).
* **HTML to Image** — The URL you enter (not your images) is sent to the [ApiFlash](https://apiflash.com/) screenshot service. Subject to [ApiFlash Terms](https://apiflash.com/terms) and [Privacy](https://apiflash.com/privacy).
* **Meme Generator** — Fetches the public meme template catalog from the [Imgflip API](https://imgflip.com/api) (no image upload).
* **Save to Account (optional)** — Only if the user signs in with Google or email. Files are stored on Supabase Storage. [Supabase Terms](https://supabase.com/terms) and [Privacy](https://supabase.com/privacy).
* **Send to WordPress** — Sends the processed image from your browser back to your WordPress site via a secure REST API endpoint using a short-lived token.

By using this plugin, you agree to [RelahConvert's Terms of Service](https://relahconvert.com/terms) and [Privacy Policy](https://relahconvert.com/privacy), and to the terms of any third-party service you choose to use through it.

= CORS Configuration =

On activation, this plugin adds a CORS header to your `wp-content/uploads/.htaccess` file to allow RelahConvert.com to load your images for processing:

`Header set Access-Control-Allow-Origin "https://relahconvert.com"`

This rule is automatically removed when the plugin is deactivated.

= Features =

* Action buttons in Media Library list view and grid view
* "More Tools" dropdown with 38 image tools
* Auto-loads your image into the selected tool
* "Send to WordPress" button sends processed images directly back to your Media Library
* Smart format detection — suggests the right conversion tool based on file type
* Settings page with quick links to all available tools
* Lightweight — no bloat, minimal database usage (temporary tokens only)
* Works with the Classic Editor and Block Editor

== Installation ==

1. Upload the `relahconvert-image-tools` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings > RelahConvert** to see all available tools.
4. Open your **Media Library** to start using the action buttons.

== Frequently Asked Questions ==

= Does this plugin upload my images to a server? =

For 35 of the 38 tools (compress, resize, crop, rotate, flip, watermark, format conversions, merge, splitter, pixelate, blur face, meme generator, round corners, etc.), all processing happens in your browser. Your files never leave your device.

For **Remove Background** and **Passport Photo**, your image is uploaded to the Remove.bg API for AI processing. For **HTML to Image**, a URL you type (not one of your images) is sent to ApiFlash to be screenshotted. These three tools require a server roundtrip because the work can't be done client-side.

If you choose to sign in and use Save to Account, the processed file is stored on Supabase Storage.

= Is it free? =

Yes. All tools are free to use. No account is required for processing. No watermark is added to output. Optional sign-in unlocks cloud-saved files and preference sync across devices.

= Do I need an API key? =

No. You do not need to provide any API keys. The plugin uses short-lived authentication tokens to send processed images back to your WordPress site, and all third-party API calls (Remove.bg, ApiFlash) are proxied through RelahConvert — you never see or manage those keys.

= Does it work with the Block Editor (Gutenberg)? =

Yes. The plugin adds action buttons in the media library modal used by both the Classic Editor and Block Editor.

= What does "Send to WordPress" do? =

After processing an image on RelahConvert.com, you can click "Send to WordPress" to upload the processed image directly to your WordPress Media Library without manually downloading and re-uploading.

= Does this plugin modify my .htaccess file? =

Yes. On activation, the plugin adds a CORS header to `wp-content/uploads/.htaccess` to allow RelahConvert.com to load your images. This is removed on deactivation.

== Screenshots ==

1. RelahConvert tool buttons on a Media Library attachment — Compress, Watermark, Resize, Remove BG, and the "More" dropdown showing all 38 tools.
2. A tool in action on RelahConvert.com — image processed with one click and ready to "Send to WordPress" back to your Media Library.
3. Media Library after processing — multiple versions of an image created with different tools, all sent back automatically.

== Changelog ==

= 1.0.0 =
* Initial release.
* 38 image tools integrated in the Media Library.
* Compress, Watermark, Resize, and Remove Background buttons.
* "More Tools" dropdown with 34 additional tools.
* Auto-load images from WordPress into RelahConvert tools.
* "Send to WordPress" posts processed images back to the Media Library via a token-authenticated REST endpoint.
* Smart format detection for conversion tools.
* Settings page with tool overview.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
