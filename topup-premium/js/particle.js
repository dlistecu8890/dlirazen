/**
 * PARTICLE.JS
 * Particle background animasi di canvas + cursor glow + mouse trail.
 * Berjalan ringan, otomatis nonaktif di prefers-reduced-motion.
 */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Particle Canvas ---------- */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = isTouchDevice ? 32 : 70;
    const COLORS = ['#00d9ff', '#a855f7', '#22e6d0'];

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.15
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(makeParticle());

    function step() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Garis penghubung antar partikel terdekat
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,217,255,${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Cursor Glow ---------- */
  function initCursorGlow() {
    if (reduceMotion || isTouchDevice) return;
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let gx = mx, gy = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function animate() {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ---------- Mouse Trail ---------- */
  function initMouseTrail() {
    if (reduceMotion || isTouchDevice) return;
    let lastSpawn = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastSpawn < 40) return;
      lastSpawn = now;

      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      document.body.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        dot.style.transform = 'translate(-50%,-50%) scale(2.4)';
        dot.style.opacity = '0';
      });
      setTimeout(() => dot.remove(), 650);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorGlow();
    initMouseTrail();
  });
})();
