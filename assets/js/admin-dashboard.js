window.addEventListener('DOMContentLoaded', async () => {
  const { apiFetch, parseDate, setStatus, activateNav, escapeHtml, badgeMarkup } = window.AdminV2;
  activateNav();

  const statusEl = document.getElementById('status');
  const kpisEl = document.getElementById('kpis');
  const upcomingBody = document.getElementById('upcomingBody');

  try {
    const data = await apiFetch('/admin/walks');
    const walks = data.items || [];

    const totalWalks = walks.length;
    const publishedWalks = walks.filter((walk) => walk.status === 'published').length;
    const draftWalks = walks.filter((walk) => walk.status === 'draft').length;

    const occurrences = walks.flatMap((walk) =>
      (walk.occurrences || []).map((occurrence) => ({
        ...occurrence,
        walkTitle: walk.title,
      }))
    );

    const now = new Date();
    const upcoming = occurrences
      .filter((occurrence) => new Date(occurrence.starts_at) >= now)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

    kpisEl.innerHTML = `
      <article class="kpi"><span>Promenades totales</span><strong>${totalWalks}</strong></article>
      <article class="kpi"><span>Publiees</span><strong>${publishedWalks}</strong></article>
      <article class="kpi"><span>Brouillons</span><strong>${draftWalks}</strong></article>
      <article class="kpi"><span>Occurrences a venir</span><strong>${upcoming.length}</strong></article>
    `;

    const rows = upcoming.slice(0, 12);
    upcomingBody.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.walkTitle || '')}</td>
                <td>${parseDate(row.starts_at)}</td>
                <td>${row.available_capacity ?? '-'} / ${row.max_capacity ?? '-'}</td>
                <td>${badgeMarkup(row.status)}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="4" class="muted">Aucune occurrence a venir.</td></tr>';

    setStatus(statusEl, 'Dashboard charge.');
  } catch (error) {
    setStatus(statusEl, error.message, true);
  }
});
