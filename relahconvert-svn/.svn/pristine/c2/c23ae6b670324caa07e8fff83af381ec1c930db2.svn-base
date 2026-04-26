/**
 * RelahConvert Image Tools — Admin JS
 *
 * Adds RelahConvert toolbar button to the Block Editor image block.
 */
(function ($) {
    'use strict';

    if (typeof relahconvert === 'undefined') {
        return;
    }

    var baseUrl = relahconvert.baseUrl;
    var wpsite = relahconvert.wpsite;
    var token = relahconvert.token;

    function buildToolUrl(tool, imageUrl) {
        var params = '?url=' + encodeURIComponent(imageUrl);
        if (wpsite) params += '&wpsite=' + encodeURIComponent(wpsite);
        if (token) params += '&token=' + encodeURIComponent(token);
        return baseUrl + '/' + tool + params;
    }

    /**
     * Inject RelahConvert buttons into the media modal attachment details.
     */
    if (typeof wp !== 'undefined' && wp.media) {
        var originalAttachmentDetailsTwoColumn = wp.media.view.Attachment.Details.TwoColumn;
        if (originalAttachmentDetailsTwoColumn) {
            wp.media.view.Attachment.Details.TwoColumn = originalAttachmentDetailsTwoColumn.extend({
                render: function () {
                    originalAttachmentDetailsTwoColumn.prototype.render.apply(this, arguments);

                    var model = this.model;
                    if (!model || model.get('type') !== 'image') {
                        return this;
                    }

                    var mime = model.get('mime');
                    var imageUrl = model.get('url');
                    var convertTool = getConvertTool(mime);
                    var $details = this.$el.find('.attachment-info');

                    if ($details.length && !$details.find('.relahconvert-media-buttons').length) {
                        var html = '<div class="relahconvert-media-buttons" style="margin-top:12px;padding-top:12px;border-top:1px solid #dcdcde;">';
                        html += '<strong style="display:block;margin-bottom:6px;font-size:12px;color:#787c82;">RelahConvert</strong>';
                        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
                        html += '<a href="' + buildToolUrl('compress', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Compress</a>';
                        html += '<a href="' + buildToolUrl('watermark', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Watermark</a>';
                        html += '<a href="' + buildToolUrl('resize', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Resize</a>';
                        html += '<a href="' + buildToolUrl('remove-background', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Remove BG</a>';

                        // More Tools dropdown — covers every tool not already on the main button row
                        var moreTools = [
                            // Smart suggestion: convert to the most common target for this file type
                            { tool: convertTool || 'jpg-to-png', label: 'Convert format' },
                            // Edit
                            { tool: 'crop', label: 'Crop' },
                            { tool: 'rotate', label: 'Rotate' },
                            { tool: 'flip', label: 'Flip' },
                            { tool: 'grayscale', label: 'Grayscale' },
                            { tool: 'round-corners', label: 'Round Corners' },
                            // Optimization
                            { tool: 'resize-in-kb', label: 'Resize to KB' },
                            // Privacy / effects
                            { tool: 'blur-face', label: 'Blur Face' },
                            { tool: 'pixelate-image', label: 'Pixelate' },
                            // Layout
                            { tool: 'merge-images', label: 'Merge Images' },
                            { tool: 'image-splitter', label: 'Image Splitter' },
                            // Create
                            { tool: 'meme-generator', label: 'Meme Generator' },
                            { tool: 'passport-photo', label: 'Passport Photo' },
                            { tool: 'html-to-image', label: 'HTML to Image' },
                            // Format conversions — common
                            { tool: 'jpg-to-png', label: 'JPG to PNG' },
                            { tool: 'png-to-jpg', label: 'PNG to JPG' },
                            { tool: 'jpg-to-webp', label: 'JPG to WebP' },
                            { tool: 'webp-to-jpg', label: 'WebP to JPG' },
                            { tool: 'png-to-webp', label: 'PNG to WebP' },
                            { tool: 'webp-to-png', label: 'WebP to PNG' },
                            { tool: 'heic-to-jpg', label: 'HEIC to JPG' },
                            { tool: 'gif-to-jpg', label: 'GIF to JPG' },
                            { tool: 'gif-to-png', label: 'GIF to PNG' },
                            { tool: 'jpg-to-gif', label: 'JPG to GIF' },
                            { tool: 'png-to-gif', label: 'PNG to GIF' },
                            { tool: 'bmp-to-jpg', label: 'BMP to JPG' },
                            { tool: 'bmp-to-png', label: 'BMP to PNG' },
                            { tool: 'tiff-to-jpg', label: 'TIFF to JPG' },
                            { tool: 'svg-to-png', label: 'SVG to PNG' },
                            { tool: 'svg-to-jpg', label: 'SVG to JPG' },
                            { tool: 'jpg-to-svg', label: 'JPG to SVG' },
                            { tool: 'image-to-ico', label: 'Image to ICO' },
                            // PDF
                            { tool: 'jpg-to-pdf', label: 'JPG to PDF' },
                            { tool: 'png-to-pdf', label: 'PNG to PDF' },
                            { tool: 'pdf-to-png', label: 'PDF to PNG' }
                        ];
                        html += '<div style="position:relative;display:inline-block;">';
                        html += '<button type="button" class="button button-small relahconvert-more-toggle" style="cursor:pointer;">More &#9660;</button>';
                        html += '<div class="relahconvert-more-menu" style="display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #dcdcde;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.12);z-index:100;min-width:150px;margin-top:4px;max-height:300px;overflow-y:auto;">';
                        for (var i = 0; i < moreTools.length; i++) {
                            html += '<a href="' + buildToolUrl(moreTools[i].tool, imageUrl) + '" target="_blank" rel="noopener" style="display:block;padding:7px 12px;color:#1d2327;text-decoration:none;font-size:12px;border-bottom:1px solid #f0f0f1;" onmouseover="this.style.background=\'#f0f6fc\'" onmouseout="this.style.background=\'#fff\'">' + moreTools[i].label + '</a>';
                        }
                        html += '</div></div>';

                        html += '</div></div>';

                        $details.append(html);

                        // Toggle dropdown on click
                        $details.find('.relahconvert-more-toggle').on('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var menu = $(this).next('.relahconvert-more-menu');
                            menu.toggle();
                        });

                        // Close dropdown when clicking outside
                        $(document).on('click.relahconvertMore', function () {
                            $details.find('.relahconvert-more-menu').hide();
                        });
                    }

                    return this;
                }
            });
        }
    }

    function getConvertTool(mime) {
        var map = {
            'image/jpeg': 'jpg-to-png',
            'image/png': 'png-to-jpg',
            'image/webp': 'webp-to-jpg',
            'image/gif': 'gif-to-jpg',
            'image/bmp': 'bmp-to-jpg',
            'image/tiff': 'tiff-to-jpg'
        };
        return map[mime] || '';
    }

})(jQuery);
