document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('categories');
  if (!container) {
    document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;position:fixed;z-index:999;background:#000;padding:10px;">ERRORE: #categories non trovato</p>');
    return;
  }

  if (typeof portfolioData === 'undefined') {
    container.innerHTML = '<p class="loading-text">ERRORE: portfolioData non definito. js/data.js non si è caricato.</p>';
    return;
  }

  if (!portfolioData.length) {
    container.innerHTML = '<p class="loading-text">Nessuna cartella trovata in img/.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'category-grid';

  portfolioData.forEach(folder => {
    const card = document.createElement('a');
    card.className = 'category-card';
    card.href = `gallery.html?folder=${encodeURIComponent(folder.id)}`;

    const img = document.createElement('img');
    img.src = folder.cover;
    img.alt = folder.name;
    img.loading = 'lazy';
    img.onerror = () => console.error('Immagine non caricata:', folder.cover);

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
  console.log('OK: portfolio caricato con', portfolioData.length, 'cartelle');
});
