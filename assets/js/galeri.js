$(document).ready(function() {
  // Load gallery data from JSON file
  $.getJSON('/assets/data/galeri-grid.json', function(galleryData) {
    // Global variables for gallery state
    let currentPage = 1;
    let itemsPerPage = 12;
    let currentMediaIndex = 0;
    let filteredData = [];
    let currentTab = 'all';
    let slideshowInterval = null;
    let hideUITimeout = null;
    let currentScale = 1;
    const scaleStep = 0.2;
    let mediaCache = [];
    let isTransitioning = false;
    let activeVideo = null;

    // Initialize gallery
    function initGallery() {
      // Set up tab click handlers
      $('.gallery-tabs .nav-link').click(function(e) {
        e.preventDefault();
        currentTab = $(this).attr('id').replace('-tab', '');
        currentPage = 1;
        renderGallery();
      });
      
      // Event listener for content limit change
      $('#contentLimit').change(function() {
        itemsPerPage = parseInt($(this).val());
        currentPage = 1;
        renderGallery();
      });
      
      // Initialize modal handlers
      initModalHandlers();
      
      // Trigger click on initial active tab
      $('.gallery-tabs .nav-link.active').trigger('click');
    }
    
    // Render gallery based on active tab
    function renderGallery() {
      // Filter data based on current tab
      switch(currentTab) {
        case 'photo':
          filteredData = galleryData.filter(item => item.type === 'photo');
          break;
        case 'video':
          filteredData = galleryData.filter(item => item.type === 'video');
          break;
        default: // 'all'
          filteredData = [...galleryData];
      }
      
      // Calculate pagination
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      // Get the appropriate gallery container
      const galleryContainer = $(`#${currentTab}Gallery`);
      
      // Clear container
      galleryContainer.empty();
      
      // Render items
      paginatedData.forEach((item, index) => {
        const absoluteIndex = startIndex + index;
        const itemElement = createGalleryItem(item, absoluteIndex);
        galleryContainer.append(itemElement);
      });
      
      // Add click handlers to gallery items
      $('.gallery-item').click(function() {
        const index = parseInt($(this).data('index'));
        openMediaModal(index);
      });
      
      // Update page info
      updatePageInfo(startIndex + 1, endIndex, totalItems);
      
      // Update pagination controls
      updatePagination(totalPages);
      
      // Preload media after render
      setTimeout(preloadMedia, 300);
    }
    
    // Create gallery item HTML
    function createGalleryItem(item, index) {
      if (item.type === 'photo') {
        return `
          <div class="gallery-item" data-index="${index}" data-type="${item.type}">
            ${item.image 
              ? `<img src="${item.image}" loading="lazy">`
              : `<div class="placeholder-icon"><i class="fas fa-image"></i></div>
                 <div class="placeholder-text"></div>`}
          </div>
        `;
      } else {
        return `
          <div class="gallery-item video" data-index="${index}" data-type="${item.type}">
            ${item.thumbnail 
              ? `<img src="${item.thumbnail}" loading="lazy">`
              : `<div class="placeholder-icon"><i class="fas fa-video"></i></div>
                 <div class="placeholder-text"></div>`}
          </div>
        `;
      }
    }
    
    // Update page information display
    function updatePageInfo(startItem, endItem, totalItems) {
      $('#pageInfo').text(`Menampilkan ${startItem}-${endItem} dari ${totalItems} konten`);
    }
    
    // Update pagination controls
    function updatePagination(totalPages) {
      const pagination = $('#pagination');
      pagination.empty();
      
      if (totalPages <= 1) return;
      
      // Previous button
      const prevDisabled = currentPage === 1 ? 'disabled' : '';
      pagination.append(`
        <li class="page-item ${prevDisabled}">
          <a class="page-link" href="#" aria-label="Previous" id="prevPage">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      `);
      
      // Page numbers
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        pagination.append(`
          <li class="page-item ${active}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `);
      }
      
      // Next button
      const nextDisabled = currentPage === totalPages ? 'disabled' : '';
      pagination.append(`
        <li class="page-item ${nextDisabled}">
          <a class="page-link" href="#" aria-label="Next" id="nextPage">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      `);
      
      // Add event handlers
      $('#prevPage').click(function(e) {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderGallery();
        }
      });
      
      $('#nextPage').click(function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
          currentPage++;
          renderGallery();
        }
      });
      
      $('.page-link[data-page]').click(function(e) {
        e.preventDefault();
        currentPage = parseInt($(this).data('page'));
        renderGallery();
      });
    }
    
    // Preload media for instant transitions
    function preloadMedia() {
      mediaCache = [];
      filteredData.forEach((item, index) => {
        if (item.type === 'photo') {
          const img = new Image();
          img.src = item.image || 'https://via.placeholder.com/800x600?text=Photo+Placeholder';
          mediaCache[index] = { type: 'photo', element: img };
        } else {
          // For videos, we just store the URL
          mediaCache[index] = { 
            type: 'video', 
            url: item.video || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: item.thumbnail || getYouTubeThumbnail(item.video)
          };
        }
      });
    }
    
    // Get YouTube thumbnail from URL
    function getYouTubeThumbnail(url) {
      if (!url) return 'https://via.placeholder.com/300x200?text=No+Thumbnail';
      
      // YouTube URL patterns
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId;
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      
      // Vimeo URL pattern
      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1].split('?')[0];
        if (videoId) {
          return `https://vumbnail.com/${videoId}.jpg`;
        }
      }
      
      return 'https://via.placeholder.com/300x200?text=No+Thumbnail';
    }
    
    // Open media modal with instant transition
    function openMediaModal(index) {
      if (isTransitioning || (index === currentMediaIndex && $('#mediaModal').hasClass('show'))) return;
      
      // Stop any playing video
      if (activeVideo) {
        stopVideo(activeVideo);
        activeVideo = null;
      }
      
      currentMediaIndex = index;
      const media = filteredData[index];
      const modal = $('#mediaModal');
      
      // Hide all media first
      $('#modalMediaImage').addClass('d-none');
      $('#modalMediaVideo').addClass('d-none').html('');
      
      // Show loading indicator
      $('.loading-indicator').remove();
      $('.media-content').append('<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>');
      
      // Use cached media if available
      if (mediaCache[index]) {
        if (mediaCache[index].type === 'photo') {
          $('#modalMediaImage').attr('src', mediaCache[index].element.src).removeClass('d-none');
          $('.loading-indicator').remove();
        } else {
          // Create new iframe for video
          const iframe = document.createElement('iframe');
          iframe.src = mediaCache[index].url + '?autoplay=1&enablejsapi=1';
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('allow', 'autoplay');
          iframe.className = 'embed-responsive-item';
          $('#modalMediaVideo').html(iframe).removeClass('d-none');
          activeVideo = iframe;
          $('.loading-indicator').remove();
        }
      } else {
        // Fallback if cache not available
        if (media.type === 'photo') {
          const img = new Image();
          img.onload = function() {
            $('#modalMediaImage').attr('src', this.src).removeClass('d-none');
            $('.loading-indicator').remove();
          };
          img.src = media.image || 'https://via.placeholder.com/800x600?text=Photo+Placeholder';
        } else {
          const iframe = document.createElement('iframe');
          iframe.src = media.video + '?autoplay=1&enablejsapi=1' || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('allow', 'autoplay');
          iframe.className = 'embed-responsive-item';
          $('#modalMediaVideo').html(iframe).removeClass('d-none');
          activeVideo = iframe;
          $('.loading-indicator').remove();
        }
      }
      
      // Update thumbnail preview
      updateThumbnailPreview();
      
      // Highlight current thumbnail
      $('.thumbnail-item').removeClass('active');
      $(`.thumbnail-item[data-index="${currentMediaIndex}"]`).addClass('active');
      
      // Show modal if not already shown
      if (!modal.hasClass('show')) {
        modal.modal('show');
      }
      
      // Reset zoom and UI timer
      resetZoom();
      resetHideUITimer();

      // Setelah mengubah media, scroll thumbnail
      setTimeout(scrollToActiveThumbnail, 100); // Beri sedikit delay untuk memastikan DOM terupdate
    }
    
    // Stop video playback
    function stopVideo(videoElement) {
      if (!videoElement) return;
      
      try {
        // For YouTube videos
        if (videoElement.src.includes('youtube.com') || videoElement.src.includes('youtu.be')) {
          videoElement.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        }
        
        // Reset source to stop playback
        videoElement.src = '';
      } catch (e) {
        console.error('Error stopping video:', e);
      }
    }
    
    // Update fungsi updateThumbnailPreview
    // Update fungsi updateThumbnailPreview
function updateThumbnailPreview() {
  const thumbnailContainer = $('.lg-thumb');
  thumbnailContainer.empty();
  
  filteredData.forEach((item, index) => {
    let thumbnailSrc;
    if (item.type === 'photo') {
      thumbnailSrc = item.thumbnail || item.image || 'https://via.placeholder.com/300x200?text=Photo';
    } else {
      // Untuk video, prioritaskan thumbnail yang disediakan, lalu coba ekstrak dari URL
      thumbnailSrc = item.thumbnail || getYouTubeThumbnail(item.video) || 'https://via.placeholder.com/300x200?text=Video';
    }
    
    const thumbItem = $(`
      <div class="lg-thumb-item ${index === currentMediaIndex ? 'active' : ''} ${item.type === 'video' ? 'video-thumb' : ''}" 
           data-index="${index}">
        <img src="${thumbnailSrc}">
      </div>
    `);
    
    thumbnailContainer.append(thumbItem);
  });
  
  // Add click handler to thumbnails
  $('.lg-thumb-item').click(function() {
    const index = parseInt($(this).data('index'));
    openMediaModal(index);
  });
}
    
    // Navigation functions with smooth transition
    function navigateToPrevMedia() {
      if (isTransitioning) return;
      const newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : filteredData.length - 1;
      openMediaModal(newIndex);
      scrollToActiveThumbnail();
    }
    
    function navigateToNextMedia() {
      if (isTransitioning) return;
      const newIndex = currentMediaIndex < filteredData.length - 1 ? currentMediaIndex + 1 : 0;
      openMediaModal(newIndex);
      scrollToActiveThumbnail();
    }
    
    // Zoom functions
    function zoomIn() {
      currentScale += scaleStep;
      applyZoom();
    }
    
    function zoomOut() {
      if (currentScale > scaleStep) {
        currentScale -= scaleStep;
        applyZoom();
      }
    }
    
    function resetZoom() {
      currentScale = 1;
      applyZoom();
    }
    
    function applyZoom() {
      $('#modalMediaImage').css('transform', `scale(${currentScale})`);
    }
    
    // Slideshow control
    function startSlideshow() {
      if (slideshowInterval) clearInterval(slideshowInterval);
      
      slideshowInterval = setInterval(() => {
        navigateToNextMedia();
      }, 3000); // 3 seconds per slide
      
      $('#playSlideshowBtn').html('<i class="fas fa-pause"></i>').attr('title', 'Pause Slideshow');
    }
    
    function stopSlideshow() {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
      
      $('#playSlideshowBtn').html('<i class="fas fa-play"></i>').attr('title', 'Play Slideshow');
    }
    
    function toggleSlideshow() {
      if (slideshowInterval) {
        stopSlideshow();
      } else {
        startSlideshow();
      }
    }
    
    // Show/hide UI elements
    function resetHideUITimer() {
      // Clear existing timeout
      if (hideUITimeout) clearTimeout(hideUITimeout);
      
      // Show UI elements
      $('.modal-toolbar, .modal-nav-arrow').removeClass('hidden');
      
      // Set new timeout to hide UI
      hideUITimeout = setTimeout(() => {
        $('.modal-toolbar, .modal-nav-arrow').addClass('hidden');
      }, 3000); // Hide after 3 seconds of inactivity
    }
    
    function scrollToActiveThumbnail() {
      const activeThumb = document.querySelector('.lg-thumb-item.active');
      if (activeThumb) {
        const thumbContainer = document.querySelector('.lg-thumb-scroll');
        const containerWidth = thumbContainer.offsetWidth;
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        
        // Hitung posisi scroll
        const scrollPosition = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        
        // Scroll dengan animasi
        thumbContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }

    // Initialize modal event handlers
    function initModalHandlers() {
      const modal = $('#mediaModal');
      
      // Mouse movement detection - now covers entire modal
      modal.on('mousemove', function() {
        resetHideUITimer();
      });
      
      // Navigation buttons
      $('#prevMediaBtn').click(function(e) {
        e.stopPropagation();
        navigateToPrevMedia();
      });
      
      $('#nextMediaBtn').click(function(e) {
        e.stopPropagation();
        navigateToNextMedia();
      });
      
      // Toolbar buttons
      $('#closeModalBtn').click(() => {
        if (activeVideo) {
          stopVideo(activeVideo);
          activeVideo = null;
        }
        modal.modal('hide');
      });
      
      $('#playSlideshowBtn').click(function(e) {
        e.stopPropagation();
        toggleSlideshow();
      });
      
      $('#zoomInBtn').click(function(e) {
        e.stopPropagation();
        zoomIn();
      });
      
      $('#zoomOutBtn').click(function(e) {
        e.stopPropagation();
        zoomOut();
      });
      
      $('#fullscreenBtn').click(function(e) {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          modal[0].requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      });
      
      // Download button
      $('#downloadBtn').click(function(e) {
        e.stopPropagation();
        const media = filteredData[currentMediaIndex];
        if (media.type === 'photo') {
          const link = document.createElement('a');
          link.href = media.image;
          link.download = media.title.replace(/\s+/g, '_') + '.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Video download would be implemented here');
        }
      });
      
      // Share button
      $('#shareBtn').click(function(e) {
        e.stopPropagation();
        const media = filteredData[currentMediaIndex];
        if (navigator.share) {
          navigator.share({
            title: media.title,
            text: 'Lihat media dari galeri kami',
            url: media.image || window.location.href,
          }).catch(err => {
            console.error('Error sharing:', err);
          });
        } else {
          // Fallback for browsers without Web Share API
          prompt('Salin link berikut untuk berbagi:', window.location.href);
        }
      });
      
      // Copy button
      $('#copyBtn').click(function(e) {
        e.stopPropagation();
        const media = filteredData[currentMediaIndex];
        const textToCopy = `${media.title}\n${media.description || ''}\n${window.location.href}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalIcon = $('#copyBtn').html();
          $('#copyBtn').html('<i class="fas fa-check"></i>');
          setTimeout(() => {
            $('#copyBtn').html(originalIcon);
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      });
      
      // Thumbnail toggle button
      $('.lg-toogle-thumb').click(function(e) {
        e.stopPropagation();
        $('.lg-thumb-outer').toggleClass('lg-thumb-open');
        resetHideUITimer();
      });
      
      // Keyboard navigation
      $(document).on('keydown', function(e) {
        if (modal.hasClass('show')) {
          resetHideUITimer();
          
          switch(e.key) {
            case 'ArrowLeft':
              navigateToPrevMedia();
              break;
            case 'ArrowRight':
              navigateToNextMedia();
              break;
            case 'Escape':
              modal.modal('hide');
              break;
            case '+':
            case '=':
              zoomIn();
              break;
            case '-':
              zoomOut();
              break;
            case '0':
              resetZoom();
              break;
            case ' ':
              toggleSlideshow();
              break;
            case 'f':
              $('#fullscreenBtn').click();
              break;
          }
        }
      });
      
      // Cleanup when modal closes
      modal.on('hidden.bs.modal', function() {
        stopSlideshow();
        if (activeVideo) {
          stopVideo(activeVideo);
          activeVideo = null;
        }
        if (hideUITimeout) clearTimeout(hideUITimeout);
      });
    }
    
    // Initialize the gallery
    initGallery();
  }).fail(function(jqxhr, textStatus, error) {
    console.error("Error loading gallery data:", textStatus, error);
    $('#allGallery').html('<div class="col-12 text-center py-5"><i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i><p>Gagal memuat data galeri. Silakan coba lagi nanti.</p></div>');
  });
});