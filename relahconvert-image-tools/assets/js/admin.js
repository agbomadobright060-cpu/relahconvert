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
                        html += '<a href="' + baseUrl + '/watermark" target="_blank" rel="noopener" class="button button-small">Watermark</a>';
                        html += '<a href="' + buildToolUrl('resize', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Resize</a>';
                        html += '<a href="' + buildToolUrl('remove-background', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Remove BG</a>';

                        // More Tools dropdown
                        var moreTools = [
                            { tool: convertTool || 'jpg-to-png', label: 'Convert' },
                            { tool: 'crop', label: 'Crop' },
                            { tool: 'rotate', label: 'Rotate' },
                            { tool: 'flip', label: 'Flip' },
                            { tool: 'watermark', label: 'Watermark' },
                            { tool: 'grayscale', label: 'Grayscale' },
                            { tool: 'round-corners', label: 'Round Corners' },
                            { tool: 'jpg-to-pdf', label: 'Image to PDF' },
                            { tool: 'meme-generator', label: 'Meme Generator' },
                            { tool: 'merge-images', label: 'Merge Images' },
                            { tool: 'passport-photo', label: 'Passport Photo' }
                        ];
                        html += '<div style="position:relative;display:inline-block;">';
                        html += '<button type="button" class="button button-small relahconvert-more-toggle" style="cursor:pointer;">More &#9660;</button>';
                        html += '<div class="relahconvert-more-menu" style="display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #dcdcde;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.12);z-index:100;min-width:150px;margin-top:4px;max-height:300px;overflow-y:auto;">';
                        for (var i = 0; i < moreTools.length; i++) {
                            html += '<a href="' + baseUrl + '/' + moreTools[i].tool + '" target="_blank" rel="noopener" style="display:block;padding:7px 12px;color:#1d2327;text-decoration:none;font-size:12px;border-bottom:1px solid #f0f0f1;" onmouseover="this.style.background=\'#f0f6fc\'" onmouseout="this.style.background=\'#fff\'">' + moreTools[i].label + '</a>';
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
