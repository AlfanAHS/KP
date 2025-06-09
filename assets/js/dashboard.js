/**
 * DASHBOARD PANTI ASUHAN - Versi Final Production
 * - Menampilkan kegiatan terbaru berdasarkan tanggal
 * - Label kategori ramah pengguna
 * - Penanganan error dan validasi data
 */

$(document).ready(function() {
  const CONFIG = {
    paths: {
      images: '/img/',
      data: '/assets/data/'
    }
  };

  initCarousel();
  loadAllData();
  setupEventHandlers();

  async function loadAllData() {
    try {
      showLoading(true);
      const [activities] = await Promise.all([
        safeLoadJSON(`${CONFIG.paths.data}berita.json`)
      ]);
      renderActivities(activities || []);
    } catch (error) {
      console.error('Gagal memuat data:', error);
      showError();
      renderDefaultData();
    } finally {
      showLoading(false);
    }
  }

  function renderActivities(activities, limit = 3) {
    const container = $('#kegiatanContainer');
    container.empty();

    if (!activities.length) {
      container.html(`<div class="col-12 text-center py-4">
        <div class="alert alert-info">Tidak ada kegiatan terbaru</div>
      </div>`);
      return;
    }

    const sortedActivities = [...activities].filter(a => a.title && a.date).sort((a, b) => new Date(b.date) - new Date(a.date));
    const terbaru = sortedActivities.slice(0, limit);

    const categoryLabels = {
      activity: 'Kegiatan',
      donation: 'Donasi',
      education: 'Edukasi',
      visit: 'Kunjungan',
      religion: 'Keagamaan',
      competition: 'Lomba',
      event: 'Acara',
      environment: 'Lingkungan',
      health: 'Kesehatan'
    };

    terbaru.forEach(activity => {
      const label = categoryLabels[activity.category] || 'Lainnya';

      container.append(`
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="card h-100 shadow-sm kegiatan-card">
            <img src="${activity.image || 'img/default.jpg'}" 
                 class="card-img-top" 
                 alt="${activity.title}" 
                 loading="lazy">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted">
                  <i class="far fa-calendar-alt mr-1"></i>
                  ${formatDate(activity.date)}
                </small>
                <span class="badge bg-success text-white">${label}</span>
              </div>
              <h3 class="h5">${activity.title}</h3>
              <p class="card-text">${truncateText(activity.excerpt, 100)}</p>
            </div>
            <div class="card-footer bg-transparent">
              <a href="${activity.url}" class="btn btn-sm btn-outline-success">
                Lihat Detail
              </a>
            </div>
          </div>
        </div>
      `);
    });
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch {
      return dateString || 'Tanggal tidak tersedia';
    }
  }

  function truncateText(text, maxLength) {
    return text?.length > maxLength ? 
      text.substring(0, maxLength) + '...' : 
      text || 'Deskripsi tidak tersedia';
  }

  async function safeLoadJSON(url) {
    try {
      const response = await $.ajax({
        url: url,
        dataType: 'json',
        cache: false,
        timeout: 3000
      });
      return response || null;
    } catch {
      return null;
    }
  }

  function initCarousel() {
    const $carousel = $('#mainCarousel');

    if ($carousel.data('bs.carousel')) return;

    $carousel.carousel({
      interval: 5000,
      pause: 'hover',
      wrap: true,
      touch: true
    }).on('slid.bs.carousel', function() {
      const total = $('.carousel-item', this).length;
      const current = $('.carousel-item.active', this).index() + 1;
      $('.carousel-counter').text(`${current}/${total}`);
    });

    $('.carousel-control-prev, .carousel-control-next').click(function(e) {
      e.preventDefault();
      $carousel.carousel($(this).data('slide'));
    });
  }

  function showLoading(show) {
    $('#loadingIndicator').toggleClass('d-none', !show);
  }

  function showError() {
    $('#kegiatanContainer').html(`
      <div class="col-12 alert alert-danger">
        <i class="fas fa-exclamation-circle mr-2"></i>
        Gagal memuat data. 
        <button id="retryBtn" class="btn btn-sm btn-link p-0">Coba lagi</button>
      </div>
    `);
  }

  function renderDefaultData() {
    renderActivities([]);
  }

  function setupEventHandlers() {
    $(document).on('click', '#retryBtn', loadAllData);

    $(document).on('error', 'img', function() {
      const $img = $(this);
      if (!$img.attr('src').includes('default.jpg')) {
        $img.attr('src', `${CONFIG.paths.images}default.jpg`);
      }
    });
  }
});