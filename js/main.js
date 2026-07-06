document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('categories');
  if (!container || !window.portfolioData) return;

  if (!window.portfolioData.length) {
    container.innerHTML = '<p class="loading-text">Nessuna cartella trovata in img/. Crea una cartella con delle foto e fai push.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'category-grid';

  window.portfolioData.forEach(folder => {
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
});
