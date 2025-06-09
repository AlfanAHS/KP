document.addEventListener('DOMContentLoaded', function() {
  // Initialize carousels
  const initCarousels = () => {
    const carouselOptions = {
      historyCarousel: {
        interval: 5000,
        pause: 'hover',
        wrap: true,
        touch: true
      },
      testimoniCarousel: {
        interval: 6000,
        touch: true,
        wrap: true
      }
    };

    Object.keys(carouselOptions).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        new bootstrap.Carousel(element, carouselOptions[id]);
      }
    });
  };
  

  // Handle contact form submission with Formspree
  const handleContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Tampilkan loading state
      submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Mengirim...
      `;
      submitButton.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          form.reset();
          showAlert('success', 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.');
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Gagal mengirim pesan');
        }
      } catch (error) {
        console.error('Error:', error);
        showAlert('danger', `Maaf, terjadi kesalahan: ${error.message}`);
      } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }
    });
  };

  // Show alert message
  const showAlert = (type, message) => {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertId = 'alert-' + Date.now();
    const alertDiv = document.createElement('div');
    
    alertDiv.id = alertId;
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
        <div>${message}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      const alertElement = document.getElementById(alertId);
      if (alertElement) {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
      }
    }, 5000);
  };

  // Smooth scrolling for anchor links
  const initSmoothScroll = () => {
    document.querySelectorAll('.scroll-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const offset = 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL tanpa reload
          history.pushState(null, null, targetId);
        }
      });
    });
  };

  // Initialize all components
  initCarousels();
  handleContactForm();
  initSmoothScroll();
  
});