const API_BASE = window.PublicUtils.apiBaseUrl();
const {
  buildWalkCardMarkup,
  debounce,
  withLoadingState,
  revealAll,
  renderStateMessage,
} = window.PublicUtils;

const familyFilter = document.getElementById('familyFilter');
const dateFilter = document.getElementById('dateFilter');
const walksGrid = document.getElementById('walksGrid');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const activeFiltersBar = document.getElementById('activeFilters');
const quickFamilyButtons = Array.from(document.querySelectorAll('.cat-hero-chips [data-family], #familyList [data-family]'));
const placeholderCovers = ['img/Map-bgr-01.png', 'img/Path_line.png', 'img/logo.png'];

const overlay = document.getElementById('catFiltersOverlay');
const backdrop = document.getElementById('catFiltersBackdrop');
const openFiltersBtn = document.getElementById('openFiltersBtn');
const closeFiltersBtn = document.getElementById('closeFiltersBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const subcategoryList = document.getElementById('subcategoryList');
const placeList = document.getElementById('placeList');
const filtersCountBadge = document.getElementById('filtersCount');
const datePresetButtons = Array.from(overlay?.querySelectorAll('[data-preset]') || []);

// État central
const state = {
  family: '',
  subcategory: [],
  place: [],
  fromDate: '',
  datePreset: '',
};

let subcategoryCatalog = [];
let placeCatalog = [];

const FAMILY_LABELS = {
  'decouverte': 'Découverte',
  'thematique': 'Thématique',
  'sur-mesure': 'Sur mesure',
};
const PRESET_LABELS = { weekend: 'Ce week-end', month: 'Ce mois-ci', '3months': '3 prochains mois' };

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur API: ' + response.status);
  return response.json();
}

function todayIso() {
  const today = new Date();
  return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
}

function syncQuickFamilyButtons() {
  quickFamilyButtons.forEach((button) => {
    if (button.dataset.family === undefined) return;
    button.classList.toggle('is-active', (button.dataset.family || '') === state.family);
  });
}

/* Compte des filtres avancés (hors famille qui a sa propre barre de chips) */
function advancedFiltersCount() {
  let n = state.subcategory.length + state.place.length;
  if (state.datePreset || state.fromDate) n += 1;
  return n;
}

function syncFiltersCountBadge() {
  if (!filtersCountBadge || !openFiltersBtn) return;
  const n = advancedFiltersCount();
  if (n > 0) {
    filtersCountBadge.textContent = String(n);
    filtersCountBadge.hidden = false;
    openFiltersBtn.classList.add('is-filled');
  } else {
    filtersCountBadge.hidden = true;
    openFiltersBtn.classList.remove('is-filled');
  }
}

function renderChipList(container, items, selectedValues, kind) {
  if (!container) return;
  if (items.length === 0) {
    container.innerHTML = '<p class="cat-filters-list-empty">Aucune option disponible.</p>';
    return;
  }
  container.innerHTML = items.map((item) => {
    const active = selectedValues.includes(item.slug);
    return `<button type="button" class="cat-filters-item${active ? ' is-active' : ''}" data-kind="${kind}" data-value="${item.slug}">${item.name_fr}</button>`;
  }).join('');
}

function refreshOverlayChips() {
  renderChipList(subcategoryList, subcategoryCatalog, state.subcategory, 'subcategory');
  renderChipList(placeList, placeCatalog, state.place, 'place');
  datePresetButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.preset === state.datePreset);
  });
  if (dateFilter) dateFilter.value = state.datePreset ? '' : state.fromDate;
}

function toggleArrayValue(arr, value) {
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(value);
  return arr;
}

/* Délégation clic sur les listes overlay */
[subcategoryList, placeList].forEach((list) => {
  list?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-filters-item');
    if (!btn) return;
    const kind = btn.dataset.kind;
    const value = btn.dataset.value;
    if (kind === 'subcategory') toggleArrayValue(state.subcategory, value);
    else if (kind === 'place') toggleArrayValue(state.place, value);
    refreshOverlayChips();
    // pas de loadWalks ici : application au clic sur "Voir les résultats" (mais on peut auto-appliquer)
    onFiltersChanged();
  });
});

datePresetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset || '';
    state.datePreset = (state.datePreset === preset) ? '' : preset;
    state.fromDate = '';
    refreshOverlayChips();
    onFiltersChanged();
  });
});

dateFilter?.addEventListener('change', () => {
  state.fromDate = dateFilter.value || '';
  state.datePreset = '';
  refreshOverlayChips();
  onFiltersChanged();
});

/* Overlay open/close */
function openFiltersOverlay() {
  if (!overlay || !backdrop) return;
  refreshOverlayChips();
  overlay.classList.add('show');
  backdrop.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  closeFiltersBtn?.focus();
}
function closeFiltersOverlay() {
  if (!overlay || !backdrop) return;
  overlay.classList.remove('show');
  backdrop.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  openFiltersBtn?.focus();
}
openFiltersBtn?.addEventListener('click', openFiltersOverlay);
closeFiltersBtn?.addEventListener('click', closeFiltersOverlay);
backdrop?.addEventListener('click', closeFiltersOverlay);
applyFiltersBtn?.addEventListener('click', closeFiltersOverlay);
resetFiltersBtn?.addEventListener('click', () => {
  state.subcategory = [];
  state.place = [];
  state.fromDate = '';
  state.datePreset = '';
  refreshOverlayChips();
  onFiltersChanged();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay?.classList.contains('show')) closeFiltersOverlay();
});

async function loadFilterData() {
  const [subcategories, places] = await Promise.all([
    fetchJson(API_BASE + '/public/subcategories'),
    fetchJson(API_BASE + '/public/places'),
  ]);
  subcategoryCatalog = subcategories.items || [];
  placeCatalog = places.items || [];
  refreshOverlayChips();
}

function renderWalkCard(item, index) {
  const wrapper = document.createElement('div');
  const itemWithFallback = {
    ...item,
    cover_image_url: item.cover_image_url || placeholderCovers[index % placeholderCovers.length],
  };
  wrapper.innerHTML = buildWalkCardMarkup(itemWithFallback, index);
  return wrapper.firstElementChild;
}

function renderActivePills() {
  if (!activeFiltersBar) return;
  const pills = [];

  if (state.family) {
    pills.push({ kind: 'family', value: state.family, label: FAMILY_LABELS[state.family] || state.family });
  }
  state.subcategory.forEach((slug) => {
    const item = subcategoryCatalog.find((s) => s.slug === slug);
    pills.push({ kind: 'subcategory', value: slug, label: item ? item.name_fr : slug });
  });
  state.place.forEach((slug) => {
    const item = placeCatalog.find((p) => p.slug === slug);
    pills.push({ kind: 'place', value: slug, label: item ? item.name_fr : slug });
  });
  if (state.datePreset) {
    pills.push({ kind: 'datePreset', value: state.datePreset, label: PRESET_LABELS[state.datePreset] || state.datePreset });
  } else if (state.fromDate) {
    pills.push({ kind: 'fromDate', value: state.fromDate, label: 'À partir du ' + state.fromDate });
  }

  if (pills.length === 0) {
    activeFiltersBar.innerHTML = '';
    return;
  }

  activeFiltersBar.innerHTML = pills.map((p) =>
    `<button type="button" class="cat-active-pill" data-kind="${p.kind}" data-value="${p.value}" aria-label="Retirer le filtre ${p.label}"><span>${p.label}</span><span class="cat-active-pill-remove" aria-hidden="true">×</span></button>`
  ).join('') + `<button type="button" class="cat-active-clear">Tout effacer</button>`;

  activeFiltersBar.querySelectorAll('.cat-active-pill').forEach((btn) => {
    btn.addEventListener('click', () => removeFilter(btn.dataset.kind, btn.dataset.value));
  });
  activeFiltersBar.querySelector('.cat-active-clear')?.addEventListener('click', clearAllFilters);
}

function removeFilter(kind, value) {
  if (kind === 'family') state.family = '';
  else if (kind === 'subcategory') state.subcategory = state.subcategory.filter((v) => v !== value);
  else if (kind === 'place') state.place = state.place.filter((v) => v !== value);
  else if (kind === 'datePreset' || kind === 'fromDate') {
    state.datePreset = '';
    state.fromDate = '';
  }
  refreshOverlayChips();
  onFiltersChanged();
}

function clearAllFilters() {
  state.family = '';
  state.subcategory = [];
  state.place = [];
  state.fromDate = '';
  state.datePreset = '';
  refreshOverlayChips();
  onFiltersChanged();
}

function buildQueryParams() {
  const params = new URLSearchParams();
  if (state.family) params.set('family', state.family);
  if (state.subcategory.length) params.set('subcategory', state.subcategory.join(','));
  if (state.place.length) params.set('place', state.place.join(','));
  const effectiveFromDate = state.datePreset ? todayIso() : state.fromDate;
  if (effectiveFromDate) params.set('from_date', effectiveFromDate + ' 00:00:00');
  return params;
}

function syncUrlFromState() {
  const params = new URLSearchParams();
  if (state.family) params.set('family', state.family);
  if (state.subcategory.length) params.set('subcategory', state.subcategory.join(','));
  if (state.place.length) params.set('place', state.place.join(','));
  if (state.datePreset) params.set('preset', state.datePreset);
  else if (state.fromDate) params.set('from_date', state.fromDate);
  const url = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState(null, '', url);
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.family = params.get('family') || '';
  const sub = params.get('subcategory');
  state.subcategory = sub ? sub.split(',').filter(Boolean) : [];
  const pl = params.get('place');
  state.place = pl ? pl.split(',').filter(Boolean) : [];
  const preset = params.get('preset');
  if (preset && PRESET_LABELS[preset]) {
    state.datePreset = preset;
  } else {
    const fd = params.get('from_date');
    if (fd) {
      state.fromDate = fd.split(' ')[0];
      if (dateFilter) dateFilter.value = state.fromDate;
    }
  }
}

async function loadWalks() {
  syncQuickFamilyButtons();
  syncFiltersCountBadge();
  renderActivePills();
  syncUrlFromState();

  await withLoadingState(walksGrid, async () => {
    const params = buildQueryParams();
    const data = await fetchJson(API_BASE + '/public/walks?' + params.toString());

    if (resultsCount) {
      const count = data.items.length;
      resultsCount.textContent = count > 1 ? `${count} promenades trouvées` : `${count} promenade trouvée`;
    }

    walksGrid.innerHTML = '';
    if (data.items.length === 0) {
      emptyState.classList.add('hidden');
      renderStateMessage(walksGrid, {
        title: 'Aucun résultat',
        text: 'Aucune expérience ne correspond à vos filtres. Essayez d’élargir vos critères.',
        variant: 'empty'
      });
      return;
    }
    emptyState.classList.add('hidden');
    data.items.forEach((item, index) => walksGrid.appendChild(renderWalkCard(item, index)));
    revealAll(walksGrid, '.agenda-card');
  }, { skeletonCount: 6 });
}

const debouncedLoadWalks = debounce(loadWalks, 250);
function onFiltersChanged() { debouncedLoadWalks(); }

async function bootstrap() {
  try {
    applyStateFromUrl();
    await loadFilterData();
    await loadWalks();
  } catch (error) {
    console.error(error);
    emptyState.classList.add('hidden');
    renderStateMessage(walksGrid, {
      title: 'Chargement impossible',
      text: 'Nous n’avons pas pu récupérer le catalogue. Vérifiez votre connexion ou réessayez.',
      variant: 'error',
      onRetry: () => bootstrap()
    });
  }
}

// Chips famille (hero)
quickFamilyButtons.forEach((button) => {
  if (button.dataset.family === undefined) return;
  button.addEventListener('click', () => {
    state.family = button.dataset.family || '';
    if (familyFilter) familyFilter.value = state.family;
    loadWalks();
  });
});

bootstrap();
