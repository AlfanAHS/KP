// JavaScript untuk Halaman Detail Berita
$(document).ready(function() {
  // Inisialisasi tooltip
  $('[data-toggle="tooltip"]').tooltip();
  
  // Inisialisasi lightbox untuk galeri
  $(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox({
      alwaysShowClose: true,
      showArrows: true,
      wrapping: false
    });
  });
  
  // Fungsi untuk toggle archive
  function toggleArchive(year) {
    const archiveId = 'archive-' + year;
    const icon = $('#' + archiveId).prev().find('i');
    
    $('#' + archiveId).slideToggle(200, function() {
      if ($(this).is(':visible')) {
        icon.removeClass('fa-folder').addClass('fa-folder-open');
      } else {
        icon.removeClass('fa-folder-open').addClass('fa-folder');
      }
    });
  }
  
  // Event listener untuk archive
  $('.archive-year').click(function() {
    const year = $(this).text().trim().split(' ')[0];
    toggleArchive(year);
  });
  
  // Show current year archive by default
  $('#archive-2025').show();
  $('#archive-2025').prev().find('i').removeClass('fa-folder').addClass('fa-folder-open');
  
  // Share buttons functionality
  $('.share-buttons .fa-facebook-f').click(function(e) {
    e.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, 'facebook-share-dialog', 'width=626,height=436');
  });
  
  $('.share-buttons .fa-twitter').click(function(e) {
    e.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, 'twitter-share-dialog', 'width=626,height=436');
  });
  
  $('.share-buttons .fa-whatsapp').click(function(e) {
    e.preventDefault();
    const text = encodeURIComponent(`${document.title} - ${window.location.href}`);
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.open(`whatsapp://send?text=${text}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
    }
  });
  
  // Smooth scroll untuk anchor links
  $('a[href^="#"]').on('click', function(event) {
    event.preventDefault();
    $('html, body').animate({
      scrollTop: $($(this).attr('href')).offset().top - 20
    }, 500);
  });
});