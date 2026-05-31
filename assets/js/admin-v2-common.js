const API_BASE = '../api';

async function apiFetch(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

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
};
