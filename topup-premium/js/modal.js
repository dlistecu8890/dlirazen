/**
 * MODAL.JS
 * Sistem modal dialog reusable.
 * Usage: Modal.open({ title, content, footer, size }) -> returns handle {close}
 *        Modal.confirm({ title, message, onConfirm })
 */
(function (global) {
  let overlay = null;
  let panel = null;
  let activeCloseHandler = null;

  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:10050',
      'background:rgba(4,4,10,0.72)', 'backdrop-filter:blur(6px)',
      'display:none', 'align-items:center', 'justify-content:center',
      'padding:20px', 'animation:modalBackdropIn 0.25s ease'
    ].join(';');

    panel = document.createElement('div');
    panel.className = 'modal-panel glass-card';
    panel.style.cssText = [
      'width:100%', 'max-width:440px', 'padding:28px',
      'animation:modalPanelIn 0.32s cubic-bezier(0.16,1,0.3,1)',
      'max-height:88vh', 'overflow-y:auto', 'position:relative'
    ].join(';');

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') close();
    });
  }

  function open({ title = '', content = '', footer = '', size = 'md', onClose = null } = {}) {
    ensureDom();
    const maxWidth = size === 'sm' ? '360px' : size === 'lg' ? '640px' : '440px';
    panel.style.maxWidth = maxWidth;
    panel.innerHTML = `
      <button class="modal-close" aria-label="Tutup" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);color:#a3a8c3;font-size:1.1rem;">&times;</button>
      ${title ? `<h3 style="font-family:'Sora',sans-serif;font-size:1.25rem;margin-bottom:16px;padding-right:24px;">${title}</h3>` : ''}
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer" style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">${footer}</div>` : ''}
    `;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    activeCloseHandler = onClose;
    panel.querySelector('.modal-close').addEventListener('click', close);

    return { close, panel };
  }

  function close() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (typeof activeCloseHandler === 'function') activeCloseHandler();
    activeCloseHandler = null;
  }

  function confirm({ title = 'Konfirmasi', message = '', confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', danger = false, onConfirm = () => {} } = {}) {
    ensureDom();
    const btnClass = danger ? 'btn-outline' : 'btn-primary';
    const handle = open({
      title,
      content: `<p style="color:#a3a8c3;font-size:0.92rem;line-height:1.6;">${message}</p>`,
      footer: `
        <button class="btn btn-ghost btn-sm" id="modal-cancel-btn">${cancelText}</button>
        <button class="btn ${btnClass} btn-sm" id="modal-confirm-btn">${confirmText}</button>
      `
    });
    panel.querySelector('#modal-cancel-btn').addEventListener('click', close);
    panel.querySelector('#modal-confirm-btn').addEventListener('click', () => {
      close();
      onConfirm();
    });
    return handle;
  }

  global.Modal = { open, close, confirm };
})(window);
