
document.addEventListener('DOMContentLoaded', function () {
  // Cegah scroll bawaan browser karena <a href="#id">
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault(); // Mencegah scroll default
      }
    });
  });

  // Handle klik tombol Detail Program
  document.querySelectorAll('a[href^="#"]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const tabLink = document.querySelector(`#programTabs a[href="${targetId}"]`);
      const tabPane = document.querySelector(targetId);
      if (tabLink && tabPane) {
        e.preventDefault();
        $(tabLink).tab('show');
        setTimeout(() => {
          const headerOffset = document.querySelector('.navbar').offsetHeight + 20;
          const elementPosition = tabPane.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 200); // Delay agar tab-pane tampil dulu
      }
    });
  });
});
