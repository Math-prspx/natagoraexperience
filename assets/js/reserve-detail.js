document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.PublicUtils.apiBaseUrl();
  const { normalizePublicUrl, buildWalkCardMarkup, formatDateLong, formatDuration } = window.PublicUtils;
  const root = document.getElementById('reserveDetailRoot');

  if (!root) {
    return;
  }

  const getSlug = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || 'montagne-saint-pierre';
  };

  const buildSpécificités = (place) => {
    const fromAdmin = Array.isArray(place.specificities) ? place.specificities : [];
    if (fromAdmin.length > 0) {
      return fromAdmin
        .map((item) => ({
          image: normalizePublicUrl(item.image, '/img/chouette.jpg'),
          title: String(item.title || '').trim(),
          text: String(item.text || '').trim(),
        }))
        .filter((item) => item.image || item.title || item.text);
    }

    const name = place.name_fr || 'Réserve';
    return [
      { image: normalizePublicUrl(place.cover_image_url, '/img/chouette.jpg'), title: 'Paysages', text: `${name}: falaises, pelouses calcaires et sentiers panoramiques.` },
      { image: '/img/Map-bgr-01.png', title: 'Biodiversité', text: "Zones refuges pour de nombreuses espèces d'oiseaux, insectes et plantes rares." },
      { image: '/img/chouette.jpg', title: 'Accès', text: 'Parcours accessibles et points de vue pédagogiques pour les visites guidées.' },
    ];
  };

  const render = (place, walks) => {
    const title = place.name_fr || 'La réserve';
    const headline = place.headline_fr || 'Headline 35 car. max';
    const shortDesc = place.short_description_fr || 'Bloc texte descriptif de la réserve.';
    const longDesc = place.long_description_fr || 'Cette réserve naturelle propose une immersion dans des paysages préservés, avec une biodiversité remarquable et des parcours découverte adaptés à tous les publics.';
    const heroImage = normalizePublicUrl(place.cover_image_url, '/img/chouette.jpg');
    const introImage = normalizePublicUrl(place.intro_image_url, '') || heroImage;
    const specificites = buildSpécificités(place);
    const mapLabel = place.metric_map_label || 'Carte';
    const mapValue = place.metric_map_value || 'Accessible';
    const areaValue = place.area_ha ? `${place.area_ha} ha` : 'XXX ha';
    const createdValue = place.created_year ? String(place.created_year) : 'XXXX';
    const speciesValue = place.species_count ? String(place.species_count) : 'XXX';

    const visitsMarkup = walks.length
      ? walks
          .slice(0, 6)
          .map((walk) => {
            const detailUrl = walk.slug ? `promenade.html?slug=${encodeURIComponent(walk.slug)}` : 'catalogue.html';
            return `
              <div class="reserve-visit-item">
                <a href="${detailUrl}">${walk.title || 'Visite guidée'}</a>
                <span class="reserve-visit-meta">${formatDuration(walk.duration_minutes).replace('Durée : ', '')}${walk.family_label ? ` • ${walk.family_label}` : ''}</span>
              </div>
            `;
          })
          .join('')
      : '<p>Aucune visite guidée disponible actuellement pour cette réserve.</p>';

    const visitCardsMarkup = walks.length
      ? `
          <div class="agenda-slider-wrap reserve-guided-wrap">
            <div class="agenda-grid reserve-guided-grid">
              ${walks.map((walk, index) => buildWalkCardMarkup(walk, index)).join('')}
            </div>
          </div>
        `
      : '<p>Aucune visite guidée disponible actuellement pour cette réserve.</p>';

    root.innerHTML = `
      <section class="reserve-detail-hero" style="--reserve-hero-image:url('${heroImage}')">
        <div class="reserve-detail-hero-content">
          <p class="reserve-detail-kicker">Réserve naturelle</p>
          <h1>${title}</h1>
          <p class="reserve-detail-headline">${headline}</p>
        </div>
      </section>

      <section class="reserve-detail-content">
        <section class="detail-dates reserve-detail-intro">
          <div class="detail-dates-layout">
            <div class="detail-dates-copy">
              <h2>Explorer la réserve</h2>
              ${shortDesc ? `<p class="detail-dates-summary">${shortDesc}</p>` : ''}
              ${longDesc ? `<p class="detail-dates-description">${longDesc}</p>` : ''}
            </div>
            <figure class="detail-dates-visual">
              <img src="${introImage}" alt="${title}" loading="lazy">
            </figure>
          </div>
        </section>

        <section class="reserve-metrics" aria-label="Informations clés réserve">
          <article class="reserve-metric">
            <img class="reserve-metric-icon" src="${normalizePublicUrl('/img/Icon_surface.svg')}" alt="Icone superficie" loading="lazy">
            <p class="reserve-metric-label">Superficie</p>
            <p class="reserve-metric-value">${areaValue}</p>
          </article>
          <article class="reserve-metric">
            <img class="reserve-metric-icon" src="${normalizePublicUrl('/img/Icon_creation.svg')}" alt="Icone création" loading="lazy">
            <p class="reserve-metric-label">Créée en</p>
            <p class="reserve-metric-value">${createdValue}</p>
          </article>
          <article class="reserve-metric">
            <img class="reserve-metric-icon" src="${normalizePublicUrl('/img/Icon_home.svg')}" alt="Icone régionale" loading="lazy">
            <p class="reserve-metric-label">Régionale</p>
            <p class="reserve-metric-value">${mapValue}</p>
          </article>
        </section>

        <section class="reserve-specific" aria-labelledby="reserve-spec-title">
          <div class="reserve-specific-head">
            <div>
              <h2 id="reserve-spec-title">Spécificités</h2>
              <p>Paysages, biodiversité et accès</p>
            </div>
            <div class="reserve-specific-controls" aria-label="Navigation spécificités">
              <button id="specPrevBtn" type="button" aria-label="Précédent">&#8592;</button>
              <button id="specNextBtn" type="button" aria-label="Suivant">&#8594;</button>
            </div>
          </div>

          <div class="reserve-specific-window">
            <div id="specTrack" class="reserve-specific-track">
              ${specificites
                .map(
                  (item) => `
                <article class="reserve-specific-card">
                  <img src="${item.image}" alt="Spécificité reserve" loading="lazy">
                  <div class="reserve-specific-card-body">
                    ${item.title ? `<h3 class="reserve-specific-card-title">${item.title}</h3>` : ''}
                    ${item.text ? `<p>${item.text}</p>` : ''}
                  </div>
                </article>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="reserve-accordion">
            ${place.accordion1_title || place.accordion1_text ? `
            <details>
              <summary>${place.accordion1_title || 'Faune et Flore'}</summary>
              <div class="reserve-accordion-body">${place.accordion1_text || ''}</div>
            </details>` : ''}
            ${place.accordion2_title || place.accordion2_text ? `
            <details>
              <summary>${place.accordion2_title || 'Comment accéder ?'}</summary>
              <div class="reserve-accordion-body">${place.accordion2_text || ''}</div>
            </details>` : ''}
          </div>
        </section>

        <section class="reserve-guided" aria-label="Promenades de la réserve">
          <div class="agenda-head reserve-guided-head">
            <p class="agenda-kicker">Agenda</p>
            <h2 class="agenda-title">Nos visites guidées dans cette réserve</h2>
            <p class="agenda-intro">Choisissez une date et partez à la découverte de la réserve avec un guide.</p>
          </div>
          ${visitCardsMarkup}
        </section>
      </section>
    `;

    initSpécificitésSlider();
  };

  const initSpécificitésSlider = () => {
    const track = document.getElementById('specTrack');
    const prevBtn = document.getElementById('specPrevBtn');
    const nextBtn = document.getElementById('specNextBtn');

    if (!track || !prevBtn || !nextBtn) {
      return;
    }

    let index = 0;

    const visibleCards = () => {
      if (window.innerWidth <= 740) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    };

    const maxIndex = () => Math.max(0, track.children.length - visibleCards());

    const update = () => {
      const card = track.querySelector('.reserve-specific-card');
      if (!card) return;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const step = card.getBoundingClientRect().width + gap;
      if (index > maxIndex()) index = maxIndex();

      track.style.transform = `translateX(${-index * step}px)`;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex();
    };

    prevBtn.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });

    nextBtn.addEventListener('click', () => {
      index = Math.min(maxIndex(), index + 1);
      update();
    });

    window.addEventListener('resize', update);
    update();
  };

  const slug = getSlug();

  Promise.all([
    fetch(API_BASE + '/public/places').then((r) => (r.ok ? r.json() : { items: [] })),
    fetch(API_BASE + '/public/walks?place=' + encodeURIComponent(slug)).then((r) => (r.ok ? r.json() : { items: [] })),
  ])
    .then(([placesData, walksData]) => {
      const places = Array.isArray(placesData.items) ? placesData.items : [];
      const place = places.find((item) => String(item.slug || '') === slug) || {
        slug,
        name_fr: 'La réserve',
        short_description_fr: 'Bloc texte descriptif de la réserve.',
        long_description_fr: '',
        cover_image_url: '/img/chouette.jpg',
      };

      const walks = Array.isArray(walksData.items) ? walksData.items : [];
      render(place, walks);
    })
    .catch(() => {
      render(
        {
          slug,
          name_fr: 'La réserve',
          short_description_fr: 'Bloc texte descriptif de la réserve.',
          long_description_fr: '',
          cover_image_url: '/img/chouette.jpg',
        },
        []
      );
    });
});
