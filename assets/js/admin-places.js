window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, setStatus, activateNav, escapeHtml } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const reserveForm = document.getElementById('reserveForm');
  const reserveFormTitle = document.getElementById('reserveFormTitle');
  const reserveSaveBtn = document.getElementById('reserveSaveBtn');
  const reserveResetBtn = document.getElementById('reserveResetBtn');
  const reserveCoverUploadInput = document.getElementById('reserveCoverUploadInput');
  const reserveCoverPreview = document.getElementById('reserveCoverPreview');
  const placesBody = document.getElementById('placesBody');
  let places = [];

  function normalizePublicImageUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    return '/' + value.replace(/^\/+/, '');
  }

  function updateCoverPreview(url) {
    if (!reserveCoverPreview) return;
    const normalized = normalizePublicImageUrl(url);
    if (!normalized) {
      reserveCoverPreview.removeAttribute('src');
      reserveCoverPreview.classList.add('hidden');
      return;
    }

    reserveCoverPreview.src = normalized;
    reserveCoverPreview.classList.remove('hidden');
  }

  function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    return fetch('../api/admin/upload-image', {
      method: 'POST',
      body: formData,
    })
      .then(async (response) => {
        const rawText = await response.text();
        let payload = {};
        try {
          payload = rawText ? JSON.parse(rawText) : {};
        } catch (parseError) {
          payload = {};
        }

        if (!response.ok) {
          throw new Error(payload.error || ('Erreur upload: ' + response.status));
        }

        return payload?.item?.url || '';
      });
  }

  function placeSpecificities(place) {
    const items = Array.isArray(place?.specificities) ? place.specificities : [];
    return [0, 1, 2].map((index) => ({
      image: String(items[index]?.image || '').trim(),
      text: String(items[index]?.text || '').trim(),
    }));
  }

  function collectSpecificities(formData) {
    return [1, 2, 3]
      .map((index) => ({
        image: String(formData.get(`spec_${index}_image`) || '').trim(),
        text: String(formData.get(`spec_${index}_text`) || '').trim(),
      }))
      .filter((item) => item.image || item.text);
  }

  function setFormMode(isEdit) {
    reserveFormTitle.textContent = isEdit ? 'Modifier reserve' : 'Nouvelle reserve';
    reserveSaveBtn.textContent = isEdit ? 'Mettre a jour reserve' : 'Ajouter reserve';
  }

  function resetReserveForm() {
    reserveForm.reset();
    reserveForm.elements.id.value = '';
    updateCoverPreview('');
    setFormMode(false);
  }

  function fillReserveForm(place) {
    reserveForm.elements.id.value = place.id || '';
    reserveForm.elements.name_fr.value = place.name_fr || '';
    reserveForm.elements.slug.value = place.slug || '';
    reserveForm.elements.headline_fr.value = place.headline_fr || '';
    reserveForm.elements.short_description_fr.value = place.short_description_fr || '';
    reserveForm.elements.long_description_fr.value = place.long_description_fr || '';
    reserveForm.elements.cover_image_url.value = place.cover_image_url || '';
    reserveForm.elements.metric_map_label.value = place.metric_map_label || '';
    reserveForm.elements.metric_map_value.value = place.metric_map_value || '';
    reserveForm.elements.area_ha.value = place.area_ha ?? '';
    reserveForm.elements.created_year.value = place.created_year ?? '';
    reserveForm.elements.species_count.value = place.species_count ?? '';

    const specs = placeSpecificities(place);
    reserveForm.elements.spec_1_image.value = specs[0].image;
    reserveForm.elements.spec_1_text.value = specs[0].text;
    reserveForm.elements.spec_2_image.value = specs[1].image;
    reserveForm.elements.spec_2_text.value = specs[1].text;
    reserveForm.elements.spec_3_image.value = specs[2].image;
    reserveForm.elements.spec_3_text.value = specs[2].text;

    updateCoverPreview(place.cover_image_url || '');
    setFormMode(true);
  }

  async function loadMeta() {
    const data = await apiFetch('/admin/places');
    places = data.items || [];

    placesBody.innerHTML = places.length
      ? places
          .map((place) => {
            return `
              <tr>
                <td>${escapeHtml(place.name_fr || '')}</td>
                <td>${escapeHtml(place.slug || '')}</td>
                <td>${escapeHtml(place.short_description_fr || '-')}</td>
                <td>
                  <div class="table-actions">
                    <button type="button" class="btn btn-secondary js-edit-place" data-place-id="${place.id}">Editer</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join('')
      : '<tr><td colspan="4" class="muted">Aucune reserve.</td></tr>';

    document.querySelectorAll('.js-edit-place').forEach((button) => {
      button.addEventListener('click', () => {
        const placeId = Number(button.getAttribute('data-place-id'));
        const selected = places.find((item) => Number(item.id) === placeId);
        if (!selected) {
          setStatus(statusEl, 'Reserve introuvable.', true);
          return;
        }

        fillReserveForm(selected);
        setStatus(statusEl, `Edition de la reserve: ${selected.name_fr}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  reserveForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(reserveForm);
    const reserveId = String(formData.get('id') || '').trim();

    const payload = {
      name_fr: formData.get('name_fr'),
      slug: formData.get('slug'),
      headline_fr: formData.get('headline_fr'),
      short_description_fr: formData.get('short_description_fr'),
      long_description_fr: formData.get('long_description_fr'),
      cover_image_url: formData.get('cover_image_url'),
      metric_map_label: formData.get('metric_map_label'),
      metric_map_value: formData.get('metric_map_value'),
      area_ha: formData.get('area_ha') || null,
      created_year: formData.get('created_year') || null,
      species_count: formData.get('species_count') || null,
      specificities: collectSpecificities(formData),
    };

    try {
      await apiFetch(reserveId ? '/admin/places/' + reserveId : '/admin/places', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadMeta();
      resetReserveForm();
      setStatus(statusEl, reserveId ? 'Reserve mise a jour.' : 'Reserve ajoutee.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  reserveResetBtn.addEventListener('click', () => {
    resetReserveForm();
    setStatus(statusEl, 'Formulaire reserve reinitialise.');
  });

  reserveForm.elements.cover_image_url.addEventListener('input', (event) => {
    updateCoverPreview(event.target.value);
  });

  reserveCoverUploadInput.addEventListener('change', async () => {
    const file = reserveCoverUploadInput.files && reserveCoverUploadInput.files[0];
    if (!file) {
      return;
    }

    try {
      setStatus(statusEl, 'Televersement image reserve en cours...');
      const uploadedUrl = await uploadImageFile(file);
      reserveForm.elements.cover_image_url.value = uploadedUrl;
      updateCoverPreview(uploadedUrl);
      setStatus(statusEl, 'Image televersee. Pense a enregistrer la reserve.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    } finally {
      reserveCoverUploadInput.value = '';
    }
  });

  try {
    await loadMeta();
    resetReserveForm();
    setStatus(statusEl, 'Module reserves pret.');
  } catch (error) {
    setStatus(statusEl, error.message, true);
  }
});
