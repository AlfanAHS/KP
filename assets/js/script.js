/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Global Scripts for All Pages

// Scroll to top button
$(document).ready(function(){
  // Initialize scroll to top
  $(window).scroll(function(){
    if ($(this).scrollTop() > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  $('.scroll-to-top').click(function(e){
    e.preventDefault();
    $('html, body').animate({scrollTop : 0}, 800);
    return false;
  });

  // Smooth scrolling for navigation links - DIPERBAIKI
  $('a[href^="#"]').on('click', function(e) {
    // Skip for elements with no-hash class or data-toggle attributes
    if ($(this).hasClass('no-hash') || $(this).data('toggle')) {
      return;
    }
    
    e.preventDefault();
    
    const target = this.hash;
    if (!target) return; // Skip if no hash
    
    const $target = $(target);
    if (!$target.length) return; // Skip if target not found
    
    // Periksa apakah target ada di DOM
    if ($target.length) {
      $('html, body').stop().animate({
        'scrollTop': $target.offset().top - 70
      }, 800, 'swing', function() {
        // Tambahkan hash ke URL setelah animasi selesai
        window.location.hash = target;
      });
    }
  });

  // Counter Animation (used in dashboard)
  function animateCounter($counter) {
    const target = +$counter.data('target');
    // Skip if no target
    if (!target || isNaN(target)) return;
    
    const speed = 2000; // Duration in ms
    const increment = target / (speed / 16); // 60fps
    
    let current = 0;
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        $counter.text(Math.floor(current));
        requestAnimationFrame(updateCounter);
      } else {
        $counter.text(target);
      }
    };
    
    updateCounter();
  }

  // Initialize counters when in viewport
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter($(entry.target));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $('.counter').each(function() {
    counterObserver.observe(this);
  });
});

// Fungsi untuk menampilkan notifikasi
function showNotification(type, message) {
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  
  // Tambahkan notifikasi di bagian atas halaman
  $('main').prepend(alertHtml);
  
  // Hilangkan notifikasi setelah 5 detik
  setTimeout(() => {
    $('.alert').alert('close');
  }, 5000);
}

// Fungsi untuk menampilkan pesan error
function showError(message) {
  showNotification('danger', `<strong>Error!</strong> ${message}`);
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(message) {
  showNotification('success', `<strong>Sukses!</strong> ${message}`);
}