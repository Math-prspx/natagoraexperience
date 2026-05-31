window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, setStatus, activateNav, escapeHtml, badgeMarkup } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const walksBody = document.getElementById('walksBody');
  const familyFilter = document.getElementById('familyFilter');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  const reloadBtn = document.getElementById('reloadBtn');

  let walks = [];

  function renderRows() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const selectedFamily = familyFilter.value;
    const selectedStatus = statusFilter.value;

    const filtered = walks.filter((walk) => {
      if (selectedFamily && walk.family_code !== selectedFamily) return false;
      if (selectedStatus && walk.status !== selectedStatus) return false;

      if (q) {
        const hay = [
          walk.title,
          walk.slug,
          walk.family_label,
          walk.subcategory_name,
          walk.place_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    walksBody.innerHTML = filtered.length
      ? filtered
          .map(
            (walk) => `
              <tr>
                <td><strong>${escapeHtml(walk.title || '')}</strong><br><span class="muted">${escapeHtml(walk.slug || '')}</span></td>
                <td>${escapeHtml(walk.family_label || '-')}</td>
                <td>${escapeHtml(walk.subcategory_name || '-')}</td>
                <td>${escapeHtml(walk.place_name || '-')}</td>
                <td>${walk.occurrences?.length || 0}</td>
                <td>${badgeMarkup(walk.status)}</td>
                <td>
                  <div class="table-actions">
                    <a class="btn btn-secondary" href="walk-edit.html?id=${walk.id}">Editer</a>
                    <a class="btn btn-secondary" href="walk-edit.html?id=${walk.id}#occurrences">Occurrences</a>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="7" class="muted">Aucun resultat.</td></tr>';
  }

  async function load() {
    try {
      const [walkData, familyData] = await Promise.all([apiFetch('/admin/walks'), apiFetch('/admin/families')]);
      walks = walkData.items || [];
      const families = familyData.items || [];

      familyFilter.innerHTML = '<option value="">Toutes</option>';
      families
        .filter((family) => family.code !== 'sur-mesure')
        .forEach((family) => {
          familyFilter.appendChild(new Option(family.label_fr, family.code));
        });

      renderRows();
      setStatus(statusEl, 'Liste des promenades chargee.');
    } catch (error) {
      setStatus(statusEl, error.message, true);
    }
  }

  familyFilter.addEventListener('change', renderRows);
  statusFilter.addEventListener('change', renderRows);
  searchInput.addEventListener('input', renderRows);
  reloadBtn.addEventListener('click', load);

  load();
});
