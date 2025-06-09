/* eslint-disable no-undef */
/**
 * Anak Asuh Management Script
 * Untuk Panti Asuhan Kasih Bunda
 * 
 * Fitur:
 * - Load data dari JSON
 * - Filter dan pencarian
 * - Tampilan detail anak
 * - Form sponsorship (single & multiple)
 * - Export data (Excel, PDF)
 * - Integrasi Formspree
 * - Checkbox untuk multiple selection
 */

// Konfigurasi
const config = {
  dataUrl: 'assets/data/anak-asuh.json',
  imagePath: 'img/anak-asuh/',
  defaultImage: 'default-child.png',
  formspreeUrl: 'https://formspree.io/f/xnndokoq'
};

// Elemen DOM
const domElements = {
  table: $('#dataTable'),
  tableBody: $('#tableBody'),
  filterForm: $('#filterForm'),
  selectAll: $('#selectAll'),
  btnSponsor: $('#btnSponsor'),
  sponsorModal: $('#sponsorModal'),
  detailModal: $('#detailModal'),
  modalDetailContent: $('#modalDetailContent'),
  sponsorForm: $('#sponsorForm'),
  submitSponsor: $('#submitSponsor'),
  multiSponsorForm: $('#multiSponsorForm'),
  jumlahAnakDipilih: $('#jumlahAnakDipilih')
};

// State aplikasi
let appState = {
  anakAsuhData: [],
  filteredData: [],
  selectedChildren: []
};

// Inisialisasi aplikasi
function initApp() {
  // Load data dari JSON
  $.getJSON(config.dataUrl)
    .done(function(data) {
      appState.anakAsuhData = data;
      appState.filteredData = [...data];
      initDataTable();
      initEventListeners();
      updateCounterStats();
    })
    .fail(function(jqxhr, textStatus, error) {
      console.error("Error loading data: ", textStatus, error);
      showError("Gagal memuat data anak asuh. Silakan refresh halaman.");
    });
}

// Inisialisasi DataTable
function initDataTable() {
  domElements.table.DataTable({
    dom: '<"top"f>rt<"bottom"lip><"clear">',
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Cari nama...",
      lengthMenu: "Tampilkan _MENU_ data per halaman",
      zeroRecords: "Tidak ada data yang ditemukan",
      info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
      infoEmpty: "Menampilkan 0 sampai 0 dari 0 data",
      infoFiltered: "(disaring dari total _MAX_ data)",
      paginate: {
        first: "Pertama",
        last: "Terakhir",
        next: "Selanjutnya",
        previous: "Sebelumnya"
      }
    },

    columnDefs: [
      { width: "5%", targets: 0 },
      { width: "15%", targets: 1, className: "text-center" },
      { width: "25%", targets: 2 },
      { width: "10%", targets: 3, className: "text-center" },
      { width: "15%", targets: 4, className: "text-center" },
      { width: "10%", targets: 5, className: "text-center" },
      { width: "20%", targets: 6, className: "text-center" }
    ],

    data: appState.filteredData,
    columns: [
      { 
        data: null,
        render: function(data, type, row) {
          return `<div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input child-checkbox" id="check${row.id}" data-id="${row.id}">
                  <label class="custom-control-label" for="check${row.id}"></label>
                </div>`;
        },
        orderable: false
      },
      { 
        data: 'foto',
        render: function(data, type, row) {
          const imageUrl = data ? `${config.imagePath}${data}` : `${config.imagePath}${config.defaultImage}`;
          return `<img src="${imageUrl}" onerror="this.onerror=null;this.src='${config.imagePath}${config.defaultImage}'" class="img-thumbnail" width="60" height="60" alt="Foto ${row.nama}" loading="lazy">`;
        },
        orderable: false
      },
      { 
        data: 'nama',
        render: function(data, type, row) {
          let sponsorBadge = "";
          if (row.sponsor) {
            sponsorBadge = '<span class="badge badge-success ml-2"><i class="fas fa-check mr-1"></i>Tersponsor</span>';
          } else if (row.progress > 0 && row.progress < 100) {
            sponsorBadge = '<span class="badge badge-warning ml-2"><i class="fas fa-star-half-alt mr-1"></i>Sebagian</span>';
          }
          return `<span class="font-weight-bold">${data}</span>${sponsorBadge}`;
        }
      },
      { 
        data: 'tanggal_lahir',
        render: function(data) {
          return `${calculateAge(data)} Tahun`;
        }
      },
      { 
        data: 'kategori',
        render: function(data) {
          return `<span class="badge badge-info">${data}</span>`;
        }
      },
      { 
        data: 'sponsor',
        render: function(data) {
          return data ? 
            '<span class="badge badge-success">Tersponsor</span>' : 
            '<span class="badge badge-secondary">Belum Tersponsor</span>';
        }
      },
      { 
        data: null,
        render: function(data, type, row) {
          return `<div class="btn-group btn-group-actions">
                    <button class="btn btn-sm btn-outline-primary btn-detail" data-id="${row.id}" aria-label="Detail ${row.nama}" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success btn-sponsor" data-id="${row.id}" aria-label="Sponsor ${row.nama}" title="Sponsor">
                      <i class="fas fa-hand-holding-heart"></i>
                    </button>
                  </div>`;
        },
        orderable: false
      }
    ],
    responsive: true,
    initComplete: function() {
      animateCounters();
    }
  });
}

// Inisialisasi event listeners
function initEventListeners() {
  // Tombol detail
  domElements.table.on('click', '.btn-detail', function() {
    const id = $(this).data('id');
    showDetail(id);
  });

  // Tombol sponsor
  domElements.table.on('click', '.btn-sponsor', function() {
    const id = $(this).data('id');
    showSponsorForm(id);
  });

  // Tombol sponsor di modal detail
  domElements.detailModal.on('click', '.btn-sponsor', function() {
    const id = $(this).data('id');
    domElements.detailModal.modal('hide');
    showSponsorForm(id);
  });

  // Select all checkbox
  domElements.selectAll.change(function() {
    $('.child-checkbox').prop('checked', $(this).prop('checked'));
    updateSelectedChildren();
    toggleSponsorButton();
  });

  // Individual checkbox
  domElements.table.on('change', '.child-checkbox', function() {
    if ($('.child-checkbox:checked').length === $('.child-checkbox').length) {
      domElements.selectAll.prop('checked', true);
    } else {
      domElements.selectAll.prop('checked', false);
    }
    updateSelectedChildren();
    toggleSponsorButton();
  });

  // Tombol sponsor multiple
  domElements.btnSponsor.click(function() {
    if (appState.selectedChildren.length === 0) return;
    
    if (appState.selectedChildren.length === 1) {
      showSponsorForm(appState.selectedChildren[0]);
    } else {
      showMultiSponsorForm(appState.selectedChildren);
    }
  });

  // Handle submit form sponsor
  $('#submitSponsor').click(function(e) {
    e.preventDefault();
    handleSponsorSubmit();
  });

  // Filter
  domElements.filterForm.on('change', 'select', applyFilters);

  // Reset filter
  $('#resetFilter').click(function() {
    domElements.filterForm[0].reset();
    applyFilters();
  });

  // Export data
  $('#exportExcel').click(function(e) {
    e.preventDefault();
    exportToExcel();
  });

  $('#exportPDF').click(function(e) {
    e.preventDefault();
    exportToPDF();
  });

  $('#exportPrint').click(function(e) {
    e.preventDefault();
    exportPrint();
  });

  // Import data
  $('#importData').click(function() {
    handleImport();
  });

  // Handle submit form sponsor
  domElements.sponsorForm.on('submit', function(e) {
    e.preventDefault();
    handleSponsorSubmit();
  });

  // Handle submit form multi sponsor
  domElements.multiSponsorForm.on('submit', function(e) {
    e.preventDefault();
    handleMultiSponsorSubmit();
  });

  // Tombol sponsor di modal detail
  domElements.detailModal.on('click', '.btn-sponsor', function() {
    const id = $(this).data('id');
    domElements.detailModal.modal('hide');
    showSponsorForm(id);
  });

  // Switch tab sponsor form
  $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    const target = $(e.target).attr("href");
    if (target === "#multipleSponsor") {
      updateMultiSponsorForm();
    }
  });
}


// Fungsi untuk menampilkan detail anak
function showDetail(id) {
  const anak = appState.anakAsuhData.find(item => item.id == id);
  if (!anak) {
    showError("Data anak tidak ditemukan");
    return;
  }

  const imageUrl = anak.foto ? `${config.imagePath}${anak.foto}` : `${config.imagePath}${config.defaultImage}`;
  
  const modalContent = `
    <div class="row">
      <div class="col-md-4 text-center">
        <img src="${imageUrl}" class="img-fluid rounded mb-3" style="max-height: 300px;" alt="Foto ${anak.nama}">
        <h4 id="detailNama">${anak.nama}</h4>
        <p id="detailUmur" class="text-muted">${calculateAge(anak.tanggal_lahir)} Tahun | ${anak.kategori}</p>
        
        <div class="mb-3">
          <span class="badge ${anak.sponsor ? 'badge-success' : anak.progress > 0 ? 'badge-warning' : 'badge-secondary'}">
            ${anak.sponsor ? 'Tersponsor' : anak.progress > 0 ? `Sebagian (${anak.progress}%)` : 'Belum Tersponsor'}
          </span>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <p id="detailGender" class="form-control-static">${anak.jenis_kelamin || '-'}</p>
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <p id="detailBirthdate" class="form-control-static">${formatDate(anak.tanggal_lahir)}</p>
            </div>
            <div class="form-group">
              <label>Pendidikan</label>
              <p id="detailEducation" class="form-control-static">${anak.asal_sekolah || '-'} (${anak.kelas || '-'})</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Kategori</label>
              <p id="detailCategory" class="form-control-static">${anak.kategori}</p>
            </div>
            <div class="form-group">
              <label>Tanggal Masuk</label>
              <p id="detailJoinDate" class="form-control-static">${formatDate(anak.tgl_masuk)}</p>
            </div>
            <div class="form-group">
              <label>Status Sponsor</label>
              <p id="detailSponsorStatus" class="form-control-static">
                ${anak.sponsor ? 'Tersponsor' : anak.progress > 0 ? `Sebagian (${anak.progress}%)` : 'Belum Tersponsor'}
              </p>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <p id="detailDescription" class="form-control-static">${anak.alamat || '-'}</p>
        </div>
        <div class="form-group">
          <label>Kebutuhan Khusus</label>
          <p id="detailNeeds" class="form-control-static">${anak.kebutuhan || '-'}</p>
        </div>
      </div>
    </div>
  `;

  domElements.modalDetailContent.html(modalContent);
  domElements.detailModal.find('.btn-sponsor').attr('data-id', id);
  domElements.detailModal.modal('show');
}

// Fungsi untuk menampilkan form sponsor
function showSponsorForm(id) {
  const anak = appState.anakAsuhData.find(item => item.id == id);
  if (!anak) {
    showError("Data anak tidak ditemukan");
    return;
  }

  // Aktifkan tab single sponsor
  $('#sponsorTab a[href="#singleSponsor"]').tab('show');
  
  $('#singleNamaAnak').val(anak.nama);
  $('#singleFormAnak').val(anak.id);
  domElements.sponsorModal.modal('show');
}

// Fungsi untuk menampilkan form sponsor multiple
function showMultiSponsorForm(childrenIds) {
  const selectedChildren = appState.anakAsuhData.filter(child => 
    childrenIds.includes(child.id)
  );

  // Aktifkan tab multiple sponsor
  $('#sponsorTab a[href="#multipleSponsor"]').tab('show');
  
  // Update jumlah anak yang dipilih
  $('#jumlahAnakDipilih').text(selectedChildren.length);
  
  // Set daftar ID anak yang dipilih
  $('#multiFormDaftarAnak').val(JSON.stringify(selectedChildren.map(c => c.id)));
  
  // Tampilkan modal
  domElements.sponsorModal.modal('show');
}

// Fungsi untuk handle submit sponsor
function handleSponsorSubmit() {
  // Tentukan form yang aktif (single/multiple)
  const activeTab = $('.nav-tabs .nav-link.active').attr('id');
  
  if (activeTab === 'single-tab') {
    handleSingleSponsorSubmit();
  } else {
    handleMultiSponsorSubmit();
  }
}

// Fungsi untuk handle submit single sponsor
function handleSingleSponsorSubmit() {
  const formData = {
    namaSponsor: $('#singleNamaSponsor').val().trim(),
    emailSponsor: $('#singleEmailSponsor').val().trim(),
    noHp: $('#singleNoHp').val().trim(),
    jenisSponsor: $('#singleJenisSponsor').val(),
    durasi: $('#singleDurasi').val(),
    pesan: $('#singlePesan').val().trim(),
    anak: $('#singleNamaAnak').val(),
    anakId: $('#singleFormAnak').val()
  };

  // Validasi form
  $('.is-invalid').removeClass('is-invalid');
  let isValid = true;

  if (!formData.namaSponsor) {
    $('#singleNamaSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.emailSponsor || !validateEmail(formData.emailSponsor)) {
    $('#singleEmailSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.noHp) {
    $('#singleNoHp').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.jenisSponsor) {
    $('#singleJenisSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!isValid) {
    showError('Harap isi semua field yang wajib diisi');
    return;
  }

  // Set reply-to email
  $('#singleFormEmail').val(formData.emailSponsor);

  // Kirim form via Formspree
  $.ajax({
    url: config.formspreeUrl,
    method: 'POST',
    data: $('#singleSponsorForm').serialize(),
    dataType: 'json',
    beforeSend: function() {
      $('#submitSponsor').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
    },
    success: function() {
      showSuccess(`Permohonan sponsorship untuk ${formData.anak} berhasil dikirim!`);
      $('#singleSponsorForm')[0].reset();
      domElements.sponsorModal.modal('hide');
    },
    error: function() {
      showError('Gagal mengirim permohonan. Silakan coba lagi atau hubungi kami langsung.');
    },
    complete: function() {
      $('#submitSponsor').prop('disabled', false).html('<i class="fas fa-paper-plane mr-2"></i> Kirim Permohonan');
    }
  });
}

// Fungsi untuk handle submit multi sponsor
function handleMultiSponsorSubmit() {
  const formData = {
    namaSponsor: $('#multiNamaSponsor').val().trim(),
    emailSponsor: $('#multiEmailSponsor').val().trim(),
    noHp: $('#multiNoHp').val().trim(),
    jenisSponsor: $('#multiJenisSponsor').val(),
    durasi: $('#multiDurasi').val(),
    pesan: $('#multiPesan').val().trim(),
    jumlahAnak: $('#jumlahAnakDipilih').text()
  };

  // Validasi form
  $('.is-invalid').removeClass('is-invalid');
  let isValid = true;

  if (!formData.namaSponsor) {
    $('#multiNamaSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.emailSponsor || !validateEmail(formData.emailSponsor)) {
    $('#multiEmailSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.noHp) {
    $('#multiNoHp').addClass('is-invalid');
    isValid = false;
  }

  if (!formData.jenisSponsor) {
    $('#multiJenisSponsor').addClass('is-invalid');
    isValid = false;
  }

  if (!isValid) {
    showError('Harap isi semua field yang wajib diisi');
    return;
  }

  // Dapatkan data anak yang dipilih
  const selectedChildren = appState.anakAsuhData.filter(child => 
    JSON.parse($('#multiFormDaftarAnak').val()).includes(child.id)
  );

  // Format data untuk dikirim
  $('#multiFormNama').val(formData.namaSponsor);
  $('#multiFormEmailSponsor').val(formData.emailSponsor);
  $('#multiFormTelepon').val(formData.noHp);
  $('#multiFormJenis').val(formData.jenisSponsor);
  $('#multiFormDurasi').val(formData.durasi);
  $('#multiFormJumlahAnak').val(selectedChildren.length);
  $('#multiFormDaftarAnak').val(selectedChildren.map(c => `${c.nama} (${c.age} Tahun)`).join(', '));
  $('#multiFormCatatan').val(formData.pesan || 'Tidak ada catatan');
  $('#multiFormEmail').val(formData.emailSponsor);

  // Kirim form via Formspree
  $.ajax({
    url: config.formspreeUrl,
    method: 'POST',
    data: $('#multiSponsorFormspree').serialize(),
    dataType: 'json',
    beforeSend: function() {
      $('#submitSponsor').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
    },
    success: function() {
      showSuccess(`Permohonan sponsorship untuk ${selectedChildren.length} anak berhasil dikirim!`);
      $('#multiSponsorForm')[0].reset();
      domElements.sponsorModal.modal('hide');
      
      // Reset selection
      domElements.selectAll.prop('checked', false);
      $('.child-checkbox').prop('checked', false);
      appState.selectedChildren = [];
      toggleSponsorButton();
    },
    error: function() {
      showError('Gagal mengirim permohonan. Silakan coba lagi atau hubungi kami langsung.');
    },
    complete: function() {
      $('#submitSponsor').prop('disabled', false).html('<i class="fas fa-paper-plane mr-2"></i> Kirim Permohonan');
    }
  });
}

// Update form multi sponsor saat tab aktif
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
  const target = $(e.target).attr("href");
  if (target === "#multipleSponsor") {
    updateMultiSponsorForm();
  }
});

// Fungsi untuk update form multi sponsor
function updateMultiSponsorForm() {
  const selectedCount = appState.selectedChildren.length;
  $('#jumlahAnakDipilih').text(selectedCount);
  $('#multiFormDaftarAnak').val(JSON.stringify(appState.selectedChildren));
}

// Fungsi untuk menerapkan filter
function applyFilters() {
  const kategori = $('#filterKategori').val();
  const usia = $('#filterUsia').val();
  const sponsor = $('#filterSponsor').val();

  let filteredData = [...appState.anakAsuhData];

  // Filter berdasarkan kategori
  if (kategori) {
    filteredData = filteredData.filter(anak => anak.kategori === kategori);
  }

  // Filter berdasarkan usia
  if (usia) {
    const [min, max] = usia.split('-').map(Number);
    filteredData = filteredData.filter(anak => {
      const usiaAnak = calculateAge(anak.tanggal_lahir);
      return max ? usiaAnak >= min && usiaAnak <= max : usiaAnak >= min;
    });
  }

  // Filter berdasarkan status sponsor (hanya 2 pilihan sekarang)
  if (sponsor) {
    if (sponsor === 'tersponsor') {
      filteredData = filteredData.filter(anak => anak.sponsor === true);
    } else if (sponsor === 'belum') {
      filteredData = filteredData.filter(anak => anak.sponsor !== true);
    }
  }

  appState.filteredData = filteredData;
  refreshTable();
}

// Fungsi untuk refresh tabel
function refreshTable() {
  const table = domElements.table.DataTable();
  table.clear().rows.add(appState.filteredData).draw();
}

// Fungsi untuk update selected children
function updateSelectedChildren() {
  appState.selectedChildren = [];
  $('.child-checkbox:checked').each(function() {
    appState.selectedChildren.push($(this).data('id'));
  });
}

// Fungsi untuk toggle tombol sponsor
function toggleSponsorButton() {
  const checkedCount = appState.selectedChildren.length;
  if (checkedCount > 0) {
    domElements.btnSponsor.prop('disabled', false);
    domElements.btnSponsor.html(`<i class="fas fa-hand-holding-heart mr-2"></i> Sponsor (${checkedCount})`);
  } else {
    domElements.btnSponsor.prop('disabled', true);
    domElements.btnSponsor.html('<i class="fas fa-hand-holding-heart mr-2"></i> Sponsor Sekarang');
  }
}

// Fungsi untuk export ke Excel
function exportToExcel() {
  try {
    // Pastikan library SheetJS tersedia
    if (typeof XLSX === 'undefined') {
      showError('Library SheetJS tidak ditemukan');
      return;
    }

    // Data untuk export
    const exportData = appState.anakAsuhData.map((anak, index) => ({
      'No': index + 1,
      'Nama': anak.nama,
      'Jenis Kelamin': anak.jenis_kelamin,
      'Tempat Lahir': anak.tempat_lahir || '-',
      'Tanggal Lahir': anak.tanggal_lahir ? formatDate(anak.tanggal_lahir) : '-',
      'Usia': calculateAge(anak.tanggal_lahir) + ' Tahun',
      'Alamat': anak.alamat || '-',
      'Asal Sekolah': anak.asal_sekolah || '-',
      'Kelas': anak.kelas || '-',
      'Nama Ayah': anak.nama_ayah || '-',
      'Status Ayah': anak.status_ayah || '-',
      'Pekerjaan Ayah': anak.pekerjaan_ayah || '-',
      'Penghasilan Ayah': anak.penghasilan_ayah || '-',
      'Telepon Ayah': anak.telepon_ayah || '-',
      'Nama Ibu': anak.nama_ibu || '-',
      'Status Ibu': anak.status_ibu || '-',
      'Pekerjaan Ibu': anak.pekerjaan_ibu || '-',
      'Penghasilan Ibu': anak.penghasilan_ibu || '-',
      'Telepon Ibu': anak.telepon_ibu || '-',
      'Jumlah Saudara': anak.jumlah_saudara || '-',
      'Tempat Tinggal': anak.tempat_tinggal || '-',
      'Kendaraan': anak.kendaraan || '-',
      'Kategori': anak.kategori,
      'Status Sponsor': anak.sponsor ? 'Tersponsor' : (anak.progress > 0 ? `Sebagian (${anak.progress}%)` : 'Belum')
    }));

    // Buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anak Asuh");
    
    // Atur lebar kolom (opsional)
    worksheet['!cols'] = [
      { width: 5 },  // No
      { width: 25 }, // Nama
      { width: 15 }, // Jenis Kelamin
      { width: 15 }, // Tempat Lahir
      { width: 15 }, // Tanggal Lahir
      { width: 10 }, // Usia
      { width: 30 }, // Alamat
      { width: 20 }, // Asal Sekolah
      { width: 10 }, // Kelas
      { width: 20 }, // Nama Ayah
      { width: 15 }, // Status Ayah
      { width: 20 }, // Pekerjaan Ayah
      { width: 15 }, // Penghasilan Ayah
      { width: 15 }, // Telepon Ayah
      { width: 20 }, // Nama Ibu
      { width: 15 }, // Status Ibu
      { width: 20 }, // Pekerjaan Ibu
      { width: 15 }, // Penghasilan Ibu
      { width: 15 }, // Telepon Ibu
      { width: 15 }, // Jumlah Saudara
      { width: 20 }, // Tempat Tinggal
      { width: 15 }, // Kendaraan
      { width: 15 }, // Kategori
      { width: 20 }  // Status Sponsor
    ];

    // Export ke file
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Anak_Asuh_${dateStr}.xlsx`);
    
    showSuccess('Data berhasil diexport ke Excel');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    showError('Gagal mengekspor ke Excel: ' + error.message);
  }
}

function exportToPDF() {
  try {
    if (typeof window.jspdf !== 'undefined') {
      const { jsPDF } = window.jspdf;
      
      // 1. Buat dokumen landscape A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;

      // 2. Judul center
      doc.setFontSize(16);
      doc.setTextColor(40, 167, 69); // Warna hijau sama seperti print
      doc.text('LAPORAN DATA ANAK ASUH', centerX, 20, { align: 'center' });

      // 3. Subjudul center
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Kembalikan ke warna hitam
      doc.text(`Panti Asuhan Kasih Bunda - Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 
              centerX, 27, { align: 'center' });

      // 4. Data tabel (sesuai dengan format print)
      const headers = [
        ['No', 'Nama', 'J/K', 'Usia', 'Kategori', 'Sekolah', 'Kelas']
      ];

      const data = appState.anakAsuhData.map((anak, index) => [
        index + 1,
        anak.nama,
        anak.jenis_kelamin,
        calculateAge(anak.tanggal_lahir) + ' Thn',
        anak.kategori,
        anak.asal_sekolah || '-',
        anak.kelas || '-'
      ]);

      // 5. Buat tabel center dengan lebar 90% halaman
      doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        margin: { horizontal: (pageWidth * 0.05) }, // Margin 5% kiri-kanan
        tableWidth: 'auto',
        styles: {
          fontSize: 10, // Sedikit lebih besar dari sebelumnya
          cellPadding: 3,
          textColor: [0, 0, 0],
          valign: 'middle',
          halign: 'center', // Center semua teks
          lineColor: [0, 0, 0], // Border hitam
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'center' }, // No
          1: { cellWidth: 'auto', halign: 'left' },   // Nama (rata kiri)
          2: { cellWidth: 'auto', halign: 'center' }, // J/K
          3: { cellWidth: 'auto', halign: 'center' }, // Usia
          4: { cellWidth: 'auto', halign: 'center' }, // Kategori
          5: { cellWidth: 'auto', halign: 'left' },   // Sekolah (rata kiri)
          6: { cellWidth: 'auto', halign: 'center' }  // Kelas
        },
        headStyles: {
          fillColor: [242, 242, 242], // Warna abu-abu muda seperti print
          textColor: [0, 0, 0], // Teks hitam
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.1
        },
        bodyStyles: {
          lineWidth: 0.1
        },
        didDrawPage: function(data) {
          // Footer center
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(`Halaman ${doc.internal.getNumberOfPages()}`, 
                  centerX, pageHeight - 10, 
                  { align: 'center' });
          
          // Tambahkan footer nama admin
          doc.text('Dicetak oleh: Admin Panti Asuhan Kasih Bunda',
                  pageWidth - 10, pageHeight - 10,
                  { align: 'right' });
        }
      });

      doc.save(`Data_Anak_Asuh_${new Date().toISOString().split('T')[0]}.pdf`);
      showSuccess('PDF berhasil di-generate');
    } else {
      showError('Library jsPDF tidak ditemukan');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('Gagal membuat PDF: ' + error.message);
  }
}

// Fungsi untuk export via Print
function exportPrint() {
  try {
    // Buat window baru untuk print
    const printWindow = window.open('', '_blank');
    
    // Buat HTML untuk tabel
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Data Anak Asuh</title>
        <style>
          body { font-family: Arial; margin: 0; padding: 20px; color: #333; }
          h1 { text-align: center; margin-bottom: 5px; color: #28a745; }
          .subtitle { text-align: center; margin-bottom: 20px; font-size: 14px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { margin-top: 30px; text-align: right; font-size: 12px; }
          @media print {
            @page { size: landscape; margin: 10mm; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>LAPORAN DATA ANAK ASUH</h1>
        <div class="subtitle">Panti Asuhan Kasih Bunda - Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Jenis Kelamin</th>
              <th>Usia</th>
              <th>Kategori</th>
              <th>Status Sponsor</th>
              <th>Asal Sekolah</th>
              <th>Kelas</th>
              <th>Alamat</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Tambahkan data
    appState.anakAsuhData.forEach((anak, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${anak.nama}</td>
          <td>${anak.jenis_kelamin}</td>
          <td>${calculateAge(anak.tanggal_lahir)} Tahun</td>
          <td>${anak.kategori}</td>
          <td>${anak.sponsor ? 'Tersponsor' : (anak.progress > 0 ? `Sebagian (${anak.progress}%)` : 'Belum')}</td>
          <td>${anak.asal_sekolah || '-'}</td>
          <td>${anak.kelas || '-'}</td>
          <td>${anak.alamat || '-'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="footer">
          <p>Dicetak oleh: Admin Panti Asuhan Kasih Bunda</p>
        </div>
        <script>
          // Cetak otomatis saat window terbuka
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          };
        </script>
      </body>
      </html>
    `;

    // Tulis HTML ke window baru
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error printing:', error);
    showError('Gagal mencetak: ' + error.message);
  }
}

// Fungsi utama untuk import data
async function handleImport() {
  try {
    // 1. Baca file CSV yang diupload
    const csvData = await readCSVFile();
    
    // 2. Baca file anak-asuh.json yang ada
    const existingData = await loadExistingJSON();
    
    // 3. Gabungkan data lama dan baru
    const mergedData = mergeData(existingData, csvData);
    
    // 4. Download file JSON yang sudah digabung
    downloadMergedJSON(mergedData);
    
  } catch (error) {
    console.error("Error in import process:", error);
    alert(`Import gagal: ${error.message}`);
  }
}

// Fungsi untuk membaca file CSV
function readCSVFile() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';

    fileInput.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\n').filter(line => line.trim() !== '');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const jsonData = lines.slice(1).map((line, index) => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, i) => {
              row[header] = values[i] ? values[i].trim() : '';
            });
            return row;
          });

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Gagal membaca file CSV"));
      reader.readAsText(file);
    };

    fileInput.click();
  });
}

// Fungsi untuk memuat data JSON yang ada
async function loadExistingJSON() {
  try {
    const response = await fetch('anak-asuh.json');
    if (!response.ok) throw new Error("File JSON tidak ditemukan");
    return await response.json();
  } catch (error) {
    console.warn("Menggunakan data kosong karena:", error.message);
    return []; // Return array kosong jika file tidak ada
  }
}

// Fungsi untuk menggabungkan data lama dan baru
function mergeData(existingData, newData) {
  // Konversi format data baru
  const formattedNewData = newData.map((row, index) => ({
    id: parseInt(row.id) || Date.now() + index,
    nama: row.nama,
    foto: row.foto || 'default.jpg',
    jenis_kelamin: row.jenis_kelamin,
    tempat_lahir: row.tempat_lahir,
    tanggal_lahir: formatDateToYYYYMMDD(row.tanggal_lahir),
    alamat: row.alamat,
    asal_sekolah: row.asal_sekolah,
    kelas: row.kelas,
    nama_ayah: row.nama_ayah,
    status_ayah: row.status_ayah,
    pekerjaan_ayah: row.pekerjaan_ayah,
    penghasilan_ayah: row.penghasilan_ayah,
    telepon_ayah: row.telepon_ayah,
    nama_ibu: row.nama_ibu,
    status_ibu: row.status_ibu,
    pekerjaan_ibu: row.pekerjaan_ibu,
    penghasilan_ibu: row.penghasilan_ibu,
    telepon_ibu: row.telepon_ibu,
    jumlah_saudara: parseInt(row.jumlah_saudara) || 0,
    tempat_tinggal: row.tempat_tinggal,
    kendaraan: row.kendaraan,
    kategori: row.kategori,
    sponsor: false,
    progress: 0
  }));

  // Gabungkan data, hindari duplikat berdasarkan ID atau nama+tanggal lahir
  const merged = [...existingData];
  
  formattedNewData.forEach(newItem => {
    const isDuplicate = existingData.some(existingItem => 
      existingItem.id === newItem.id || 
      (existingItem.nama === newItem.nama && 
       existingItem.tanggal_lahir === newItem.tanggal_lahir)
    );
    
    if (!isDuplicate) {
      merged.push(newItem);
    }
  });

  return merged;
}

// Fungsi untuk download file JSON gabungan
function downloadMergedJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'anak-asuh-merged.json';
  document.body.appendChild(a);
  a.click();
  
  // Bersihkan setelah download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Data berhasil digabung! Silahkan ganti file anak-asuh.json dengan file yang baru didownload');
  }, 100);
}

// Helper: Format tanggal
function formatDateToYYYYMMDD(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Fungsi untuk animasi counter statistik (no changes needed here)
function animateCounters() {
  $('.counter').each(function() {
    const $this = $(this);
    const target = $this.data('target');
    const duration = 2000;
    const step = target / (duration / 16);

    let current = 0;
    const counter = setInterval(() => {
      current += step;
      if (current >= target) {
        $this.text(target);
        clearInterval(counter);
      } else {
        $this.text(Math.floor(current));
      }
    }, 16);
  });
}

// Fungsi untuk update counter statistik
function updateCounterStats() {
  // Hitung jumlah berdasarkan kategori
  const total = appState.anakAsuhData.length;
  const yatim = appState.anakAsuhData.filter(a => a.kategori === 'Yatim').length;
  const piatu = appState.anakAsuhData.filter(a => a.kategori === 'Piatu').length;
  const yatimPiatu = appState.anakAsuhData.filter(a => a.kategori === 'Yatim Piatu').length;
  const dhuafa = appState.anakAsuhData.filter(a => a.kategori === 'Dhuafa').length;

  // Update data-target untuk masing-masing counter
  $('#counter-total').data('target', total);
  $('#counter-yatim').data('target', yatim);
  $('#counter-piatu').data('target', piatu);
  $('#counter-yatim-piatu').data('target', yatimPiatu);
  $('#counter-dhuafa').data('target', dhuafa);

  // Jalankan animasi counter
  animateCounters();
}

// Fungsi untuk hitung usia
function calculateAge(tanggalLahir) {
  if (!tanggalLahir) return '-';
  
  const birthDate = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Fungsi untuk format tanggal
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk validasi email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Fungsi debounce untuk optimasi performa
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Fungsi untuk menampilkan pesan error
function showError(message) {
  const alertHtml = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error!</strong> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  
  $('main').prepend(alertHtml);
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(message) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Sukses!</strong> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  
  $('main').prepend(alertHtml);
}

// Jalankan aplikasi saat dokumen siap
$(document).ready(initApp);