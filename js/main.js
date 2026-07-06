document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('categories');
  if (!container) return;

  const loading = document.createElement('p');
  loading.className = 'loading-text';
  loading.textContent = 'Caricamento...';
  container.appendChild(loading);

  try {
    const folders = await getPortfolioData();

    if (!folders || !folders.length) {
      loading.textContent = 'Nessuna cartella trovata in img/.';
      return;
    }

    loading.remove();
    const grid = document.createElement('div');
    grid.className = 'category-grid';

    folders.forEach(folder => {
      const card = document.createElement('a');
      card.className = 'category-card';
      card.href = `gallery.html?folder=${encodeURIComponent(folder.id)}`;

      const img = document.createElement('img');
      img.src = folder.cover;
      img.alt = folder.name;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const title = document.createElement('h2');
      title.textContent = folder.name;

      const count = document.createElement('p');
      count.textContent = `${folder.images.length} fotografie`;

      overlay.appendChild(title);
      overlay.appendChild(count);
      card.appendChild(img);
      card.appendChild(overlay);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (err) {
    loading.textContent = 'Errore nel caricamento. Riprova pi\u00f9 tardi.';
    console.error(err);
  }
});
