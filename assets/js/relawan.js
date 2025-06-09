document.addEventListener('DOMContentLoaded', function() {
  // Di relawan.js - tambahkan ini di bagian DOMContentLoaded
  document.querySelectorAll('img').forEach(img => {
      // Cegah percobaan reload gambar yang gagal
      img.onerror = function() {
          this.src = 'img/placeholder.png'; // Ganti dengan placeholder default
          this.onerror = null; // Hentikan penanganan error selanjutnya
          console.log('Gambar tidak ditemukan: ' + this.alt);
      };
  });

  // Initialize file input labels
  document.querySelectorAll('.custom-file-input').forEach(function(input) {
    input.addEventListener('change', function() {
      let fileName = this.value.split('\\').pop();
      let label = this.nextElementSibling;
      label.classList.add("selected");
      label.textContent = fileName || label.getAttribute('data-default-text') || 'Choose file';
    });
  });

  
  // Form submission with Formspree
  const form = document.getElementById('volunteerForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate required fields
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          isValid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });
      
      if (!isValid) {
        // Focus on first invalid field
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        
        Swal.fire({
          title: 'Form Tidak Lengkap',
          text: 'Silakan lengkapi semua field yang wajib diisi.',
          icon: 'error',
          confirmButtonColor: '#28a745'
        });
        return;
      }
      
      // Disable submit button to prevent multiple submissions
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...';
      
      try {
        // Collect form data as URL-encoded
        const formData = new URLSearchParams();
        for (const pair of new FormData(form)) {
          formData.append(pair[0], pair[1]);
        }
        
        // Send form data to Formspree
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.ok) {
          // Show success message
          Swal.fire({
            title: 'Terima kasih!',
            text: 'Pendaftaran relawan Anda telah berhasil dikirim. Tim kami akan menghubungi Anda dalam 1-2 hari kerja.',
            icon: 'success',
            confirmButtonColor: '#28a745'
          }).then(() => {
            // Reset form
            form.reset();
          });
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Terjadi Kesalahan',
          text: 'Gagal mengirim formulir. Silakan coba lagi atau hubungi kami langsung.',
          icon: 'error',
          confirmButtonColor: '#28a745'
        });
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Pendaftaran';
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          location.hash = targetId;
        }
      }
    });
  });

  // FAQ accordion toggle
  const faqButtons = document.querySelectorAll('.btn-link[data-toggle="collapse"]');
  faqButtons.forEach(button => {
    button.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      const targetCollapse = document.querySelector(target);
      
      // Toggle active class
      if (targetCollapse.classList.contains('show')) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
    });
  });

  // Add loading="lazy" to all images that don't have it yet
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  // Set default alt text for images if missing
  document.querySelectorAll('img:not([alt])').forEach(img => {
    img.setAttribute('alt', 'Panti Asuhan Kasih Bunda');
  });
});