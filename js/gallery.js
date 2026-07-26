document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const folderId = params.get('folder');

  if (!folderId || typeof portfolioData === 'undefined') {
    window.location.href = 'index.html';
    return;
  }

  const folder = portfolioData.find(f => f.id === folderId);
  if (!folder || !folder.images.length) {
    window.location.href = 'index.html';
    return;
  }

  const titleEl = document.getElementById('gallery-title');
  if (titleEl) titleEl.textContent = folder.name.toUpperCase();

  const feed = document.getElementById('feed');
  if (!feed) return;

  feed.innerHTML = '<p class="loading-text">Caricamento...</p>';

  const imageInfos = await Promise.all(folder.images.map((src, i) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ src, alt: `${folder.name} - ${i + 1}`, isPortrait: img.naturalHeight > img.naturalWidth });
      img.onerror = () => resolve({ src, alt: `${folder.name} - ${i + 1}`, isPortrait: false });
      img.src = src;
    });
  }));

  feed.innerHTML = '';

  const portraits = imageInfos.filter(info => info.isPortrait);
  const landscapes = imageInfos.filter(info => !info.isPortrait);

  if (portraits.length) {
    const grid = document.createElement('div');
    grid.className = 'portrait-grid';

    portraits.forEach(info => {
      const img = document.createElement('img');
      img.className = 'feed-image';
      img.src = info.src;
      img.alt = info.alt;
      img.loading = 'lazy';
      grid.appendChild(img);
    });

    feed.appendChild(grid);
  }

  landscapes.forEach(info => {
    const img = document.createElement('img');
    img.className = 'feed-image';
    img.src = info.src;
    img.alt = info.alt;
    img.loading = 'lazy';
    feed.appendChild(img);
  });
});
