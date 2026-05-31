window.PublicUtils = (() => {
  const APP_BASE_PATH = (() => {
    const script = document.currentScript;
    const scriptSrc = script && script.getAttribute('src') ? script.getAttribute('src') : '';

    if (scriptSrc) {
      const pathname = new URL(scriptSrc, window.location.href).pathname;
      return pathname.replace(/\/assets\/js\/[^/]+$/, '');
    }

    const pathname = window.location.pathname || '/';
    let dir = pathname.replace(/\/[^/]*$/, '');
    if (!dir || dir === '/') {
      return '';
    }

    if (dir.endsWith('/admin')) {
      dir = dir.slice(0, -('/admin'.length));
    }

    return dir && dir !== '/' ? dir : '';
  })();

  function withBasePath(path) {
    const value = String(path || '').trim();
    if (!value) {
      return APP_BASE_PATH || '';
    }

    if (!APP_BASE_PATH) {
      return value;
    }

    if (value === APP_BASE_PATH || value.startsWith(APP_BASE_PATH + '/')) {
      return value;
    }

    return APP_BASE_PATH + (value.startsWith('/') ? value : '/' + value);
  }

  function apiBaseUrl() {
    return withBasePath('/api');
  }

  function normalizePublicUrl(url, fallback = '') {
    const value = String(url || '').trim();
    if (!value) {
      return fallback;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('/')) {
      return withBasePath(value);
    }

    return withBasePath('/' + value.replace(/^\/+/, ''));
  }

  function formatDateLong(value, options = {}) {
    const { fallback = 'Date a confirmer', upper = false } = options;
    if (!value) {
      return upper ? fallback.toUpperCase() : fallback;
    }

    const formatted = new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return upper ? formatted.toUpperCase() : formatted;
  }

  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(minutes) {
    if (!minutes || Number.isNaN(Number(minutes))) {
      return 'Durée : -';
    }

    const total = Number(minutes);
    const hours = Math.floor(total / 60);
    const remaining = total % 60;

    if (hours === 0) {
      return `Durée : ${remaining} min`;
    }

    if (remaining === 0) {
      return `Durée : ${hours}h`;
    }

    return `Durée : ${hours}h${String(remaining).padStart(2, '0')}`;
  }

  function familyMeta(familyCode) {
    if (familyCode === 'thematique') {
      return {
        className: 'walk-tag-theme',
        agendaClassName: 'agenda-tag-theme',
        icon: '/img/Icon_theme.svg',
      };
    }

    if (familyCode === 'naturaliste') {
      return {
        className: 'walk-tag-natural',
        agendaClassName: 'agenda-tag-natural',
        icon: '/img/Icon_naturaliste.svg',
      };
    }

    return {
      className: 'walk-tag-discovery',
      agendaClassName: 'agenda-tag-discovery',
      icon: '/img/Icon_mountain.svg',
    };
  }

  function buildWalkCardMarkup(item, index = 0, options = {}) {
    const placeholders = ['/img/Map-bgr-01.png', '/img/Path_line.png', '/img/logo.png'];
    const cover = normalizePublicUrl(item.cover_image_url, placeholders[index % placeholders.length]);
    const detailUrl = item.slug ? `promenade.html?slug=${encodeURIComponent(item.slug)}` : 'catalogue.html';
    const family = familyMeta(item.family_code);
    const cardClassName = String(options.cardClassName || '').trim();

    return `
      <article class="agenda-card ${cardClassName}">
        <div class="agenda-visual" style="--agenda-image:url('${cover}')">
          <div class="agenda-tag ${family.agendaClassName}"><img src="${family.icon}" alt="" aria-hidden="true">${item.family_label || ''}</div>
          <h3 class="agenda-event-title">${item.title || 'Visite guidée'}</h3>
          <p class="agenda-place">${item.place_name || 'Lieu a confirmer'}</p>
        </div>
        <div class="agenda-content">
          <div class="agenda-meta">
            <p class="agenda-date">${formatDateLong(item.next_date)}</p>
            <p class="agenda-duration">${formatDuration(item.duration_minutes)}</p>
          </div>
          <p class="agenda-copy">${item.summary || 'Description bientot disponible.'}</p>
          <div class="agenda-actions">
            <a class="agenda-cta agenda-cta-primary" href="${detailUrl}">Réservez une date</a>
            <div class="agenda-price-wrap">
              <p class="agenda-price-hint">a partir de</p>
              <p class="agenda-price">${item.price_label || 'Prix sur demande'}</p>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function buildReserveCardMarkup(item, fallbackImage = '/img/chouette.jpg') {
    const image = normalizePublicUrl(item.cover_image_url, fallbackImage);
    const title = item.name_fr || 'Réserve naturelle';
    const slug = item.slug || '';
    const detailsUrl = slug ? `reserve-detail.html?slug=${encodeURIComponent(slug)}` : 'reserve-detail.html';

    return `
      <article class="reserve-card" style="--reserve-image:url('${image}')">
        <div class="reserve-card-content">
          <h3 class="reserve-name">${title}</h3>
          <a class="reserve-cta" href="${detailsUrl}">Decouvrez la reserve</a>
        </div>
      </article>
    `;
  }

  return {
    appBasePath: APP_BASE_PATH,
    apiBaseUrl,
    normalizePublicUrl,
    formatDateLong,
    formatDateTime,
    formatDuration,
    familyMeta,
    buildWalkCardMarkup,
    buildReserveCardMarkup,
  };
})();
