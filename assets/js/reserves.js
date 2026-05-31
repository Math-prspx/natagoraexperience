document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.PublicUtils.apiBaseUrl();
  const { buildReserveCardMarkup } = window.PublicUtils;
  const track = document.getElementById('reserveTrack');
  const prevBtn = document.getElementById('reservePrevBtn');
  const nextBtn = document.getElementById('reserveNextBtn');

  if (!track) {
    return;
  }

  let items = [];
  let index = 0;

  // Toujours slider 1 carte à la fois pour créer l'effet "peek"
  const visibleCards = () => {
    // Toujours slider 1 carte à la fois pour créer l'effet "peek"
    return 1;
  };

  const maxIndex = () => Math.max(0, items.length - 1);

  const updateSlider = () => {
    const card = track.querySelector('.reserve-card');
    if (!card) {
      return;
    }

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const step = card.getBoundingClientRect().width + gap;

    if (index > maxIndex()) {
      index = maxIndex();
    }

    track.style.transform = `translateX(${-index * step}px)`;

    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= maxIndex();
  };

  const render = (list) => {
    // N'afficher que les réserves réelles de la DB
    items = Array.isArray(list) && list.length > 0 ? list : [];
    
    if (items.length === 0) {
      window.PublicUtils.renderStateMessage(track, {
        title: 'Aucune réserve',
        text: 'Les réserves seront publiées prochainement.',
        variant: 'empty'
      });
      return;
    }
    
    track.innerHTML = items.map((item) => buildReserveCardMarkup(item, '/img/chouette.jpg')).join('');
    window.PublicUtils.revealAll(track, '.reserve-card');
    index = 0;
    updateSlider();
  };

  const move = (delta) => {
    index = Math.max(0, Math.min(index + delta, maxIndex()));
    updateSlider();
  };

  prevBtn?.addEventListener('click', () => move(-1));
  nextBtn?.addEventListener('click', () => move(1));
  window.addEventListener('resize', updateSlider);

  const { renderSkeletons } = window.PublicUtils;
  renderSkeletons(track, 3);
  track.setAttribute('aria-busy', 'true');

  fetch(API_BASE + '/public/places')
    .then((response) => {
      if (!response.ok) {
        throw new Error('API ' + response.status);
      }
      return response.json();
    })
    .then((data) => render(data.items || []))
    .catch(() => {
      window.PublicUtils.renderStateMessage(track, {
        title: 'Chargement impossible',
        text: 'Nous n’avons pas pu récupérer les réserves. Réessayez dans un instant.',
        variant: 'error',
        onRetry: () => window.location.reload()
      });
    })
    .finally(() => track.setAttribute('aria-busy', 'false'));
});
