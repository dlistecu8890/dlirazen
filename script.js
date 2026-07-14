/**
 * SCRIPT.JS
 * Logika khusus halaman index.html: render kategori, game populer,
 * game terbaru, flash sale countdown, testimoni, FAQ, dan statistik.
 * Data diambil dari api/topup.php; bila gagal (mis. dijalankan tanpa server PHP),
 * dipakai data cache lokal supaya tampilan tetap hidup untuk preview.
 */

/* Data cache lokal - dipakai sebagai fallback demo & oleh search.js */
window.GAMES_CACHE = [
  { slug: 'mobile-legends', name: 'Mobile Legends: Bang Bang', publisher: 'Moonton', logo: 'assets/images/games/mobile-legends.jpg', popular: true },
  { slug: 'free-fire', name: 'Free Fire', publisher: 'Garena', logo: 'assets/images/games/free-fire.jpg', popular: true },
  { slug: 'pubg-mobile', name: 'PUBG Mobile', publisher: 'Krafton', logo: 'assets/images/games/pubg-mobile.jpg', popular: true },
  { slug: 'valorant', name: 'Valorant', publisher: 'Riot Games', logo: 'assets/images/games/valorant.jpg', popular: true },
  { slug: 'honor-of-kings', name: 'Honor of Kings', publisher: 'TiMi Studio', logo: 'assets/images/games/honor-of-kings.jpg', isNew: true },
  { slug: 'genshin-impact', name: 'Genshin Impact', publisher: 'HoYoverse', logo: 'assets/images/games/genshin-impact.jpg', popular: true },
  { slug: 'honkai-star-rail', name: 'Honkai: Star Rail', publisher: 'HoYoverse', logo: 'assets/images/games/honkai-star-rail.jpg', isNew: true },
  { slug: 'delta-force', name: 'Delta Force', publisher: 'Garena', logo: 'assets/images/games/delta-force.jpg', isNew: true },
  { slug: 'blood-strike', name: 'Blood Strike', publisher: 'NetEase', logo: 'assets/images/games/blood-strike.jpg', isNew: true },
  { slug: 'call-of-duty-mobile', name: 'Call of Duty Mobile', publisher: 'Activision', logo: 'assets/images/games/cod-mobile.jpg', popular: true },
  { slug: 'roblox', name: 'Roblox', publisher: 'Roblox Corp', logo: 'assets/images/games/roblox.jpg', popular: true },
  { slug: 'steam-wallet', name: 'Steam Wallet', publisher: 'Valve', logo: 'assets/images/games/steam-wallet.jpg' },
  { slug: 'google-play', name: 'Google Play Gift Card', publisher: 'Google', logo: 'assets/images/games/google-play.jpg' },
  { slug: 'garena-shell', name: 'Garena Shell', publisher: 'Garena', logo: 'assets/images/games/garena-shell.jpg' }
];

const CATEGORIES = [
  { icon: '🎮', label: 'Semua', filter: 'all' },
  { icon: '📱', label: 'Mobile Game', filter: 'mobile-game' },
  { icon: '💻', label: 'PC Game', filter: 'pc-game' },
  { icon: '🎁', label: 'Voucher Digital', filter: 'voucher-digital' },
  { icon: '💳', label: 'Tagihan', filter: 'tagihan-isi-ulang' }
];

const TESTIMONIALS = [
  { name: 'Rizky A.', game: 'Mobile Legends', rating: 5, text: 'Diamond masuk kurang dari 1 menit, harga juga paling bersaing dibanding tempat lain.' },
  { name: 'Dinda P.', game: 'Genshin Impact', rating: 5, text: 'Tampilan websitenya keren banget, proses checkout juga simpel gak ribet.' },
  { name: 'Fajar S.', game: 'Valorant', rating: 4, text: 'Pembayaran QRIS langsung kebaca otomatis, gak perlu upload bukti transfer lagi.' },
  { name: 'Nabila K.', game: 'Free Fire', rating: 5, text: 'Sudah langganan top up di sini dari tahun lalu, selalu aman dan cepat.' }
];

const FAQS = [
  { q: 'Berapa lama proses top up selesai?', a: 'Sebagian besar transaksi diproses otomatis dalam hitungan detik hingga 5 menit setelah pembayaran dikonfirmasi.' },
  { q: 'Apakah data akun saya aman?', a: 'Kami hanya memerlukan User ID dan Server ID, tidak pernah meminta password akun game Anda.' },
  { q: 'Bagaimana jika transaksi gagal tapi saldo terpotong?', a: 'Silakan hubungi tim bantuan kami dengan menyertakan nomor invoice, dana akan dikembalikan maksimal 1x24 jam.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami mendukung QRIS, e-wallet (DANA, OVO, GoPay, ShopeePay), virtual account bank, dan gerai retail (Alfamart, Indomaret).' }
];

function renderCategories() {
  const wrap = document.getElementById('category-list');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map((c, i) => `
    <div class="category-chip ${i === 0 ? 'active' : ''}" data-filter="${c.filter}">
      <span class="cat-icon">${c.icon}</span>
      <span class="cat-label">${c.label}</span>
    </div>
  `).join('');

  wrap.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      wrap.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

function gameCardHtml(game) {
  const badge = game.popular ? '<span class="game-card-badge">Populer</span>'
    : game.isNew ? '<span class="game-card-badge badge-new">Baru</span>' : '';
  return `
    <a href="pages/topup.html?game=${encodeURIComponent(game.slug)}" class="game-card tilt-card" data-reveal="zoom">
      <div class="game-card-image">
        <img src="${game.logo}" alt="${game.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop'">
        <div class="game-card-overlay"></div>
        ${badge}
        <div class="game-card-info">
          <div class="game-card-title">${game.name}</div>
          <div class="game-card-publisher">${game.publisher}</div>
        </div>
      </div>
      <div class="game-card-border"></div>
    </a>
  `;
}

function renderGames() {
  const popularWrap = document.getElementById('popular-games');
  const newWrap = document.getElementById('new-games');
  if (popularWrap) {
    popularWrap.innerHTML = window.GAMES_CACHE.filter((g) => g.popular).map(gameCardHtml).join('');
  }
  if (newWrap) {
    newWrap.innerHTML = window.GAMES_CACHE.filter((g) => g.isNew).map(gameCardHtml).join('');
  }
  // Re-init tilt & reveal untuk elemen yang baru dirender
  if (window.reinitCardEffects) window.reinitCardEffects();
}

function renderTestimonials() {
  const wrap = document.getElementById('testimonial-list');
  if (!wrap) return;
  wrap.innerHTML = TESTIMONIALS.map((t) => `
    <div class="glass-card testi-card hover-lift" data-reveal="fade-up">
      <div class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testi-text">"${t.text}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-game">${t.game}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFaq() {
  const wrap = document.getElementById('faq-list');
  if (!wrap) return;
  wrap.innerHTML = FAQS.map((f, i) => `
    <div class="glass-card faq-item" data-reveal="fade-up">
      <div class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.a}</div>
      </div>
    </div>
  `).join('');
}

/* ---------- Flash Sale Countdown ---------- */
function initFlashSaleCountdown() {
  const el = document.getElementById('flash-countdown');
  if (!el) return;
  const end = new Date();
  end.setHours(end.getHours() + 6, 30, 0, 0);

  function tick() {
    const now = new Date();
    let diff = Math.max(0, end - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown-box"><div class="cd-num">${String(h).padStart(2, '0')}</div><div class="cd-label">Jam</div></div>
      <div class="countdown-box"><div class="cd-num">${String(m).padStart(2, '0')}</div><div class="cd-label">Menit</div></div>
      <div class="countdown-box"><div class="cd-num">${String(s).padStart(2, '0')}</div><div class="cd-label">Detik</div></div>
    `;
  }
  tick();
  setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderGames();
  renderTestimonials();
  renderFaq();
  initFlashSaleCountdown();
});
