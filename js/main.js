document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('categories');
  if (!container) {
    document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;position:fixed;z-index:999;background:#000;padding:10px;">ERRORE: #categories non trovato</p>');
    return;
  }

  if (typeof portfolioData === 'undefined') {
    container.innerHTML = '<p class="loading-text">ERRORE: portfolioData non definito.</p>';
    return;
  }

  if (!portfolioData.length && !(typeof singoleData !== 'undefined' && singoleData.length)) {
    container.innerHTML = '<p class="loading-text">Nessuna foto trovata in img/.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'category-grid';

  const folders = portfolioData || [];
  const singles = (typeof singoleData !== 'undefined' ? singoleData : []) || [];

  const maxLen = Math.max(folders.length, singles.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < folders.length) {
      const folder = folders[i];
      const card = document.createElement('a');
      card.className = 'category-card';
      card.href = `gallery.html?folder=${encodeURIComponent(folder.id)}`;

      const img = document.createElement('img');
      img.src = folder.coverThumb || folder.cover;
      img.alt = folder.name;
      img.loading = 'lazy';
      img.onerror = function () {
        this.src = folder.cover;
      };

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
    }

    if (i < singles.length) {
      const single = singles[i];
      const card = document.createElement('div');
      card.className = 'single-card';
      card.dataset.src = single.src;

      const img = document.createElement('img');

      if (single.bwSrc) {
        const blend = document.createElement('div');
        blend.className = 'bw-blend';

        const colorImg = document.createElement('img');
        colorImg.src = single.thumb;
        colorImg.alt = '';
        colorImg.loading = 'lazy';
        colorImg.onerror = function () {
          this.src = single.src;
        };

        const bwImg = document.createElement('img');
        bwImg.className = 'bw-overlay';
        bwImg.src = single.bwThumb || single.bwSrc;
        bwImg.alt = '';
        bwImg.loading = 'lazy';
        bwImg.onerror = function () {
          this.src = single.bwSrc;
        };

        blend.appendChild(colorImg);
        blend.appendChild(bwImg);
        card.appendChild(blend);
      } else {
        img.src = single.thumb;
        img.alt = '';
        img.loading = 'lazy';
        img.onerror = function () {
          this.src = single.src;
        };
        card.appendChild(img);
      }

      card.addEventListener('click', () => openLightbox(single.src));
      grid.appendChild(card);
    }
  }

  container.appendChild(grid);
  console.log('OK: portfolio caricato con', folders.length, 'cartelle,', singles.length, 'singole');
});

// --- Lightbox ---
let lightboxEl = null;

function openLightbox(src) {
  if (!lightboxEl) {
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeLightbox);
    lightboxEl.appendChild(closeBtn);

    const img = document.createElement('img');
    img.id = 'lightbox-img';
    img.alt = '';
    lightboxEl.appendChild(img);

    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    document.body.appendChild(lightboxEl);
  }

  const img = document.getElementById('lightbox-img');
  img.src = src;
  lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('active');
  document.body.style.overflow = '';
}
