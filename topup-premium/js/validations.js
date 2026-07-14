/**
 * VALIDATION.JS
 * Helper validasi form sisi klien. Dipakai login, register, dan form top up.
 */
(function (global) {
  const RULES = {
    required: (v) => v.trim().length > 0 || 'Kolom ini wajib diisi',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Format email tidak valid',
    phone: (v) => /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(v.replace(/\s|-/g, '')) || 'Nomor WhatsApp tidak valid',
    minLength: (min) => (v) => v.length >= min || `Minimal ${min} karakter`,
    match: (otherVal, label = 'konfirmasi') => (v) => v === otherVal || `${label} tidak cocok`,
    numeric: (v) => /^[0-9]+$/.test(v) || 'Hanya boleh angka',
    gameId: (v) => /^[0-9]{5,15}$/.test(v) || 'User ID game tidak valid (5-15 digit angka)'
  };

  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#22e6d0', '#22c55e'];
    return { score, label: levels[score], color: colors[score] };
  }

  function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('input-error');
    const err = document.createElement('div');
    err.className = 'field-error-msg';
    err.style.cssText = 'color:#ef4444;font-size:0.76rem;margin-top:6px;';
    err.textContent = message;
    input.insertAdjacentElement('afterend', err);
  }

  function clearFieldError(input) {
    input.classList.remove('input-error');
    const next = input.nextElementSibling;
    if (next && next.classList.contains('field-error-msg')) next.remove();
  }

  /**
   * Validasi satu input dengan daftar rule.
   * rules: array of function(value) => true | errorMessage
   */
  function validateField(input, rules) {
    const value = input.value;
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        showFieldError(input, result);
        return false;
      }
    }
    clearFieldError(input);
    return true;
  }

  /**
   * Validasi seluruh form berdasarkan config: { '#idInput': [rules...] }
   */
  function validateForm(config) {
    let valid = true;
    Object.entries(config).forEach(([selector, rules]) => {
      const input = document.querySelector(selector);
      if (!input) return;
      const ok = validateField(input, rules);
      if (!ok) valid = false;
    });
    return valid;
  }

  global.Validation = {
    rules: RULES,
    passwordStrength,
    validateField,
    validateForm,
    showFieldError,
    clearFieldError
  };
})(window);
