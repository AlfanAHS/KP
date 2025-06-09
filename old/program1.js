document.addEventListener('DOMContentLoaded', function() {
  try {
    // ==================== LIGHTBOX INITIALIZATION ====================
    if (typeof lightbox !== 'undefined') {
      lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'albumLabel': 'Gambar %1 dari %2',
        'disableScrolling': true,
        'positionFromTop': 100
      });
    }

    // ==================== TAB PROGRAM HANDLING ====================
    // Daftar ID tab program yang tidak ingin di-scroll
    const programTabIds = ['#rumah-pintar', '#daycare', '#kesehatan', '#keterampilan'];

    // Fungsi untuk menangani klik tab program (tanpa scroll)
    const handleProgramTabClick = function(event) {
      const targetId = this.getAttribute('href');
      
      // Hanya tangani jika ini adalah tab program
      if (programTabIds.includes(targetId)) {
        event.preventDefault();
        
        // Aktifkan tab menggunakan Bootstrap 4
        $(this).tab('show');
        
        // Update URL tanpa menyebabkan scroll
        history.replaceState(null, null, targetId);
      }
    };

    // Fungsi untuk tombol detail program
    const handleDetailButtonClick = function(event) {
      const targetId = this.getAttribute('href');
      
      // Hanya tangani jika ini adalah tab program
      if (programTabIds.includes(targetId)) {
        event.preventDefault();
        
        // Aktifkan tab terkait menggunakan Bootstrap 4
        $(`#programTabs a[href="${targetId}"]`).tab('show');
        
        // Update URL tanpa menyebabkan scroll
        history.replaceState(null, null, targetId);
      }
    };

    // Pasang event listener untuk tab program (Bootstrap 4)
    $('#programTabs a[data-toggle="tab"]').on('click', handleProgramTabClick);

    // Pasang event listener untuk tombol detail program
    document.querySelectorAll('.program-card a[href^="#"]').forEach(button => {
      button.addEventListener('click', handleDetailButtonClick);
    });

    // ==================== SMOOTH SCROLL FOR OTHER LINKS ====================
    const handleSmoothScroll = function(event) {
      const targetId = this.getAttribute('href');
      
      // Abaikan jika ini adalah tab program
      if (!programTabIds.includes(targetId) && targetId.startsWith('#')) {
        event.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.navbar').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL tanpa lompatan
          history.pushState(null, null, targetId);
        }
      }
    };

    // Pasang event listener untuk semua anchor link kecuali tab program
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      if (!programTabIds.some(id => anchor.getAttribute('href') === id)) {
        anchor.addEventListener('click', handleSmoothScroll);
      }
    });

    // ==================== NAVBAR SCROLL EFFECT ====================
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    const handleScroll = function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop) {
        // Scrolling down
        navbar.classList.remove('navbar-scrolled');
      } else {
        // Scrolling up
        if (scrollTop > 100) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    // Throttle scroll event
    let isScrolling;
    window.addEventListener('scroll', function() {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(handleScroll, 50);
    }, false);

    // Initialize scroll state
    handleScroll();

  } catch (error) {
    console.error('Error in program.js:', error);
  }
});