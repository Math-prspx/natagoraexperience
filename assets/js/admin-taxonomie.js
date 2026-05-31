window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, setStatus, activateNav, escapeHtml } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const subcategoryForm = document.getElementById('subcategoryForm');
  const subcategoryFormTitle = document.getElementById('subcategoryFormTitle');
  const subcategorySaveBtn = document.getElementById('subcategorySaveBtn');
  const subcategoryResetBtn = document.getElementById('subcategoryResetBtn');
  const subcategoriesBody = document.getElementById('subcategoriesBody');

  let subcategories = [];

  function setFormMode(isEdit) {
    if (subcategoryFormTitle) {
      subcategoryFormTitle.textContent = isEdit ? 'Modifier sous-categorie' : 'Nouvelle sous-categorie';
    }
    if (subcategorySaveBtn) {
      subcategorySaveBtn.textContent = isEdit ? 'Mettre a jour sous-categorie' : 'Ajouter sous-categorie';
    }
  }

  function resetForm() {
    subcategoryForm.reset();
    subcategoryForm.elements.id.value = '';
    setFormMode(false);
  }

  function fillForm(item) {
    subcategoryForm.elements.id.value = item.id || '';
    subcategoryForm.elements.name_fr.value = item.name_fr || '';
    subcategoryForm.elements.slug.value = item.slug || '';
    setFormMode(true);
  }

  async function loadSubcategories() {
    const data = await apiFetch('/admin/subcategories');
    subcategories = data.items || [];

    subcategoriesBody.innerHTML = subcategories.length
      ? subcategories
          .map((item) => `
            <tr>
              <td>${escapeHtml(item.name_fr || '')}</td>
              <td>${escapeHtml(item.slug || '')}</td>
              <td>${Number(item.usage_count || 0)}</td>
              <td>
                <div class="table-actions">
                  <button type="button" class="btn btn-secondary js-edit-subcategory" data-subcategory-id="${item.id}">Editer</button>
                  <button type="button" class="btn-danger js-delete-subcategory" data-subcategory-id="${item.id}">Supprimer</button>
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="4" class="muted">Aucune sous-categorie.</td></tr>';

    bindTableActions();
  }

  function bindTableActions() {
    document.querySelectorAll('.js-edit-subcategory').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.getAttribute('data-subcategory-id'));
        const item = subcategories.find((row) => Number(row.id) === id);
        if (!item) {
          setStatus(statusEl, 'Sous-categorie introuvable.', true);
          return;
        }

        fillForm(item);
        setStatus(statusEl, `Edition de la sous-categorie: ${item.name_fr}`);
      });
    });

    document.querySelectorAll('.js-delete-subcategory').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-subcategory-id');
        if (!id) {
          return;
        }

        const confirmed = window.confirm('Supprimer cette sous-categorie ?');
        if (!confirmed) {
          return;
        }

        try {
          await apiFetch('/admin/subcategories/' + id, {
            method: 'DELETE',
          });

          if (String(subcategoryForm.elements.id.value || '') === String(id)) {
            resetForm();
          }

          await loadSubcategories();
          setStatus(statusEl, 'Sous-categorie supprimee.');
        } catch (error) {
          setStatus(statusEl, error.message, true);
        }
      });
    });
  }

  subcategoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(subcategoryForm);
    const subcategoryId = String(formData.get('id') || '').trim();

    try {
      await apiFetch(subcategoryId ? '/admin/subcategories/' + subcategoryId : '/admin/subcategories', {
        method: 'POST',
        body: JSON.stringify({
          name_fr: formData.get('name_fr'),
          slug: formData.get('slug'),
        }),
      });
      resetForm();
      await loadSubcategories();
      setStatus(statusEl, subcategoryId ? 'Sous-categorie mise a jour.' : 'Sous-categorie ajoutee.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  });

  subcategoryResetBtn?.addEventListener('click', () => {
    resetForm();
    setStatus(statusEl, 'Formulaire reinitialise.');
  });

  try {
    resetForm();
    await loadSubcategories();
    setStatus(statusEl, 'Module taxonomie pret.');
  } catch (error) {
    setStatus(statusEl, error.message, true);
  }
});