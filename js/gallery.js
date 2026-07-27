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

  const hasThumbs = folder.thumbs && folder.thumbs.length === folder.images.length;
  const hasOrientations = folder.orientations && folder.orientations.length === folder.images.length;
  const hasBw = folder.bwImages && folder.bwImages.length === folder.images.length;

  // Build image info synchronously from data (no preloading)
  const imageInfos = folder.images.map((src, i) => ({
    full: src,
    thumb: hasThumbs ? folder.thumbs[i] : src,
    alt: `${folder.name} - ${i + 1}`,
    isPortrait: hasOrientations ? folder.orientations[i] === 'portrait' : true
  }));

  // Build gallery items for lightbox navigation
  const galleryItems = imageInfos.map((info, i) => ({
    full: info.full,
    thumb: info.thumb,
    bw: hasBw ? folder.bwImages[i] : null
  }));

  feed.innerHTML = '';

  for (let i = 0; i < imageInfos.length; i++) {
    const cur = imageInfos[i];
    const nxt = imageInfos[i + 1];

    if (cur.isPortrait && nxt && nxt.isPortrait) {
      const row = document.createElement('div');
      row.className = 'feed-row duo';

      [cur, nxt].forEach((info, j) => {
        const img = document.createElement('img');
        img.className = 'feed-image portrait';
        img.src = info.thumb;
        img.alt = info.alt;
        img.loading = 'lazy';
        img.onerror = function () { this.src = info.full; };
        const idx = i + j;
        img.addEventListener('click', () => window.openGalleryLightbox(galleryItems, idx));
        row.appendChild(img);
      });

      feed.appendChild(row);
      i++;
    } else {
      const img = document.createElement('img');
      img.className = 'feed-image';
      img.src = cur.thumb;
      img.alt = cur.alt;
      img.loading = 'lazy';
      img.onerror = function () { this.src = cur.full; };
      img.addEventListener('click', () => window.openGalleryLightbox(galleryItems, i));
      feed.appendChild(img);
    }
  }
});
