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

  const hasThumbs = folder.thumbs && folder.thumbs.length === folder.images.length;

  const imageInfos = await Promise.all(folder.images.map((src, i) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({
        full: src,
        thumb: hasThumbs ? folder.thumbs[i] : src,
        alt: `${folder.name} - ${i + 1}`,
        isPortrait: img.naturalHeight > img.naturalWidth
      });
      img.onerror = () => resolve({
        full: src,
        thumb: hasThumbs ? folder.thumbs[i] : src,
        alt: `${folder.name} - ${i + 1}`,
        isPortrait: false
      });
      img.src = src;
    });
  }));

  feed.innerHTML = '';

  imageInfos.forEach((info, i) => {
    const img = document.createElement('img');
    img.className = 'feed-image' + (info.isPortrait ? ' portrait' : ' landscape');
    img.src = info.thumb;
    img.alt = info.alt;
    img.loading = 'lazy';
    img.onerror = function () { this.src = info.full; };
    img.addEventListener('click', () => openLightbox(info.thumb, info.full, null));
    feed.appendChild(img);
  });
});
