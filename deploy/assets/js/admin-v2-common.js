const API_BASE = (() => {
  const script = document.currentScript ||
    document.querySelector('script[src*="admin-v2-common"]');
  if (script && script.src) {
    const pathname = new URL(script.src).pathname;
    return pathname.replace(/\/assets\/js\/[^/]+$/, '') + '/api';
  }
  // Fallback: remonter d'un niveau depuis /admin/
  const base = window.location.pathname.replace(/\/admin\/[^/]*$/, '').replace(/\/admin$/, '');
  return (base || '') + '/api';
})();

// ==========================================
// AUTH helpers
// ==========================================

function getAdminToken() {
  return localStorage.getItem('admin_token') || '';
}

function logout() {
  localStorage.removeItem('admin_token');
  const loginUrl = new URL('login.html', window.location.href).href;
  window.location.replace(loginUrl);
}

// Redirect to login if no token (skip on login page itself)
if (document.body.getAttribute('data-admin-page') !== 'login') {
  if (!getAdminToken()) {
    const loginUrl = new URL('login.html', window.location.href).href;
    window.location.replace(loginUrl);
  }
}

// ==========================================
// API fetch
// ==========================================

async function apiFetch(path, options = {}) {
  const token = getAdminToken();
  const response = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401) {
    logout();
    return; // unreachable but keeps the flow clear
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || ('Erreur API: ' + response.status));
  }

  return payload;
}

function parseDate(input) {
  if (!input) return '';
  return new Date(input).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toApiDatetime(value) {
  if (!value) return null;
  return String(value).replace('T', ' ') + ':00';
}

function toInputDatetime(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}

function setStatus(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('is-error', 'is-ok');
  el.classList.add(isError ? 'is-error' : 'is-ok');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatStatusLabel(status) {
  const key = String(status || '').toLowerCase();
  const labels = {
    published: 'Publie',
    draft: 'Brouillon',
    archived: 'Archive',
    cancelled: 'Annule',
  };
  return labels[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Inconnu');
}

function badgeMarkup(status) {
  const key = String(status || 'draft').toLowerCase();
  return `<span class="badge ${escapeHtml(key)}">${escapeHtml(formatStatusLabel(key))}</span>`;
}

function getPageKey() {
  return document.body.getAttribute('data-admin-page') || '';
}

function activateNav() {
  const page = getPageKey();
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-nav') === page);
  });
}

// Résout une URL d'image (typiquement /assets/media/uploads/...) en chemin
// utilisable depuis une page admin (qui vit dans /admin/). On retourne un
// chemin relatif `../...` pour que ça fonctionne quel que soit le sous-dossier
// d'hébergement.
function normalizePublicImageUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return '../' + value.replace(/^\/+/, '');
}

window.AdminV2 = {
  apiFetch,
  parseDate,
  toApiDatetime,
  toInputDatetime,
  setStatus,
  escapeHtml,
  formatStatusLabel,
  badgeMarkup,
  activateNav,
  normalizePublicImageUrl,
  logout,
  getAdminToken,
};
