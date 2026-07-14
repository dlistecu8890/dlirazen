/**
 * SLIDER.JS
 * Promo slider dengan auto-play, dots, arrow navigation, swipe support.
 */
(function () {
  function initSlider(root) {
    const track = root.querySelector('.slider-track');
    const slides = Array.from(root.querySelectorAll('.slider-slide'));
    const dotsWrap = root.querySelector('.slider-dots');
    const prevBtn = root.querySelector('.slider-arrow.prev');
    const nextBtn = root.querySelector('.slider-arrow.next');
    if (!track || slides.length === 0) return;

    let index = 0;
    let autoTimer = null;
    const AUTO_MS = 5000;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      resetAuto();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(next, AUTO_MS);
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Swipe support
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) prev();
      else if (diff < -50) next();
    }, { passive: true });

    render();
    resetAuto();

    root.addEventListener('mouseenter', () => autoTimer && clearInterval(autoTimer));
    root.addEventListener('mouseleave', resetAuto);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.slider').forEach(initSlider);
  });
})();
