window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, toApiDatetime, toInputDatetime, parseDate, setStatus, activateNav, escapeHtml, badgeMarkup } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const createOccurrenceForm = document.getElementById('createOccurrenceForm');
  const walkSelect = document.getElementById('walkSelect');
  const walkFilter = document.getElementById('walkFilter');
  const statusFilter = document.getElementById('statusFilter');
  const fromDate = document.getElementById('fromDate');
  const reloadBtn = document.getElementById('reloadBtn');
  const occurrenceItems = document.getElementById('occurrenceItems');

  let walks = [];

  function allOccurrences() {
    return walks.flatMap((walk) =>
      (walk.occurrences || []).map((occurrence) => ({
        ...occurrence,
        walkId: walk.id,
        walkTitle: walk.title,
      }))
    );
  }

  function fillWalkSelects() {
    const options = ['<option value="">Toutes</option>'];
    walks.forEach((walk) => options.push(`<option value="${walk.id}">${walk.title}</option>`));

    walkFilter.innerHTML = options.join('');

    walkSelect.innerHTML = '<option value="">Selectionner</option>';
    walks.forEach((walk) => {
      walkSelect.appendChild(new Option(walk.title, walk.id));
    });
  }

  function renderOccurrences() {
    const selectedWalk = walkFilter.value;
    const selectedStatus = statusFilter.value;
    const minDate = fromDate.value ? new Date(fromDate.value + 'T00:00:00') : null;

    const rows = allOccurrences()
      .filter((row) => {
        if (selectedWalk && String(row.walkId) !== selectedWalk) return false;
        if (selectedStatus && row.status !== selectedStatus) return false;
        if (minDate && new Date(row.starts_at) < minDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

    if (rows.length === 0) {
      occurrenceItems.innerHTML = '<p class="muted">Aucune occurrence.</p>';
      return;
    }

    occurrenceItems.innerHTML = rows
      .map((row) => {
        return `
          <article class="item">
            <h4>${escapeHtml(row.walkTitle || '')} • ${parseDate(row.starts_at)} ${badgeMarkup(row.status)}</h4>
            <form class="stack js-occ-edit" data-id="${row.id}">
              <div class="grid-4">
                <label>Debut
                  <input type="datetime-local" name="starts_at" value="${toInputDatetime(row.starts_at)}" required>
                </label>
                <label>Fin
                  <input type="datetime-local" name="ends_at" value="${toInputDatetime(row.ends_at)}">
                </label>
                <label>Capacite max
                  <input type="number" name="max_capacity" min="1" step="1" value="${row.max_capacity ?? ''}">
                </label>
                <label>Places disponibles
                  <input type="number" name="available_capacity" min="0" step="1" value="${row.available_capacity ?? ''}">
                </label>
              </div>
              <div class="grid-3">
                <label>Nom du guide
                  <input name="guide_name" value="${row.guide_name ?? ''}">
                </label>
                <label>URL réservation
                  <input name="booking_url" value="${row.booking_url ?? ''}">
                </label>
                <label>URL iframe
                  <input name="booking_embed_url" value="${row.booking_embed_url ?? ''}">
                </label>
                <label>Statut
                  <select name="status">
                    <option value="draft" ${row.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                    <option value="published" ${row.status === 'published' ? 'selected' : ''}>Publie</option>
                    <option value="cancelled" ${row.status === 'cancelled' ? 'selected' : ''}>Annule</option>
                  </select>
                </label>
              </div>
              <div class="table-actions">
                <button type="submit" class="btn-update-occurrence">Mettre a jour</button>
                <button type="button" class="btn-danger js-occ-delete" data-id="${row.id}">Supprimer</button>
              </div>
            </form>
          </article>
        `;
      })
      .join('');

    bindOccurrenceEdits();
    bindOccurrenceDeletes();
  }

  function bindOccurrenceEdits() {
    document.querySelectorAll('.js-occ-edit').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = form.getAttribute('data-id');
        const formData = new FormData(form);
        const payload = {
          starts_at: toApiDatetime(formData.get('starts_at')),
          ends_at: toApiDatetime(formData.get('ends_at')),
          guide_name: formData.get('guide_name'),
          max_capacity: formData.get('max_capacity') || null,
          available_capacity: formData.get('available_capacity') || null,
          booking_url: formData.get('booking_url'),
          booking_embed_url: formData.get('booking_embed_url'),
          status: formData.get('status'),
        };

        try {
          await apiFetch('/admin/walk-occurrences/' + id, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          await load();
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
        const id = button.getAttribute('data-id');
        if (!id) {
          return;
        }

        const isConfirmed = window.confirm('Supprimer cette occurrence ? Cette action est irreversible.');
        if (!isConfirmed) {
          return;
        }

        try {
          await apiFetch('/admin/walk-occurrences/' + id, {
            method: 'DELETE',
          });
          await load();
          setStatus(statusEl, 'Occurrence supprimee.');
        } catch (error) {
          setStatus(statusEl, error.message, true);
        }
      });
    });
  }

  createOccurrenceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(createOccurrenceForm);

    const payload = {
      walk_id: Number(formData.get('walk_id')),
      starts_at: toApiDatetime(formData.get('starts_at')),
      ends_at: toApiDatetime(formData.get('ends_at')),
      guide_name: formData.get('guide_name'),
      max_capacity: formData.get('max_capacity') || null,
      available_capacity: formData.get('available_capacity') || null,
      booking_url: formData.get('booking_url'),
      booking_embed_url: formData.get('booking_embed_url'),
      status: 'published',
    };

    try {
      await apiFetch('/admin/walk-occurrences', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      createOccurrenceForm.reset();
      await load();
      setStatus(statusEl, 'Occurrence ajoutee.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  async function load() {
    const data = await apiFetch('/admin/walks');
    walks = data.items || [];
    fillWalkSelects();
    renderOccurrences();
  }

  walkFilter.addEventListener('change', renderOccurrences);
  statusFilter.addEventListener('change', renderOccurrences);
  fromDate.addEventListener('change', renderOccurrences);
  reloadBtn.addEventListener('click', async () => {
    try {
      await load();
      setStatus(statusEl, 'Liste rafraichie.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  try {
    await load();
    setStatus(statusEl, 'Occurrences chargees.');
  } catch (error) {
    setStatus(statusEl, error.message, true);
  }
});
