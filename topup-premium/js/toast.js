/**
 * TOAST.JS
 * Sistem notifikasi toast global. Dipakai di seluruh halaman.
 * Usage: Toast.show('Pesan', 'success' | 'error' | 'warning' | 'info', 4000)
 */
(function (global) {
  const ICONS = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i'
  };

  const COLORS = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#fbbf24',
    info: '#00d9ff'
  };

  let container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = [
      'position:fixed', 'top:96px', 'right:20px', 'z-index:10000',
      'display:flex', 'flex-direction:column', 'gap:10px',
      'max-width:360px', 'width:calc(100% - 40px)'
    ].join(';');
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const el = ensureContainer();
    const toast = document.createElement('div');
    const color = COLORS[type] || COLORS.info;

    toast.style.cssText = [
      'display:flex', 'align-items:center', 'gap:12px',
      'background:rgba(14,14,26,0.92)', 'backdrop-filter:blur(14px)',
      `border:1px solid ${color}55`, 'border-left:4px solid ' + color,
      'border-radius:14px', 'padding:14px 16px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.5)',
      'animation:toastIn 0.35s cubic-bezier(0.16,1,0.3,1)',
      'color:#f2f4fb', 'font-size:0.88rem', 'font-family:Inter,sans-serif'
    ].join(';');

    toast.innerHTML = `
      <span style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:${color}22;color:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.8rem;">${ICONS[type] || ICONS.info}</span>
      <span style="flex:1;line-height:1.4;">${message}</span>
      <button aria-label="Tutup" style="flex-shrink:0;color:#6b7094;font-size:1.1rem;line-height:1;cursor:pointer;">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    const remove = () => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 280);
    };
    closeBtn.addEventListener('click', remove);

    el.appendChild(toast);
    if (duration > 0) setTimeout(remove, duration);
    return toast;
  }

  global.Toast = {
    show,
    success: (msg, d) => show(msg, 'success', d),
    error: (msg, d) => show(msg, 'error', d),
    warning: (msg, d) => show(msg, 'warning', d),
    info: (msg, d) => show(msg, 'info', d)
  };
})(window);
