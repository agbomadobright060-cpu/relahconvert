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
                        if (convertTool) {
                            html += '<a href="' + buildToolUrl(convertTool, imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Convert</a>';
                        }
                        html += '<a href="' + buildToolUrl('resize', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Resize</a>';
                        html += '<a href="' + buildToolUrl('remove-background', imageUrl) + '" target="_blank" rel="noopener" class="button button-small">Remove BG</a>';
                        html += '</div></div>';

                        $details.append(html);
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
