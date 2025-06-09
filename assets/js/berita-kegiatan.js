// JavaScript untuk Halaman Berita & Kegiatan
$(document).ready(function() {
  // Variabel global
  let currentPage = 1;
  const itemsPerPage = 6;
  let allNewsItems = [];
  let filteredNewsItems = [];
  let totalPages = 1;
  let isLoading = false;

  // DOM Elements
  const $newsList = $('.news-list');
  const $loadingIndicator = $('#loading-indicator');
  const $errorMessage = $('#error-message');
  const $emptyState = $('#empty-state');
  const $pagination = $('#pagination');

  // Fungsi untuk menampilkan loading state
  function showLoading() {
    isLoading = true;
    $loadingIndicator.show();
    $errorMessage.addClass('d-none');
    $emptyState.addClass('d-none');
    $newsList.hide();
    $pagination.hide();
  }

  // Fungsi untuk menyembunyikan loading state
  function hideLoading() {
    isLoading = false;
    $loadingIndicator.hide();
    $newsList.show();
    $pagination.show();
  }

  // Fungsi untuk menampilkan error state
  function showError(message) {
    hideLoading();
    $('#error-text').text(message || 'Gagal memuat data berita. Silakan coba lagi nanti.');
    $errorMessage.removeClass('d-none');
    $emptyState.addClass('d-none');
    $newsList.hide();
    $pagination.hide();
  }

  // Fungsi untuk menampilkan empty state
  function showEmptyState() {
    hideLoading();
    $errorMessage.addClass('d-none');
    $emptyState.removeClass('d-none');
    $newsList.hide();
    $pagination.hide();
  }

  // Fungsi untuk fetch data berita
  function fetchNewsData() {
    showLoading();
    
    fetch('/assets/data/berita.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          showEmptyState();
          return;
        }
        renderNewsItems(data);
      })
      .catch(error => {
        console.error('Error fetching news data:', error);
        showError('Gagal memuat data berita. ' + error.message);
      });
  }

  // Fungsi untuk render berita
  function renderNewsItems(data) {
    if (!data || data.length === 0) {
      showEmptyState();
      return;
    }

    $newsList.empty();
    allNewsItems = [];

    data.forEach(item => {
      const newsCard = `
        <div class="col-md-6 mb-4 news-card" data-category="${item.category}" data-date="${item.date}">
          <div class="card h-100 shadow-sm">
            ${item.isNew ? '<span class="new-badge">BARU</span>' : ''}
            <img src="${item.image}" class="card-img-top news-thumbnail" 
                 alt="${item.title}"
                 onerror="this.onerror=null;this.src='img/placeholder-news.png';this.alt='${item.title}'">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center mb-2">
                <span class="badge ${getCategoryBadgeClass(item.category)} me-2">${getCategoryName(item.category)}</span>
                <small class="news-meta"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</small>
              </div>
              <h3 class="h5 card-title">${item.title}</h3>
              <p class="card-text">${item.excerpt}</p>
              
              <div class="mb-3">
                ${item.tags.map(tag => `<span class="news-tag">#${tag}</span>`).join('')}
              </div>
              
              <div class="d-flex justify-content-end">
                <a href="${item.url}" class="btn btn-outline-success btn-sm">
                  <i class="fas fa-book-open me-1"></i> Baca Cerita Lengkap
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      
      $newsList.append(newsCard);
    });

    // Update variabel global
    allNewsItems = $('.news-card');
    filteredNewsItems = allNewsItems;
    totalPages = Math.ceil(filteredNewsItems.length / itemsPerPage);
    
    hideLoading();
    showPage(1);
  }

  // Helper function untuk kategori
  function getCategoryName(category) {
    const categories = {
      'activity': 'Kegiatan Anak',
      'donation': 'Donasi',
      'visit': 'Kunjungan',
      'education': 'Edukasi'
    };
    return categories[category] || category;
  }

  // Helper function untuk badge class
  function getCategoryBadgeClass(category) {
    const classes = {
      'activity': 'bg-success',
      'donation': 'bg-info',
      'visit': 'bg-primary',
      'education': 'bg-warning'
    };
    return classes[category] || 'bg-secondary';
  }

  // Helper function untuk format tanggal
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  // Fungsi untuk menampilkan items berdasarkan halaman
  function showPage(page) {
    if (isLoading) return;
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Sembunyikan semua items
    allNewsItems.hide();
    
    // Tampilkan hanya items untuk halaman ini
    filteredNewsItems.slice(startIndex, endIndex).show();
    
    // Update current page
    currentPage = page;
    
    // Update pagination UI
    updatePagination();
  }

  // Fungsi untuk update pagination
  function updatePagination() {
    $pagination.empty();
    
    totalPages = Math.ceil(filteredNewsItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
      $pagination.hide();
      return;
    }
    
    $pagination.show();
    
    // Tombol Previous
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    $pagination.append(`
      <li class="page-item ${prevDisabled}">
        <a class="page-link" href="#" aria-label="Previous" id="prev-page">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `);
    
    // Nomor halaman
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Tombol pertama
    if (startPage > 1) {
      $pagination.append(`
        <li class="page-item">
          <a class="page-link page-number" href="#" data-page="1">1</a>
        </li>
      `);
      if (startPage > 2) {
        $pagination.append(`
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `);
      }
    }
    
    // Nomor halaman
    for (let i = startPage; i <= endPage; i++) {
      const active = i === currentPage ? 'active' : '';
      $pagination.append(`
        <li class="page-item ${active}">
          <a class="page-link page-number" href="#" data-page="${i}">${i}</a>
        </li>
      `);
    }
    
    // Tombol terakhir
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        $pagination.append(`
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `);
      }
      $pagination.append(`
        <li class="page-item">
          <a class="page-link page-number" href="#" data-page="${totalPages}">${totalPages}</a>
        </li>
      `);
    }
    
    // Tombol Next
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    $pagination.append(`
      <li class="page-item ${nextDisabled}">
        <a class="page-link" href="#" aria-label="Next" id="next-page">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `);
  }

  // Fungsi untuk filter berita
  function filterNews() {
    const searchTerm = $('#news-search').val().toLowerCase();
    const sortBy = $('#sort-options').val();
    const category = $('input[name="category"]:checked').val();
    
    // Hapus alert sebelumnya jika ada
    $('.alert-info').remove();
    
    filteredNewsItems = allNewsItems;
    
    // Filter berdasarkan kategori
    if (category !== 'all') {
      filteredNewsItems = filteredNewsItems.filter(function() {
        return $(this).data('category') === category;
      });
    }
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      filteredNewsItems = filteredNewsItems.filter(function() {
        const title = $(this).find('.card-title').text().toLowerCase();
        const content = $(this).find('.card-text').text().toLowerCase();
        const tags = $(this).find('.news-tag').text().toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm);
      });
    }
    
    // Urutkan hasil
    const sortedItems = Array.from(filteredNewsItems);
    if (sortBy === 'newest') {
      sortedItems.sort((a, b) => {
        const dateA = new Date($(a).data('date'));
        const dateB = new Date($(b).data('date'));
        return dateB - dateA;
      });
    } else if (sortBy === 'oldest') {
      sortedItems.sort((a, b) => {
        const dateA = new Date($(a).data('date'));
        const dateB = new Date($(b).data('date'));
        return dateA - dateB;
      });
    }
    
    // Update filtered items
    filteredNewsItems = $(sortedItems);
    totalPages = Math.ceil(filteredNewsItems.length / itemsPerPage);
    
    // Reset ke halaman 1 setelah filter
    currentPage = 1;
    
    if (filteredNewsItems.length === 0) {
      showEmptyState();
    } else {
      hideLoading();
      showPage(currentPage);
    }
  }

  // Event listeners untuk paginasi
  $(document).on('click', '.page-number', function(e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    showPage(page);
    $('html, body').animate({ scrollTop: $('.news-list').offset().top - 20 }, 300);
  });

  $(document).on('click', '#prev-page', function(e) {
    e.preventDefault();
    if (currentPage > 1) {
      showPage(currentPage - 1);
      $('html, body').animate({ scrollTop: $('.news-list').offset().top - 20 }, 300);
    }
  });

  $(document).on('click', '#next-page', function(e) {
    e.preventDefault();
    if (currentPage < totalPages) {
      showPage(currentPage + 1);
      $('html, body').animate({ scrollTop: $('.news-list').offset().top - 20 }, 300);
    }
  });

  // Event listeners untuk filter
  $('#search-button').on('click', filterNews);
  $('#news-search').on('keyup', function(e) {
    if (e.key === 'Enter') filterNews();
  });
  $('#sort-options, input[name="category"]').on('change', filterNews);

  // Event listener untuk retry button
  $('#retry-button').on('click', fetchNewsData);

  // Arsip bulanan
  $('.archive-year').click(function(e) {
    e.preventDefault(); // Cegah loncatan jika .archive-year adalah link
    $(this).next('.archive-month').slideToggle();
    $(this).find('i').toggleClass('fa-folder fa-folder-open');
  });

  // Handle image errors globally
  $(document).on('error', 'img', function() {
    if (!$(this).hasClass('error-handled')) {
      const altText = $(this).attr('alt') || 'Gambar tidak tersedia';
      $(this).replaceWith(`<div class="news-thumbnail">${altText}</div>`);
      $(this).addClass('error-handled');
    }
  });

  // Handler klik arsip bulanan
  $(document).on('click', '.archive-link', function(e) {
    e.preventDefault();
    const year = $(this).data('year');
    const month = $(this).data('month');

    // Filter berita berdasarkan bulan dan tahun
    filteredNewsItems = allNewsItems.filter(function() {
      const itemDate = new Date($(this).data('date'));
      return itemDate.getFullYear() == year && (itemDate.getMonth() + 1) == parseInt(month);
    });

    totalPages = Math.ceil(filteredNewsItems.length / itemsPerPage);
    currentPage = 1;

    if (filteredNewsItems.length === 0) {
      showEmptyState();
    } else {
      hideLoading();
      showPage(currentPage);
    }

    // Scroll ke daftar berita
    $('html, body').animate({ scrollTop: $('.news-list').offset().top - 20 }, 300);
  });


  // Inisialisasi
  fetchNewsData();
});