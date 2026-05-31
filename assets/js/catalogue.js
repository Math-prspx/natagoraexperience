const API_BASE = window.PublicUtils.apiBaseUrl();
const { buildWalkCardMarkup } = window.PublicUtils;

const familyFilter = document.getElementById('familyFilter');
const subcategoryFilter = document.getElementById('subcategoryFilter');
const placeFilter = document.getElementById('placeFilter');
const dateFilter = document.getElementById('dateFilter');
const refreshBtn = document.getElementById('refreshBtn');
const walksGrid = document.getElementById('walksGrid');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const quickFamilyButtons = Array.from(document.querySelectorAll('.cat-hero-chips [data-family]'));
const placeholderCovers = ['img/Map-bgr-01.png', 'img/Path_line.png', 'img/logo.png'];

function applyInitialFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const family = params.get('family');
  if (family) {
    familyFilter.value = family;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur API: ' + response.status);
  }
  return response.json();
}

function optionItem(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function syncQuickFamilyButtons() {
  const activeFamily = familyFilter?.value || '';
  quickFamilyButtons.forEach((button) => {
    button.classList.toggle('is-active', (button.dataset.family || '') === activeFamily);
  });
}

async function loadFilterData() {
  const [subcategories, places] = await Promise.all([
    fetchJson(API_BASE + '/public/subcategories'),
    fetchJson(API_BASE + '/public/places'),
  ]);

  subcategories.items.forEach((item) => {
    subcategoryFilter.appendChild(optionItem(item.slug, item.name_fr));
  });

  places.items.forEach((item) => {
    placeFilter.appendChild(optionItem(item.slug, item.name_fr));
  });
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

async function loadWalks() {
  walksGrid.innerHTML = '';
  syncQuickFamilyButtons();

  const params = new URLSearchParams();
  if (familyFilter.value) params.set('family', familyFilter.value);
  if (subcategoryFilter.value) params.set('subcategory', subcategoryFilter.value);
  if (placeFilter.value) params.set('place', placeFilter.value);
  if (dateFilter.value) params.set('from_date', dateFilter.value + ' 00:00:00');

  const data = await fetchJson(API_BASE + '/public/walks?' + params.toString());
  if (resultsCount) {
    const count = data.items.length;
    resultsCount.textContent = count > 1 ? `${count} promenades trouvées` : `${count} promenade trouvée`;
  }

  if (data.items.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  data.items.forEach((item, index) => walksGrid.appendChild(renderWalkCard(item, index)));
}

async function bootstrap() {
  try {
    applyInitialFiltersFromUrl();
    await loadFilterData();
    await loadWalks();
  } catch (error) {
    console.error(error);
    emptyState.textContent = 'Impossible de charger le catalogue pour le moment.';
    emptyState.classList.remove('hidden');
  }
}

refreshBtn?.addEventListener('click', loadWalks);
familyFilter?.addEventListener('change', loadWalks);
subcategoryFilter?.addEventListener('change', loadWalks);
placeFilter?.addEventListener('change', loadWalks);
dateFilter?.addEventListener('change', loadWalks);

quickFamilyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    familyFilter.value = button.dataset.family || '';
    loadWalks();
  });
});

bootstrap();
