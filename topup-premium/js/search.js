/**
 * SEARCH.JS
 * Pencarian game/produk realtime dengan debounce.
 * Mengambil data dari /api/topup.php?action=search&q=...
 * Fallback ke data lokal window.GAMES_CACHE bila API tidak tersedia (mis. saat demo statis).
 */
(function () {
  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  async function fetchResults(query) {
    try {
      const res = await fetch(`api/topup.php?action=search&q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('search failed');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      // Fallback lokal jika backend belum tersedia
      const local = (window.GAMES_CACHE || []);
      const q = query.toLowerCase();
      return local.filter((g) => g.name.toLowerCase().includes(q));
    }
  }

  function renderResults(container, items, query) {
    if (!items.length) {
      container.innerHTML = `<div class="search-result-empty">Tidak ada hasil untuk "${escapeHtml(query)}"</div>`;
      return;
    }
    container.innerHTML = items.map((item) => `
      <a href="pages/topup.html?game=${encodeURIComponent(item.slug)}" class="search-result-item">
        <img src="${item.logo || 'assets/images/placeholder-game.png'}" alt="${escapeHtml(item.name)}" loading="lazy">
        <div>
          <div style="font-weight:600;font-size:0.88rem;">${highlightMatch(item.name, query)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(item.publisher || '')}</div>
        </div>
      </a>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const safe = escapeHtml(text);
    const idx = safe.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return safe;
    return safe.slice(0, idx) + '<span style="color:var(--neon-blue);">' + safe.slice(idx, idx + query.length) + '</span>' + safe.slice(idx + query.length);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const resultsBox = document.getElementById('search-results');
    if (!input || !resultsBox) return;

    const runSearch = debounce(async (value) => {
      if (value.trim().length === 0) {
        resultsBox.classList.remove('open');
        return;
      }
      resultsBox.innerHTML = `<div class="search-result-empty">Mencari...</div>`;
      resultsBox.classList.add('open');
      const items = await fetchResults(value.trim());
      renderResults(resultsBox, items, value.trim());
    }, 320);

    input.addEventListener('input', (e) => runSearch(e.target.value));
    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) resultsBox.classList.add('open');
    });

    document.addEventListener('click', (e) => {
      if (!resultsBox.contains(e.target) && e.target !== input) {
        resultsBox.classList.remove('open');
      }
    });
  });
})();
