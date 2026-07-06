document.addEventListener('DOMContentLoaded', () => {
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

  folder.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'feed-image';
    img.src = src;
    img.alt = `${folder.name} - ${i + 1}`;
    img.loading = 'lazy';
    feed.appendChild(img);
  });
});
