/**
 * NAVBAR.JS
 * Blur on scroll, mobile toggle menu, active link highlight, back-to-top.
 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    const backToTop = document.querySelector('.back-to-top');

    function onScroll() {
      const y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 20);
      if (backToTop) backToTop.classList.toggle('visible', y > 480);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
      });
      menu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('open');
        });
      });
    }

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Highlight active link berdasarkan path halaman saat ini
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-menu a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.endsWith(current)) a.classList.add('active');
    });
  });
})();
