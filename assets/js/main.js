document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.PublicUtils.apiBaseUrl();
  const { buildWalkCardMarkup, buildReserveCardMarkup, withLoadingState, revealAll, revealOnScroll, renderStateMessage } = window.PublicUtils;

  // Reveal-on-scroll global : marque les sections clés au chargement initial
  revealAll();

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur API: ' + response.status);
    }
    return response.json();
  }

  async function initLandingAgenda() {
    const grid = document.getElementById('landingAgendaGrid');
    if (!grid) {
      return;
    }

    await withLoadingState(grid, async () => {
      try {
        const data = await fetchJson(API_BASE + '/public/walks');
        const items = Array.isArray(data.items) ? data.items : [];
        const latestThree = items.slice(-3).reverse();

        if (latestThree.length === 0) {
          renderStateMessage(grid, {
            title: 'Aucune expérience pour le moment',
            text: 'Le programme sera bientôt mis à jour. Revenez vite découvrir nos prochaines sorties.',
            variant: 'empty'
          });
          return;
        }

        const cardClasses = ['agenda-card-left tilt-left', 'agenda-card-center tilt-right', 'agenda-card-right'];

        grid.innerHTML = latestThree
          .map((item, index) => buildWalkCardMarkup(item, index, { cardClassName: cardClasses[index] || '' }))
          .join('');
        revealAll(grid, '.agenda-card');
      } catch (error) {
        console.error(error);
        renderStateMessage(grid, {
          title: 'Chargement impossible',
          text: 'Nous n’avons pas pu récupérer les expériences. Vérifiez votre connexion ou réessayez.',
          variant: 'error',
          onRetry: () => initLandingAgenda()
        });
      }
    }, { skeletonCount: 3 });
  }

  initLandingAgenda();

  const button = document.getElementById("demoButton");

  if (button) {
    button.addEventListener("click", () => {
      console.log("JavaScript est bien connecté.");
    });
  }

  // Toggle overlay navigation menu : géré par PublicUtils.renderSiteNav (auto-init)

  async function initLandingReserves() {
    const reservesTrack = document.querySelector('.reserves-track');
    const reservesBulletsContainer = document.querySelector('.reserves-bullets');
    const reservesSection = document.querySelector('.reserves');

    if (!reservesSection || !reservesTrack) {
      return;
    }

    let items = [];
    let currentIndex = 0;
    let cardStep = 0;
    let isDragging = false;
    let startX = 0;
    let startTranslate = 0;

    const visibleCards = () => {
      // Toujours slider 1 carte à la fois pour créer l'effet "peek"
      return 1;
    };

    const maxIndex = () => Math.max(0, items.length - 1);

    const recalcStep = () => {
      const card = reservesTrack.querySelector('.reserve-card');
      if (!card) {
        cardStep = 0;
        return;
      }
      const style = window.getComputedStyle(reservesTrack);
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      cardStep = card.getBoundingClientRect().width + gap;
    };

    const updateBullets = () => {
      const reservesBullets = Array.from(reservesBulletsContainer?.querySelectorAll('.bullet') || []);
      reservesBullets.forEach((bullet, i) => {
        bullet.classList.toggle('is-active', i === currentIndex);
      });
    };

    const updateSlider = (targetIndex = currentIndex) => {
      currentIndex = Math.max(0, Math.min(targetIndex, maxIndex()));
      recalcStep();
      reservesTrack.style.transform = `translateX(${-currentIndex * cardStep}px)`;
      updateBullets();
    };

    const nextCard = () => {
      if (currentIndex < maxIndex()) {
        updateSlider(currentIndex + 1);
      }
    };

    const prevCard = () => {
      if (currentIndex > 0) {
        updateSlider(currentIndex - 1);
      }
    };

    const render = (list) => {
      // N'afficher que les réserves réelles de la DB
      items = Array.isArray(list) && list.length > 0 ? list : [];
      
      if (items.length === 0) {
        renderStateMessage(reservesTrack, {
          title: 'Aucune réserve disponible',
          text: 'Le contenu sera publié prochainement.',
          variant: 'empty'
        });
        return;
      }
      
      reservesTrack.innerHTML = items
        .map((item) => buildReserveCardMarkup(item, '/img/chouette.jpg'))
        .join('');
      revealAll(reservesTrack, '.reserve-card');
      
      // Générer les bullets dynamiquement
      if (reservesBulletsContainer && items.length > 0) {
        const bulletsHtml = items.map((_, i) => 
          `<span class="bullet${i === 0 ? ' is-active' : ''}"></span>`
        ).join('');
        reservesBulletsContainer.innerHTML = bulletsHtml;
        
        // Réattacher les événements aux nouveaux bullets
        const bullets = Array.from(reservesBulletsContainer.querySelectorAll('.bullet'));
        bullets.forEach((bullet, index) => {
          bullet.addEventListener('click', () => updateSlider(index));
        });
      }
      
      currentIndex = 0;
      updateSlider(0);
    };

    const getCurrentTranslate = () => {
      const transform = reservesTrack.style.transform || '';
      const match = transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
      return match ? Number(match[1]) : 0;
    };

    const onPointerDown = (event) => {
      if (!items.length || maxIndex() === 0) {
        return;
      }

      isDragging = true;
      startX = event.clientX;
      startTranslate = getCurrentTranslate();
      reservesTrack.style.transition = 'none';
      reservesTrack.classList.add('is-dragging');
    };

    const onPointerMove = (event) => {
      if (!isDragging) {
        return;
      }

      const delta = event.clientX - startX;
      reservesTrack.style.transform = `translateX(${startTranslate + delta}px)`;
    };

    const onPointerUp = (event) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      reservesTrack.style.transition = '';
      reservesTrack.classList.remove('is-dragging');

      const delta = event.clientX - startX;
      const threshold = Math.max(cardStep * 0.2, 36);

      if (Math.abs(delta) > threshold) {
        if (delta < 0) {
          nextCard();
        } else {
          prevCard();
        }
        return;
      }

      updateSlider(currentIndex);
    };

    reservesTrack.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    window.addEventListener('resize', () => updateSlider(currentIndex));

    try {
      const data = await fetchJson(API_BASE + '/public/places');
      render(data.items || []);
    } catch (error) {
      console.error(error);
      render(defaultItems);
    }
  }

  initLandingReserves();
});
