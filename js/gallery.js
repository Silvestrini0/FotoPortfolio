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

  const hasBw = folder.bwImages && folder.bwImages.length === folder.images.length;

  for (let i = 0; i < imageInfos.length; i++) {
    const cur = imageInfos[i];
    const nxt = imageInfos[i + 1];
    const bwSrc = hasBw ? folder.bwImages[i] : null;

    if (cur.isPortrait && nxt && nxt.isPortrait) {
      const row = document.createElement('div');
      row.className = 'feed-row duo';
      const nxtBw = hasBw ? folder.bwImages[i + 1] : null;

      [cur, nxt].forEach((info, j) => {
        const img = document.createElement('img');
        img.className = 'feed-image portrait';
        img.src = info.thumb;
        img.alt = info.alt;
        img.loading = 'lazy';
        img.onerror = function () { this.src = info.full; };
        const b = j === 0 ? bwSrc : nxtBw;
        img.addEventListener('click', () => window.openLightbox(info.thumb, info.full, b));
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
      img.addEventListener('click', () => window.openLightbox(cur.thumb, cur.full, bwSrc));
      feed.appendChild(img);
    }
  }
});
