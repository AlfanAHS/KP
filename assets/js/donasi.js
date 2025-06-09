console.log('donasi.js aktif');


$(document).ready(function() {
  // Initialize chart
  initDonationChart();
  
  // Counter animation
  animateCounters();
  
  // Program card click handler
  $('.program-card a[data-program]').click(function(e) {
    e.preventDefault();
    const program = $(this).data('program');
    const amount = $(this).data('amount');
    
    // Scroll to donation section
    $('html, body').animate({
      scrollTop: $('#donasi-sekarang').offset().top - 70
    }, 500);
  });
  
  // Initialize form with default values
  // updateDonationSummary();
});


function initDonationChart() {
  const ctx = document.getElementById('donationChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Program Anak', 'Pendidikan', 'Kesehatan', 'Operasional', 'Dana Darurat'],
      datasets: [{
        data: [45, 30, 15, 8, 2],
        backgroundColor: [
          '#28a745',
          '#007bff',
          '#ffc107',
          '#6c757d',
          '#dc3545'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right'
      },
      cutoutPercentage: 60
    }
  });
}

// Script untuk toggle note
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.querySelector('.toggle-note-btn');
  const noteContent = document.querySelector('.note-content');
  
  toggleBtn.addEventListener('click', function() {
    // Toggle class active pada tombol
    this.classList.toggle('active');
    
    // Toggle class show pada konten
    noteContent.classList.toggle('show');
    noteContent.classList.toggle('d-none');
    
    // Ganti teks tombol
    if (noteContent.classList.contains('show')) {
      this.innerHTML = '<i class="fas fa-chevron-up"></i> Sembunyikan Catatan';
    } else {
      this.innerHTML = '<i class="fas fa-chevron-down"></i> Tampilkan Catatan';
    }
  });
});



function animateCounters() {
  $('.counter').each(function() {
    const $this = $(this);
    const target = $this.data('target');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const animate = () => {
      current += increment;
      if (current < target) {
        $this.text(Math.floor(current));
        requestAnimationFrame(animate);
      } else {
        $this.text(target + '+');
      }
    };
    
    animate();
  });
}

// function updateDonationSummary() {
//   // Fungsi ini belum diimplementasi, tambahkan logika sesuai kebutuhan
//   console.log('updateDonationSummary dipanggil');
// }


function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Function to handle Google Form submission (if needed)
function handleGoogleFormSubmission() {
  // This would be called from the Google Form's confirmation page
  // You can add any post-submission actions here
  console.log('Form submitted successfully');
}