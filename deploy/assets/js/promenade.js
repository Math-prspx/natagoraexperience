const API_BASE = window.PublicUtils.apiBaseUrl();
const { normalizePublicUrl, formatDateLong, formatDuration, buildWalkCardMarkup } = window.PublicUtils;
const root = document.getElementById('detailRoot');

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur API: ' + response.status);
  }
  return response.json();
}

function occurrenceBookingLink(walk, occurrence) {
  return occurrence.booking_url || walk.booking_url || '';
}

function isWalkReservable(walk) {
  return walk.family_code === 'decouverte' || walk.family_code === 'thematique';
}

function renderOccurrenceAction(walk, bookingUrl) {
  if (walk.family_code === 'sur-mesure') {
    return '<a class="btn-primary occurrence-book" href="contact.html">Contact sur mesure</a>';
  }

  if (!isWalkReservable(walk)) {
    return '<button class="btn-primary occurrence-book" type="button" disabled>Reservation indisponible</button>';
  }

  if (!bookingUrl) {
    return '<button class="btn-primary occurrence-book" type="button" disabled>Je réserve</button>';
  }

  return `<a class="btn-primary occurrence-book" href="${bookingUrl}" target="_blank" rel="noopener">Je réserve</a>`;
}

function formatOccurrenceDay(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
}

function formatOccurrenceDateHeading(dateString) {
  return formatDateLong(dateString, { upper: true });
}

function formatOccurrenceDuration(minutes) {
  return formatDuration(minutes).toUpperCase().replace('DURÉE : ', '');
}

function formatHeroDate(dateString) {
  return formatDateLong(dateString, { upper: true, fallback: 'DATE A CONFIRMER' });
}

function formatHeroDuration(minutes) {
  return formatDuration(minutes).toUpperCase();
}

function formatDistance(distanceKm) {
  if (distanceKm === null || typeof distanceKm === 'undefined' || distanceKm === '') {
    return '';
  }

  const value = Number(distanceKm);
  if (Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' km';
}

function formatPmr(value) {
  if (value === null || typeof value === 'undefined' || value === '') {
    return 'Non renseigne';
  }

  return value ? 'Oui' : 'Non';
}

function initGallerySlider() {
  const gallery = document.getElementById('detailGallery');
  const sliderWrap = gallery?.querySelector('.detail-gallery-slider-wrap');
  const track = document.getElementById('detailGalleryTrack');
  const bulletsRoot = document.getElementById('detailGalleryBullets');
  const prevBtn = document.getElementById('detailGalleryPrev');
  const nextBtn = document.getElementById('detailGalleryNext');

  if (!gallery || !sliderWrap || !track || !bulletsRoot) {
    return;
  }

  let currentIndex = 0;
  let cardStep = 0;
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;

  const visibleCards = () => {
    const card = track.querySelector('.detail-gallery-slide');
    if (!card) {
      return 1;
    }

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const cardWidth = card.getBoundingClientRect().width;
    const viewportWidth = sliderWrap.getBoundingClientRect().width;
    const count = Math.floor((viewportWidth + gap) / (cardWidth + gap));
    return Math.max(1, count);
  };

  const maxIndex = () => Math.max(0, track.children.length - visibleCards());

  const recalcStep = () => {
    const card = track.querySelector('.detail-gallery-slide');
    if (!card) {
      cardStep = 0;
      return;
    }

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    cardStep = card.getBoundingClientRect().width + gap;
  };

  const updateBullets = () => {
    const bullets = bulletsRoot.querySelectorAll('.bullet');
    bullets.forEach((bullet, index) => {
      bullet.classList.toggle('is-active', index === currentIndex);
    });
  };

  const renderBullets = () => {
    const total = maxIndex() + 1;
    bulletsRoot.innerHTML = Array.from({ length: total }, (_, index) => `<button type="button" class="bullet${index === 0 ? ' is-active' : ''}" aria-label="Aller a la diapositive ${index + 1}"></button>`).join('');

    Array.from(bulletsRoot.querySelectorAll('.bullet')).forEach((bullet, index) => {
      bullet.addEventListener('click', () => {
        updateSlider(index);
      });
    });
  };

  const updateSlider = (targetIndex = currentIndex) => {
    currentIndex = Math.max(0, Math.min(targetIndex, maxIndex()));
    recalcStep();
    track.style.transform = `translateX(${-currentIndex * cardStep}px)`;
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex();
    updateBullets();
  };

  const nextSlide = () => {
    if (currentIndex < maxIndex()) {
      updateSlider(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      updateSlider(currentIndex - 1);
    }
  };

  const getCurrentTranslate = () => {
    const transform = track.style.transform || '';
    const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    return match ? Number(match[1]) : 0;
  };

  const onPointerDown = (event) => {
    if (maxIndex() === 0) {
      return;
    }

    isDragging = true;
    startX = event.clientX;
    startTranslate = getCurrentTranslate();
    track.style.transition = 'none';
    track.classList.add('is-dragging');
  };

  const onPointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    const delta = event.clientX - startX;
    track.style.transform = `translateX(${startTranslate + delta}px)`;
  };

  const onPointerUp = (event) => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    track.style.transition = '';
    track.classList.remove('is-dragging');

    const delta = event.clientX - startX;
    const threshold = Math.max(cardStep * 0.2, 36);

    if (Math.abs(delta) > threshold) {
      if (delta < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      return;
    }

    updateSlider(currentIndex);
  };

  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);
  track.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  window.addEventListener('resize', () => {
    renderBullets();
    updateSlider(currentIndex);
  });

  renderBullets();
  updateSlider(0);
}

function render(walk) {
  const occurrences = Array.isArray(walk.occurrences) ? walk.occurrences : [];
  const cover = normalizePublicUrl(walk.cover_image_url, '/img/Map-bgr-01.png');
  const contentImage = normalizePublicUrl(walk.intro_image_url, cover);
  const firstOccurrence = occurrences[0] || null;
  const firstDate = firstOccurrence ? formatHeroDate(firstOccurrence.starts_at) : 'DATE A CONFIRMER';
  const heroPlace = walk.place_name ? walk.place_name.toUpperCase() : 'LIEU A CONFIRMER';
  const heroDuration = formatHeroDuration(walk.duration_minutes);
  const distanceLabel = formatDistance(walk.distance_km);
  const targetPublic = (walk.target_public || '').trim();
  const difficultyLabel = (walk.level_label || '').trim();
  const pmrLabel = formatPmr(walk.pmr_accessible);
  const datesSubtitle = (walk.dates_subtitle || '').trim() || 'Dates et informations';
  const familyLabel = (walk.family_label || 'Promenade').trim();
  const practicalInfo = Array.isArray(walk.practical_info) ? walk.practical_info.filter(Boolean) : [];
  const galleryItems = Array.isArray(walk.gallery) && walk.gallery.length > 0
    ? walk.gallery.map((imageUrl) => normalizePublicUrl(imageUrl)).filter(Boolean)
    : ['/img/Map-bgr-01.png', '/img/Path_line.png', '/img/logo.png'];
  const familyIcon = walk.family_code === 'thematique'
    ? 'img/Icon_theme.svg'
    : 'img/Icon_mountain.svg';

  root.innerHTML = `
    <article class="detail-page">
      <section class="detail-hero" style="--hero-image:url('${cover}')">
        <div class="detail-hero-map" aria-hidden="true"></div>
        <div class="detail-hero-map detail-hero-map-secondary" aria-hidden="true"></div>
        <div class="detail-hero-content">
          <p class="detail-kicker"><img src="${familyIcon}" alt="" aria-hidden="true">${familyLabel.toUpperCase()}</p>
          <h1>${walk.title}</h1>
          <div class="detail-hero-meta" aria-label="Informations principales">
            <span class="detail-meta-item detail-meta-item-date">
              <svg class="detail-meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3a.75.75 0 0 1 1.5 0v1.5h.75A2.25 2.25 0 0 1 21 6.75V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V6.75A2.25 2.25 0 0 1 5.25 4.5H6V3a.75.75 0 0 1 .75-.75ZM4.5 9v9c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V9h-15Zm3 3a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H7.5Zm4.5 0a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm4.5 0a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5H16.5Z" fill="currentColor"/></svg>
              ${firstDate}
            </span>
            <span class="detail-meta-item detail-meta-item-subtle">
              <svg class="detail-meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5.18 6.12 11.94 6.38 12.22a.83.83 0 0 0 1.24 0C12.88 20.94 19 14.18 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" fill="currentColor"/></svg>
              ${heroPlace}
            </span>
            <span class="detail-meta-item detail-meta-item-subtle">
              <svg class="detail-meta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 10.59 3.3 3.29a1 1 0 0 1-1.42 1.42l-3.59-3.59A1 1 0 0 1 11 13V7a1 1 0 0 1 2 0Z" fill="currentColor"/></svg>
              ${heroDuration}
            </span>
          </div>
        </div>
      </section>

      <section class="detail-content">
        <section class="detail-dates">
          <div class="detail-dates-layout">
            <div class="detail-dates-copy">
              <a class="detail-back-link" href="catalogue.html"><span class="detail-back-link-arrow" aria-hidden="true">&#8592;</span>Retour à la liste</a>
              <h2>${datesSubtitle}</h2>
              ${walk.summary ? `<p class="detail-dates-summary">${walk.summary}</p>` : ''}
              <div class="detail-extra-meta" aria-label="Informations pratiques de la promenade">
                ${distanceLabel ? `<p><strong>Distance:</strong> ${distanceLabel}</p>` : ''}
                ${targetPublic ? `<p><strong>Public:</strong> ${targetPublic}</p>` : ''}
                ${difficultyLabel ? `<p><strong>Difficulte du parcours:</strong> ${difficultyLabel}</p>` : ''}
                <p><strong>Acces PMR:</strong> ${pmrLabel}</p>
              </div>
              <div class="occurrence-list" id="occurrencesList"></div>
              ${walk.description ? `<p class="detail-dates-description">${walk.description}</p>` : ''}
              ${practicalInfo.length ? `
                <div class="detail-practical-block">
                  <h3>Infos pratiques</h3>
                  <ul class="detail-practical-list">
                    ${practicalInfo.map((item) => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <a class="btn-secondary detail-question-link" href="contact.html">Des questions ?</a>
            </div>
            <figure class="detail-dates-visual">
              <img src="${contentImage}" alt="Visuel contenu ${walk.title}" loading="lazy">
            </figure>
          </div>
        </section>

        <section class="detail-gallery" id="detailGallery" aria-label="Galerie promenade">
          <div class="detail-gallery-head">
            <h2>Galerie</h2>
            <div class="detail-gallery-controls">
              <button id="detailGalleryPrev" type="button" class="detail-gallery-arrow" aria-label="Image précédente">&#8592;</button>
              <button id="detailGalleryNext" type="button" class="detail-gallery-arrow" aria-label="Image suivante">&#8594;</button>
            </div>
          </div>
          <div class="detail-gallery-slider-wrap">
            <div class="detail-gallery-track" id="detailGalleryTrack">
              ${galleryItems
                .map((imageUrl, index) => `
                  <figure class="detail-gallery-slide">
                    <img src="${imageUrl}" alt="Visuel promenade ${index + 1}" loading="lazy">
                  </figure>
                `)
                .join('')}
            </div>
          </div>
          <div class="agenda-bullets detail-gallery-bullets" id="detailGalleryBullets" aria-label="Pagination galerie"></div>
        </section>

      </section>
    </article>
  `;

  initGallerySlider();

  const list = document.getElementById('occurrencesList');
  if (occurrences.length === 0) {
    list.innerHTML = '<p>Aucune occurrence publiee pour le moment.</p>';
    return;
  }

  list.innerHTML = occurrences
    .map((occ) => {
      const bookingUrl = occurrenceBookingLink(walk, occ) || walk.booking_url || '';
      return `
        <div class="occurrence">
          <div class="occurrence-date-block">
            <p class="occurrence-day">${formatOccurrenceDay(occ.starts_at)}</p>
            <p class="occurrence-date">${formatOccurrenceDateHeading(occ.starts_at)}</p>
          </div>
          <div class="occurrence-meta">
            <p class="occurrence-meta-line">
              <svg class="occurrence-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5.18 6.12 11.94 6.38 12.22a.83.83 0 0 0 1.24 0C12.88 20.94 19 14.18 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" fill="currentColor"/></svg>
              <span>${walk.place_name ? walk.place_name.toUpperCase() : 'LIEU A CONFIRMER'}</span>
            </p>
            <p class="occurrence-meta-line">
              <svg class="occurrence-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 10.59 3.3 3.29a1 1 0 0 1-1.42 1.42l-3.59-3.59A1 1 0 0 1 11 13V7a1 1 0 0 1 2 0Z" fill="currentColor"/></svg>
              <span>${formatOccurrenceDuration(walk.duration_minutes)}</span>
            </p>
          </div>
          ${renderOccurrenceAction(walk, bookingUrl)}
        </div>
      `;
    })
    .join('');
}

async function loadRelatedWalks(currentWalk) {
  const placeSlug = currentWalk.place_slug;
  if (!placeSlug) {
    return;
  }

  const section = document.getElementById('relatedWalksSection');
  const grid = document.getElementById('relatedWalksGrid');
  const title = document.getElementById('relatedWalksTitle');
  if (!section || !grid) {
    return;
  }

  try {
    const data = await fetchJson(API_BASE + '/public/walks?place=' + encodeURIComponent(placeSlug));
    const others = (data.items || []).filter((w) => w.slug !== currentWalk.slug);
    if (others.length === 0) {
      return;
    }

    if (title && currentWalk.place_name) {
      title.textContent = 'Découvrez les autres promenades a ' + currentWalk.place_name;
    }

    grid.innerHTML = others.map((item, index) => buildWalkCardMarkup(item, index)).join('');
    section.removeAttribute('hidden');
  } catch (_error) {
    // section reste masquee si erreur
  }
}

async function bootstrap() {
  try {
    const slug = getSlugFromUrl();
    if (!slug) {
      root.innerHTML = '<p>Slug manquant.</p>';
      return;
    }

    const data = await fetchJson(API_BASE + '/public/walks/' + encodeURIComponent(slug));
    render(data.item);
    loadRelatedWalks(data.item);
  } catch (error) {
    console.error(error);
    root.innerHTML = '<p>Impossible de charger la promenade.</p>';
  }
}

bootstrap();
