window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, setStatus, activateNav, toApiDatetime, toInputDatetime, parseDate, badgeMarkup, normalizePublicImageUrl } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const walkForm = document.getElementById('walkForm');
  const pageTitle = document.getElementById('pageTitle');
  const occurrenceList = document.getElementById('occurrenceList');
  const createOccurrenceForm = document.getElementById('createOccurrenceForm');

  const infoSection = document.getElementById('infoSection');
  const occurrencesSection = document.getElementById('occurrencesSection');
  const tabInfo = document.getElementById('tabInfo');
  const tabOccurrences = document.getElementById('tabOccurrences');

  const familySelect = document.getElementById('familySelect');
  const subcategorySelect = document.getElementById('subcategorySelect');
  const placeSelect = document.getElementById('placeSelect');
  const coverUploadInput = document.getElementById('coverUploadInput');
  const coverPreview = document.getElementById('coverPreview');
  const contentImageUploadInput = document.getElementById('contentImageUploadInput');
  const contentImagePreview = document.getElementById('contentImagePreview');
  const galleryUploadInput = document.getElementById('galleryUploadInput');
  const galleryInput = document.getElementById('galleryInput');

  const params = new URLSearchParams(window.location.search);
  const walkId = params.get('id');

  let meta = null;
  let currentWalk = null;

  const coverRemoveBtn = document.getElementById('coverRemoveBtn');
  const contentImageRemoveBtn = document.getElementById('contentImageRemoveBtn');

  function setPreview(previewEl, removeBtn, url) {
    if (!previewEl) return;
    const normalized = normalizePublicImageUrl(url);
    if (!normalized) {
      previewEl.removeAttribute('src');
      previewEl.classList.add('hidden');
      if (removeBtn) removeBtn.classList.add('hidden');
      return;
    }
    previewEl.src = normalized;
    previewEl.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.remove('hidden');
  }

  function updateCoverPreview(url) {
    setPreview(coverPreview, coverRemoveBtn, url);
  }

  function updateContentImagePreview(url) {
    setPreview(contentImagePreview, contentImageRemoveBtn, url);
  }

  coverRemoveBtn?.addEventListener('click', () => {
    if (walkForm.elements.cover_image_url) walkForm.elements.cover_image_url.value = '';
    updateCoverPreview('');
  });
  contentImageRemoveBtn?.addEventListener('click', () => {
    if (walkForm.elements.content_image_url) walkForm.elements.content_image_url.value = '';
    updateContentImagePreview('');
  });

  function galleryToTextareaValue(gallery) {
    if (!Array.isArray(gallery)) {
      return '';
    }

    return gallery
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .join('\n');
  }

  function textareaValueToGallery(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function listToTextareaValue(items) {
    if (!Array.isArray(items)) {
      return '';
    }

    return items
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .join('\n');
  }

  function textareaValueToList(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function setTab(tab) {
    const isOccurrences = tab === 'occurrences';
    infoSection.classList.toggle('hidden', isOccurrences);
    occurrencesSection.classList.toggle('hidden', !isOccurrences);
    tabInfo.classList.toggle('active', !isOccurrences);
    tabOccurrences.classList.toggle('active', isOccurrences);

    const hash = isOccurrences ? '#occurrences' : '#info';
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  function currentTabFromUrl() {
    return window.location.hash === '#occurrences' ? 'occurrences' : 'info';
  }

  function populateMeta(metaData) {
    familySelect.innerHTML = '';
    metaData.families
      .filter((family) => family.code !== 'sur-mesure')
      .forEach((family) => familySelect.appendChild(new Option(family.label_fr, family.code)));

    subcategorySelect.innerHTML = '<option value="">Aucune</option>';
    metaData.subcategories.forEach((item) => subcategorySelect.appendChild(new Option(item.name_fr, item.id)));

    placeSelect.innerHTML = '<option value="">Aucun</option>';
    metaData.places.forEach((item) => placeSelect.appendChild(new Option(item.name_fr, item.id)));
  }

  function setFormFromWalk(walk) {
    currentWalk = walk;
    walkForm.elements.family_code.value = walk.family_code || 'decouverte';
    walkForm.elements.subcategory_id.value = walk.subcategory_id || '';
    walkForm.elements.place_id.value = walk.place_id || '';
    walkForm.elements.title.value = walk.title || '';
    walkForm.elements.slug.value = walk.slug || '';
    walkForm.elements.summary.value = walk.summary || '';
    walkForm.elements.description.value = walk.description || '';
    walkForm.elements.dates_subtitle.value = walk.dates_subtitle || '';
    walkForm.elements.duration_minutes.value = walk.duration_minutes || '';
    walkForm.elements.level_label.value = walk.level_label || '';
    walkForm.elements.distance_km.value = walk.distance_km || '';
    walkForm.elements.target_public.value = walk.target_public || '';
    walkForm.elements.pmr_accessible.value = walk.pmr_accessible === null || typeof walk.pmr_accessible === 'undefined'
      ? ''
      : (walk.pmr_accessible ? '1' : '0');
    walkForm.elements.min_age.value = walk.min_age || '';
    walkForm.elements.price_label.value = walk.price_label || '';
    walkForm.elements.practical_info_lines.value = listToTextareaValue(walk.practical_info || []);
    walkForm.elements.cover_image_url.value = walk.cover_image_url || '';
    walkForm.elements.content_image_url.value = walk.content_image_url || '';
    updateCoverPreview(walk.cover_image_url || '');
    updateContentImagePreview(walk.content_image_url || '');
    walkForm.elements.booking_mode.value = walk.booking_mode || 'hybrid';
    walkForm.elements.booking_url.value = walk.booking_url || '';
    walkForm.elements.booking_embed_url.value = walk.booking_embed_url || '';
    walkForm.elements.status.value = walk.status || 'draft';
    if (galleryInput) {
      galleryInput.value = galleryToTextareaValue(walk.gallery);
    }

    occurrenceList.innerHTML = (walk.occurrences || []).length
      ? walk.occurrences
          .map((occurrence) => {
            return `
              <article class="item">
                <h4>${parseDate(occurrence.starts_at)} ${badgeMarkup(occurrence.status)}</h4>
                <form class="stack js-occ-edit" data-occurrence-id="${occurrence.id}">
                  <div class="grid-4">
                    <label>Debut
                      <input type="datetime-local" name="starts_at" value="${toInputDatetime(occurrence.starts_at)}" required>
                    </label>
                    <label>Fin
                      <input type="datetime-local" name="ends_at" value="${toInputDatetime(occurrence.ends_at)}">
                    </label>
                    <label>Capacite max
                      <input type="number" name="max_capacity" min="1" step="1" value="${occurrence.max_capacity ?? ''}">
                    </label>
                    <label>Places disponibles
                      <input type="number" name="available_capacity" min="0" step="1" value="${occurrence.available_capacity ?? ''}">
                    </label>
                  </div>
                  <div class="grid-3">
                    <label>URL réservation
                      <input name="booking_url" value="${occurrence.booking_url ?? ''}">
                    </label>
                    <label>URL iframe
                      <input name="booking_embed_url" value="${occurrence.booking_embed_url ?? ''}">
                    </label>
                    <label>Statut
                      <select name="status">
                        <option value="draft" ${occurrence.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                        <option value="published" ${occurrence.status === 'published' ? 'selected' : ''}>Publie</option>
                        <option value="cancelled" ${occurrence.status === 'cancelled' ? 'selected' : ''}>Annule</option>
                      </select>
                    </label>
                  </div>
                  <div class="table-actions">
                    <button type="submit" class="btn-update-occurrence">Mettre a jour occurrence</button>
                    <button type="button" class="btn-danger js-occ-delete" data-occurrence-id="${occurrence.id}">Supprimer</button>
                  </div>
                </form>
              </article>
            `;
          })
          .join('')
      : '<p class="muted">Aucune occurrence pour cette promenade.</p>';

    bindOccurrenceEditors();
    bindOccurrenceDeletes();
  }

  function bindOccurrenceEditors() {
    document.querySelectorAll('.js-occ-edit').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const occurrenceId = form.getAttribute('data-occurrence-id');
        const formData = new FormData(form);

        const payload = {
          starts_at: toApiDatetime(formData.get('starts_at')),
          ends_at: toApiDatetime(formData.get('ends_at')),
          max_capacity: formData.get('max_capacity') || null,
          available_capacity: formData.get('available_capacity') || null,
          booking_url: formData.get('booking_url'),
          booking_embed_url: formData.get('booking_embed_url'),
          status: formData.get('status'),
        };

        try {
          await apiFetch('/admin/walk-occurrences/' + occurrenceId, {
            method: 'POST',
            body: JSON.stringify(payload),
          });

          await reloadCurrentWalk();
          setStatus(statusEl, 'Occurrence mise a jour.');
        } catch (error) {
          setStatus(statusEl, error.message, true);
        }
      });
    });
  }

  function bindOccurrenceDeletes() {
    document.querySelectorAll('.js-occ-delete').forEach((button) => {
      button.addEventListener('click', async () => {
        const occurrenceId = button.getAttribute('data-occurrence-id');
        if (!occurrenceId) {
          return;
        }

        const confirmed = window.confirm('Supprimer cette occurrence ? Cette action est irreversible.');
        if (!confirmed) {
          return;
        }

        try {
          await apiFetch('/admin/walk-occurrences/' + occurrenceId, {
            method: 'DELETE',
          });

          await reloadCurrentWalk();
          setStatus(statusEl, 'Occurrence supprimee.');
        } catch (error) {
          setStatus(statusEl, error.message, true);
        }
      });
    });
  }

  async function reloadCurrentWalk() {
    if (!walkId) {
      return;
    }

    const data = await apiFetch('/admin/walks');
    const refreshed = (data.items || []).find((walk) => String(walk.id) === String(walkId));
    if (!refreshed) {
      throw new Error('Promenade introuvable.');
    }

    setFormFromWalk(refreshed);
  }

  function buildPayload() {
    const formData = new FormData(walkForm);
    return {
      family_code: formData.get('family_code'),
      subcategory_id: formData.get('subcategory_id') || null,
      place_id: formData.get('place_id') || null,
      title: formData.get('title'),
      slug: formData.get('slug'),
      summary: formData.get('summary'),
      description: formData.get('description'),
      dates_subtitle: formData.get('dates_subtitle'),
      duration_minutes: formData.get('duration_minutes') || null,
      level_label: formData.get('level_label'),
      distance_km: formData.get('distance_km') || null,
      target_public: formData.get('target_public'),
      pmr_accessible: formData.get('pmr_accessible') === '' ? null : Number(formData.get('pmr_accessible')),
      min_age: formData.get('min_age') || null,
      price_label: formData.get('price_label'),
      cover_image_url: formData.get('cover_image_url'),
      content_image_url: formData.get('content_image_url'),
      booking_mode: formData.get('booking_mode'),
      booking_url: formData.get('booking_url'),
      booking_embed_url: formData.get('booking_embed_url'),
      status: formData.get('status'),
      gallery: textareaValueToGallery(formData.get('gallery_urls')),
      practical_info: textareaValueToList(formData.get('practical_info_lines')),
    };
  }

  if (walkForm.elements.cover_image_url) {
    walkForm.elements.cover_image_url.addEventListener('input', (event) => {
      updateCoverPreview(event.target.value);
    });
  }

  if (walkForm.elements.content_image_url) {
    walkForm.elements.content_image_url.addEventListener('input', (event) => {
      updateContentImagePreview(event.target.value);
    });
  }

  function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format non supporte. Utilise JPG, PNG, WEBP ou GIF.');
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image trop lourde. Taille max: 8MB.');
    }
  }

  async function uploadImageFile(file) {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('../api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });

    const rawText = await response.text();
    let payload = {};
    try {
      payload = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      payload = {};
    }

    if (!response.ok) {
      const details = payload.error || (rawText ? rawText.slice(0, 160) : '');
      throw new Error(details || ('Erreur upload: ' + response.status));
    }

    return payload?.item?.url || '';
  }

  function appendGalleryUrl(url) {
    if (!galleryInput || !url) {
      return;
    }

    const lines = textareaValueToGallery(galleryInput.value);
    if (lines.includes(url)) {
      return;
    }

    lines.push(url);
    galleryInput.value = lines.join('\n');
  }

  if (coverUploadInput) {
    coverUploadInput.addEventListener('change', async () => {
      const file = coverUploadInput.files && coverUploadInput.files[0];
      if (!file) {
        return;
      }

      try {
        setStatus(statusEl, 'Televersement image en cours...');
        const uploadedUrl = await uploadImageFile(file);
        walkForm.elements.cover_image_url.value = uploadedUrl;
        updateCoverPreview(uploadedUrl);
        setStatus(statusEl, 'Image televersee. Pense a enregistrer la promenade.');
      } catch (error) {
        setStatus(statusEl, error.message, true);
      } finally {
        coverUploadInput.value = '';
      }
    });
  }

  if (contentImageUploadInput) {
    contentImageUploadInput.addEventListener('change', async () => {
      const file = contentImageUploadInput.files && contentImageUploadInput.files[0];
      if (!file) {
        return;
      }

      try {
        setStatus(statusEl, 'Televersement image contenu en cours...');
        const uploadedUrl = await uploadImageFile(file);
        walkForm.elements.content_image_url.value = uploadedUrl;
        updateContentImagePreview(uploadedUrl);
        setStatus(statusEl, 'Image contenu televersee. Pense a enregistrer la promenade.');
      } catch (error) {
        setStatus(statusEl, error.message, true);
      } finally {
        contentImageUploadInput.value = '';
      }
    });
  }

  if (galleryUploadInput) {
    galleryUploadInput.addEventListener('change', async () => {
      const files = Array.from(galleryUploadInput.files || []);
      if (files.length === 0) {
        return;
      }

      let uploadedCount = 0;
      try {
        for (const file of files) {
          setStatus(statusEl, `Televersement galerie: ${uploadedCount + 1}/${files.length}...`);
          const uploadedUrl = await uploadImageFile(file);
          appendGalleryUrl(uploadedUrl);
          uploadedCount += 1;
        }

        setStatus(statusEl, `${uploadedCount} image(s) galerie televersee(s). Pense a enregistrer la promenade.`);
      } catch (error) {
        setStatus(statusEl, error.message, true);
      } finally {
        galleryUploadInput.value = '';
      }
    });
  }

  walkForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const payload = buildPayload();
      const data = walkId
        ? await apiFetch('/admin/walks/' + walkId, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
        : await apiFetch('/admin/walks', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      setStatus(statusEl, 'Promenade enregistree.');

      if (!walkId && data.item?.id) {
        window.location.href = 'walk-edit.html?id=' + data.item.id;
        return;
      }

      if (data.item) {
        setFormFromWalk(data.item);
      }
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  createOccurrenceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!walkId) {
      setStatus(statusEl, 'Enregistre d abord la promenade pour ajouter des occurrences.', true);
      return;
    }

    const formData = new FormData(createOccurrenceForm);
    const payload = {
      walk_id: Number(walkId),
      starts_at: toApiDatetime(formData.get('starts_at')),
      ends_at: toApiDatetime(formData.get('ends_at')),
      max_capacity: formData.get('max_capacity') || null,
      available_capacity: formData.get('available_capacity') || null,
      booking_url: formData.get('booking_url'),
      booking_embed_url: formData.get('booking_embed_url'),
      status: formData.get('status') || 'published',
    };

    try {
      await apiFetch('/admin/walk-occurrences', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      createOccurrenceForm.reset();
      await reloadCurrentWalk();
      setStatus(statusEl, 'Occurrence ajoutee.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  tabInfo.addEventListener('click', () => setTab('info'));
  tabOccurrences.addEventListener('click', () => setTab('occurrences'));

  try {
    const [familiesData, subcategoriesData, placesData] = await Promise.all([
      apiFetch('/admin/families'),
      apiFetch('/admin/subcategories'),
      apiFetch('/admin/places'),
    ]);
    meta = {
      families: familiesData.items || [],
      subcategories: subcategoriesData.items || [],
      places: placesData.items || [],
    };
    populateMeta(meta);

    if (walkId) {
      await reloadCurrentWalk();
      pageTitle.textContent = `Edition promenade: ${currentWalk?.title || ''}`;
    } else {
      pageTitle.textContent = 'Nouvelle promenade';
      occurrenceList.innerHTML = '<p class="muted">Les occurrences seront disponibles apres creation.</p>';
    }

    if (!walkId && currentTabFromUrl() === 'occurrences') {
      setTab('info');
      setStatus(statusEl, 'Enregistre d abord la promenade pour ouvrir le sous-menu Occurrences.', true);
    } else {
      setTab(currentTabFromUrl());
    }

    setStatus(statusEl, 'Formulaire pret.');
  } catch (error) {
    setStatus(statusEl, error.message, true);
  }
});
