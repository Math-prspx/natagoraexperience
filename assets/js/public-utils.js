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
        icon: '/img/Icon_theme-white.svg',
      };
    }

    return {
      className: 'walk-tag-discovery',
      agendaClassName: 'agenda-tag-discovery',
      icon: '/img/Icon_mountain-white.svg',
    };
  }

  function buildWalkCardMarkup(item, index = 0, options = {}) {
    const placeholders = ['/img/Map-bgr-01.png', '/img/Path_line.png', '/img/logo.png'];
    const cover = normalizePublicUrl(item.cover_image_url, placeholders[index % placeholders.length]);
    const detailUrl = item.slug ? `promenade.html?slug=${encodeURIComponent(item.slug)}` : 'catalogue.html';
    const family = familyMeta(item.family_code);
    const familyIcon = normalizePublicUrl(family.icon);
    const cardClassName = String(options.cardClassName || '').trim();

    return `
      <article class="agenda-card ${cardClassName}">
        <div class="agenda-visual" style="--agenda-image:url('${cover}')">
          <div class="agenda-tag ${family.agendaClassName}"><img src="${familyIcon}" alt="" aria-hidden="true">${item.family_label || ''}</div>
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
  /* =========================================================================
     Composant Nav + Overlay (single source of truth)
     - Injection dans le placeholder <div id="site-nav-root" data-cta-label="..." data-cta-href="..."></div>
     - Auto-init au DOMContentLoaded si le placeholder est présent.
     - Peut être appelé manuellement : window.PublicUtils.renderSiteNav({ ctaLabel, ctaHref, root })
     ========================================================================= */

  const NAV_OVERLAY_ICONS = {
    decouverte: `<svg class="overlay-main-link-icon-svg" viewBox="0 0 103 103" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <path d="M5.84216 51.6819C9.73441 43.303 18.3779 28.5536 26.6171 19.1769C29.6031 15.7788 34.6941 15.7788 37.6801 19.1769C45.9195 28.5536 54.5629 43.303 58.455 51.6819" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M39.45 21.262C44.3014 14.6748 49.4649 8.4566 54.4222 3.81574C57.3903 1.03701 61.9114 1.03701 64.8795 3.81574C65.525 4.42 66.174 5.051 66.8252 5.70607" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M94.3274 51.6807C98.2897 51.6807 101.556 54.8853 100.996 58.7766C97.5241 82.93 76.5885 101.5 51.2805 101.5C25.9725 101.5 5.03671 82.93 1.5646 58.7766C1.00523 54.8853 4.27117 51.6807 8.23352 51.6807H94.3274Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31.0076 51.6807C33.3881 55.7604 34.1888 60.1754 32.1486 64.7286C30.0649 69.3798 26.1653 71.1038 22.2298 72.8437C17.9842 74.7209 13.6969 76.6164 11.6028 82.2251" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M52.3034 51.6807C51.9499 63.268 59.6986 65.306 66.3682 67.0601C70.3386 68.1045 73.9265 69.0482 75.1955 71.8457C76.1298 74.6263 74.0722 77.0447 71.7249 79.8037C68.064 84.1067 63.6981 89.238 68.8771 97.8634" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M85.6432 2.16639C80.7376 7.47895 75.1664 17.7297 72.804 23.2825C72.804 23.2825 74.0103 23.7988 78.4719 24.129C76.0849 28.5646 74.0196 33.0758 72.804 36.219C72.804 36.219 75.4134 37.4469 87.153 37.4469C98.8926 37.4469 101.502 36.219 101.502 36.219C100.286 33.0758 98.2211 28.5646 95.8341 24.129C100.296 23.7988 101.502 23.2825 101.502 23.2825C99.1397 17.7297 93.5684 7.47895 88.6628 2.16639C87.8422 1.27787 86.4638 1.27787 85.6432 2.16639Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M87.1528 37.4466V51.6807" stroke="black" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    thematique: `<svg class="overlay-main-link-icon-svg" viewBox="0 0 103 103" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <path d="M36.2105 3.88095C41.0295 2.33483 46.1674 1.5 51.5 1.5C56.8326 1.5 61.9705 2.33483 66.7895 3.88095M100.594 41.9762C101.189 45.0593 101.5 48.2433 101.5 51.5C101.5 79.1143 79.1143 101.5 51.5 101.5C23.8857 101.5 1.5 79.1143 1.5 51.5C1.5 48.2433 1.81136 45.0593 2.40593 41.9762" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M51.5 89.5953C63.9776 89.5953 74.5872 81.5967 78.481 70.4474C80.0586 65.93 75.4226 62.2957 70.7129 63.14C65.61 64.0548 58.8434 64.92 51.5 64.92C44.1567 64.92 37.39 64.0548 32.2872 63.14C27.5774 62.2957 22.9415 65.93 24.5191 70.4474C28.4129 81.5967 39.0224 89.5953 51.5 89.5953Z" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M77.8381 5.15949C78.605 3.08582 81.5378 3.08585 82.3045 5.15949L87.6476 19.61L99.5992 25.5597C101.359 26.4357 101.359 28.9464 99.5992 29.8226L87.6476 35.7724L82.3045 50.2226C81.5378 52.2964 78.605 52.2964 77.8381 50.2226L72.4952 35.7724L60.5433 29.8226C58.7835 28.9464 58.7835 26.4357 60.5433 25.5597L72.4952 19.61L77.8381 5.15949Z" stroke="black" stroke-width="3" stroke-linejoin="round"/>
      <path d="M25.1616 5.15949C24.3949 3.08582 21.4621 3.08585 20.6952 5.15949L15.3523 19.61L3.40051 25.5597C1.64066 26.4357 1.64066 28.9464 3.40051 29.8226L15.3523 35.7724L20.6952 50.2226C21.4621 52.2964 24.3949 52.2964 25.1616 50.2226L30.5047 35.7724L42.4563 29.8226C44.2161 28.9464 44.2161 26.4357 42.4563 25.5597L30.5047 19.61L25.1616 5.15949Z" stroke="black" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,

    surmesure: `<svg class="overlay-main-link-icon-svg" viewBox="0 0 103 103" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <path d="M80.9595 61.8175C81.9288 58.7584 82.4524 55.4949 82.4524 52.1069C82.4524 34.6772 68.5945 20.5476 51.5 20.5476C34.4055 20.5476 20.5476 34.6772 20.5476 52.1069C20.5476 55.4949 21.0712 58.7584 22.0405 61.8175" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50.7063 1.5V9.43651" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M101.5 52.2936H93.5635" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.84921 52.2936H1.5" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.5476 20.5476L15.7857 15.7857" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M82.4524 20.5476L87.2143 15.7857" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1.5 101.5C5.99943 101.5 10.4989 100.265 14.4049 97.7953C16.634 96.3857 19.6993 96.3857 21.9283 97.7953C25.8345 100.265 30.3338 101.5 34.8333 101.5C39.3329 101.5 43.8321 100.265 47.7383 97.7953C49.9674 96.3857 53.0326 96.3857 55.2617 97.7953C59.1679 100.265 63.6671 101.5 68.1667 101.5C72.6662 101.5 77.1655 100.265 81.0717 97.7953C83.3007 96.3857 86.3659 96.3857 88.595 97.7953C92.5012 100.265 97.0005 101.5 101.5 101.5" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1.5 82.4524C5.99943 82.4524 10.4989 81.2174 14.4049 78.7477C16.634 77.3381 19.6993 77.3381 21.9283 78.7477C25.8345 81.2174 30.3338 82.4524 34.8333 82.4524C39.3329 82.4524 43.8321 81.2174 47.7383 78.7477C49.9674 77.3381 53.0326 77.3381 55.2617 78.7477C59.1679 81.2174 63.6671 82.4524 68.1667 82.4524C72.6662 82.4524 77.1655 81.2174 81.0717 78.7477C83.3007 77.3381 86.3659 77.3381 88.595 78.7477C92.5012 81.2174 97.0005 82.4524 101.5 82.4524" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  };

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  function navMarkup({ ctaLabel, ctaHref, logoSrc }) {
    return `
  <nav class="hero-nav" aria-label="Navigation principale">
    <a class="nav-brand" href="index.html" aria-label="Accueil Natagora Xperience">
      <img src="${escapeHtml(logoSrc)}" alt="Logo Natagora Xperience">
    </a>
    <div class="nav-actions">
      <a class="nav-cta" href="${escapeHtml(ctaHref)}">${escapeHtml(ctaLabel)}</a>
      <button class="hamburger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="overlay-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div id="overlay-backdrop" class="overlay-backdrop" aria-hidden="true"></div>
  <div id="overlay-nav" class="overlay-nav hidden" aria-hidden="true">
    <button id="close-overlay" class="overlay-close" type="button" aria-label="Fermer le menu">&times;</button>
    <div class="overlay-nav-content">
      <div class="overlay-nav-links-left">
        <a class="overlay-main-link" href="catalogue.html?family=decouverte">
          <span class="overlay-main-link-icon" aria-hidden="true">${NAV_OVERLAY_ICONS.decouverte}</span>
          Découverte
        </a>
        <a class="overlay-main-link" href="catalogue.html?family=thematique">
          <span class="overlay-main-link-icon" aria-hidden="true">${NAV_OVERLAY_ICONS.thematique}</span>
          Thématique
        </a>
        <a class="overlay-main-link" href="sur-mesure.html">
          <span class="overlay-main-link-icon" aria-hidden="true">${NAV_OVERLAY_ICONS.surmesure}</span>
          Sur mesure
        </a>
      </div>
      <div class="overlay-nav-links-right">
        <a class="overlay-secondary-link" href="reserves.html">Les réserves</a>
        <a class="overlay-secondary-link" href="a-propos.html">À propos</a>
        <a class="overlay-secondary-link" href="en-pratique.html">En pratique</a>
        <a class="overlay-secondary-link" href="contact.html">Contact</a>
      </div>
    </div>
  </div>`;
  }

  function bindNavBehavior(rootScope) {
    const scope = rootScope || document;
    const hamburger = scope.querySelector('.hamburger');
    const overlayNav = document.getElementById('overlay-nav');
    const overlayBackdrop = document.getElementById('overlay-backdrop');
    const closeOverlay = document.getElementById('close-overlay');

    if (!hamburger || !overlayNav || !overlayBackdrop || !closeOverlay) {
      return;
    }

    const overlayLinks = overlayNav.querySelectorAll('a');

    const open = () => {
      overlayNav.classList.remove('hidden');
      overlayNav.classList.add('show');
      overlayBackdrop.classList.add('show');
      hamburger.setAttribute('aria-expanded', 'true');
      overlayNav.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      closeOverlay.focus();
    };

    const close = () => {
      overlayNav.classList.remove('show');
      overlayNav.classList.add('hidden');
      overlayBackdrop.classList.remove('show');
      hamburger.setAttribute('aria-expanded', 'false');
      overlayNav.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      hamburger.focus();
    };

    hamburger.addEventListener('click', open);
    closeOverlay.addEventListener('click', close);
    overlayBackdrop.addEventListener('click', close);
    overlayLinks.forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlayNav.classList.contains('show')) {
        close();
      }
    });
  }

  function renderSiteNav(options = {}) {
    const root = options.root || document.getElementById('site-nav-root');
    if (!root) {
      return;
    }
    const ctaLabel = options.ctaLabel || root.dataset.ctaLabel || "Découvrir l'expérience";
    const ctaHref = options.ctaHref || root.dataset.ctaHref || 'catalogue.html';
    const logoSrc = options.logoSrc || root.dataset.logoSrc || 'img/logo.png';

    root.innerHTML = navMarkup({ ctaLabel, ctaHref, logoSrc });
    bindNavBehavior(root);
  }

  // Auto-init au DOMContentLoaded si le placeholder est présent
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderSiteNav();
      updateFooterYear();
    });
  } else {
    renderSiteNav();
    updateFooterYear();
  }

  function updateFooterYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.footer-copyright').forEach((el) => {
      el.textContent = '© ' + year + ' Natagora, tous droits réservés';
    });
  }

  /* =========================================================================
     Helpers UX : debounce + skeletons + aria-busy
     ========================================================================= */

  function debounce(fn, delay = 250) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function renderSkeletons(container, count = 3, className = 'skeleton skeleton-card') {
    if (!container) return;
    container.innerHTML = Array.from({ length: count })
      .map(() => `<div class="${className}" aria-hidden="true"></div>`)
      .join('');
  }

  async function withLoadingState(target, asyncFn, { skeletonCount = 3 } = {}) {
    if (!target) {
      return asyncFn();
    }
    target.setAttribute('aria-busy', 'true');
    target.classList.add('is-loading');
    if (skeletonCount > 0 && target.children.length === 0) {
      renderSkeletons(target, skeletonCount);
    }
    try {
      return await asyncFn();
    } finally {
      target.setAttribute('aria-busy', 'false');
      target.classList.remove('is-loading');
    }
  }

  /* Reveal-on-scroll : observer global. Usage :
     - PublicUtils.revealOnScroll(element|selector) : tag + observe
     - PublicUtils.revealAll(scope, selector) : tag + observe en masse */
  let _revealObserver = null;
  function _getRevealObserver() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    if (!('IntersectionObserver' in window)) return null;
    if (!_revealObserver) {
      _revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            _revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    }
    return _revealObserver;
  }

  function revealOnScroll(elOrSelector, scope = document) {
    const observer = _getRevealObserver();
    const elements = typeof elOrSelector === 'string'
      ? Array.from(scope.querySelectorAll(elOrSelector))
      : [elOrSelector].filter(Boolean);

    elements.forEach((el) => {
      el.classList.add('reveal');
      if (!observer) {
        el.classList.add('is-visible');
        return;
      }
      observer.observe(el);
    });
  }

  function revealAll(scope = document, selector = '.formules-head, .formula-card, .reserves-content, .reserve-card, .agenda-head, .agenda-card, .resources-head, .resource-card, .content-section, .detail-card') {
    revealOnScroll(selector, scope);
  }

  /* États vide / erreur unifiés.
     Usage : renderStateMessage(container, { title, text, variant: 'empty'|'error', onRetry: fn }) */
  const STATE_ICONS = {
    empty: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M8 13c1 1 2.5 1.5 4 1.5S15 14 16 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="15" cy="10" r="0.8" fill="currentColor"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16.5" r="0.9" fill="currentColor"/></svg>'
  };

  function renderStateMessage(container, options = {}) {
    if (!container) return;
    const {
      title = '',
      text = '',
      variant = 'empty',
      onRetry = null,
      retryLabel = 'Réessayer'
    } = options;
    const icon = STATE_ICONS[variant] || STATE_ICONS.empty;
    const variantClass = variant === 'error' ? ' state-message-error' : '';
    const titleHtml = title ? '<p class="state-message-title">' + escapeHtml(title) + '</p>' : '';
    const textHtml = text ? '<p class="state-message-text">' + escapeHtml(text) + '</p>' : '';
    container.innerHTML =
      '<div class="state-message' + variantClass + '" role="status">' +
      '<span class="state-message-icon">' + icon + '</span>' +
      titleHtml +
      textHtml +
      (onRetry ? '<button type="button" class="state-message-retry">' + escapeHtml(retryLabel) + '</button>' : '') +
      '</div>';
    if (onRetry) {
      const btn = container.querySelector('.state-message-retry');
      if (btn) btn.addEventListener('click', onRetry);
    }
  }

  /* =========================================================================
     Multi-select dropdown personnalisé.
     Usage : createMultiSelect(container, { label, options: [{value,label}], values: [], searchable: false, onChange })
     - values est mis à jour en interne ; lire via api.getValues()
     - api.setOptions(newOptions) pour rafraîchir la liste
     - Singleton clickOutside handler partagé
     ========================================================================= */
  const _openDropdowns = new Set();
  document.addEventListener('click', (e) => {
    _openDropdowns.forEach((api) => {
      if (!api.root.contains(e.target)) api.close();
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      _openDropdowns.forEach((api) => api.close());
    }
  });

  function createMultiSelect(container, config = {}) {
    if (!container) return null;
    const {
      label = '',
      placeholder = 'Tous',
      options = [],
      values = [],
      searchable = false,
      onChange = null,
      single = false
    } = config;

    let _options = options.slice();
    let _values = single ? (values[0] ? [values[0]] : []) : values.slice();
    let _isOpen = false;
    let _searchQuery = '';

    container.innerHTML =
      '<div class="ms-root">' +
      (label ? '<span class="ms-label">' + escapeHtml(label) + '</span>' : '') +
      '<button type="button" class="ms-trigger" aria-haspopup="listbox" aria-expanded="false">' +
        '<span class="ms-trigger-text"></span>' +
        '<span class="ms-trigger-chevron" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div class="ms-panel" role="listbox" hidden>' +
        (searchable ? '<input type="text" class="ms-search" placeholder="Rechercher..." aria-label="Rechercher">' : '') +
        '<ul class="ms-options"></ul>' +
        '<div class="ms-footer">' +
          '<button type="button" class="ms-clear">Effacer</button>' +
          '<button type="button" class="ms-apply">OK</button>' +
        '</div>' +
      '</div>' +
      '</div>';

    const root = container.querySelector('.ms-root');
    const trigger = root.querySelector('.ms-trigger');
    const triggerText = root.querySelector('.ms-trigger-text');
    const panel = root.querySelector('.ms-panel');
    const optionsList = root.querySelector('.ms-options');
    const searchInput = root.querySelector('.ms-search');
    const clearBtn = root.querySelector('.ms-clear');
    const applyBtn = root.querySelector('.ms-apply');

    function renderTrigger() {
      if (_values.length === 0) {
        triggerText.textContent = placeholder;
        trigger.classList.remove('is-filled');
      } else if (_values.length === 1) {
        const opt = _options.find((o) => o.value === _values[0]);
        triggerText.textContent = opt ? opt.label : _values[0];
        trigger.classList.add('is-filled');
      } else {
        triggerText.textContent = _values.length + ' sélectionnés';
        trigger.classList.add('is-filled');
      }
    }

    function renderOptions() {
      const query = _searchQuery.trim().toLowerCase();
      const visible = query
        ? _options.filter((o) => o.label.toLowerCase().includes(query))
        : _options;
      optionsList.innerHTML = visible.length === 0
        ? '<li class="ms-empty">Aucun résultat</li>'
        : visible.map((opt) => {
            const checked = _values.includes(opt.value);
            return '<li class="ms-option' + (checked ? ' is-checked' : '') + '" data-value="' + escapeHtml(opt.value) + '" role="option" aria-selected="' + checked + '">' +
              '<span class="ms-option-box" aria-hidden="true"></span>' +
              '<span class="ms-option-label">' + escapeHtml(opt.label) + '</span>' +
              '</li>';
          }).join('');
    }

    function open() {
      if (_isOpen) return;
      _isOpen = true;
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      root.classList.add('is-open');
      _openDropdowns.add(api);
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 10);
      }
      renderOptions();
    }

    function close() {
      if (!_isOpen) return;
      _isOpen = false;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
      _openDropdowns.delete(api);
      if (searchInput) {
        searchInput.value = '';
        _searchQuery = '';
      }
    }

    function emitChange() {
      if (typeof onChange === 'function') onChange(_values.slice());
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (_isOpen) close(); else open();
    });

    optionsList.addEventListener('click', (e) => {
      const li = e.target.closest('.ms-option');
      if (!li) return;
      const value = li.dataset.value;
      if (single) {
        _values = [value];
        renderOptions();
        renderTrigger();
        emitChange();
        close();
        return;
      }
      const idx = _values.indexOf(value);
      if (idx >= 0) _values.splice(idx, 1); else _values.push(value);
      renderOptions();
      renderTrigger();
      emitChange();
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        _searchQuery = searchInput.value;
        renderOptions();
      });
      searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _values = [];
      renderOptions();
      renderTrigger();
      emitChange();
    });

    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    const api = {
      root,
      getValues: () => _values.slice(),
      setValues: (newValues) => {
        _values = single ? (newValues[0] ? [newValues[0]] : []) : newValues.slice();
        renderOptions();
        renderTrigger();
      },
      setOptions: (newOptions) => {
        _options = newOptions.slice();
        renderOptions();
        renderTrigger();
      },
      open,
      close,
      destroy: () => {
        close();
        container.innerHTML = '';
      }
    };

    renderTrigger();
    renderOptions();
    return api;
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
    renderSiteNav,
    debounce,
    renderSkeletons,
    withLoadingState,
    revealOnScroll,
    revealAll,
    renderStateMessage,
    createMultiSelect,
  };
})();
