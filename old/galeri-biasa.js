$(document).ready(function() {
    // Inisialisasi lightbox
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'showImageNumberLabel': false,
        'positionFromTop': 100
    });

    // Filter galeri
    $('.btn-group-toggle label').click(function() {
        var filter = $(this).find('input').attr('id').replace('filter-', '');
        
        if (filter === 'all') {
            $('.foto-item, .video-item, #slideshow-section').show();
        } else if (filter === 'foto') {
            $('.foto-item').show();
            $('.video-item').hide();
            $('#slideshow-section').hide();
        } else if (filter === 'video') {
            $('.video-item').show();
            $('.foto-item').hide();
            $('#slideshow-section').hide();
        } else if (filter === 'slideshow') {
            $('#slideshow-section').show();
            $('.foto-item, .video-item').hide();
        } else if (filter === 'kegiatan') {
            $('.foto-item.kegiatan, .video-item').show();
            $('.foto-item:not(.kegiatan)').hide();
            $('#slideshow-section').hide();
        } else if (filter === 'donatur') {
            $('.foto-item.donatur').show();
            $('.foto-item:not(.donatur), .video-item').hide();
            $('#slideshow-section').hide();
        }
    });

    // Animasi counter
    $('.counter').each(function() {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 2000,
            easing: 'swing',
            step: function(now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
});