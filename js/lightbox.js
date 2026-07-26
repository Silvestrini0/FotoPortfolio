// Shared lightbox — used by both main.js (singles) and gallery.js (folders)

let lightboxEl = null;
let lbState = { showBW: false, zoom: false, hasBW: false, isHD: false };

function byId(id) { return document.getElementById(id); }
function safeRemoveClass(sel, cls) { const el = document.querySelector(sel); if (el) el.classList.remove(cls); }

function openLightbox(thumbSrc, fullSrc, bwSrc) {
  if (!lightboxEl) buildLightbox();

  lbState.hasBW = !!bwSrc;
  lbState.showBW = false;
  lbState.zoom = false;
  lbState.isHD = false;

  // Reset HD button FIRST — prima di tutto
  const hdBtn = byId('lb-hd');
  if (hdBtn) {
    hdBtn.textContent = 'HD';
    hdBtn.classList.remove('hd-active');
  }

  safeRemoveClass('.lightbox-viewport', 'zoomed');
  const wrapper = byId('lb-wrapper');
  if (wrapper) wrapper.classList.remove('show-bw', 'zoomed');

  const colorImg = byId('lb-img');
  if (colorImg) {
    colorImg.src = thumbSrc;
    colorImg.dataset.full = fullSrc;
  }

  const bwImg = byId('lb-bw');
  if (bwImg && bwSrc) {
    bwImg.src = bwSrc;
    bwImg.dataset.full = bwSrc;
  }

  const prev = byId('lb-prev');
  const next = byId('lb-next');
  if (prev) prev.style.display = bwSrc ? '' : 'none';
  if (next) next.style.display = bwSrc ? '' : 'none';
  if (hdBtn) hdBtn.style.display = '';

  updateZoomBadge();

  if (lightboxEl) lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function buildLightbox() {
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <div class="lightbox-viewport">
      <div class="lightbox-image-wrapper" id="lb-wrapper">
        <img id="lb-img" class="lb-color" alt="">
        <img id="lb-bw" class="lb-bw" alt="">
      </div>
    </div>
    <div class="lightbox-toolbar">
      <button class="lightbox-arrow" id="lb-prev" style="display:none">‹</button>
      <button class="lightbox-hd-btn" id="lb-hd">HD</button>
      <span class="lightbox-zoom-badge" id="lb-zoom">Adatta</span>
      <button class="lightbox-arrow" id="lb-next" style="display:none">›</button>
    </div>
  `;
  document.body.appendChild(lightboxEl);

  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

  lightboxEl.querySelector('#lb-zoom').addEventListener('click', toggleZoom);
  lightboxEl.querySelector('#lb-hd').addEventListener('click', loadHD);
  lightboxEl.querySelector('#lb-prev').addEventListener('click', () => slideBW(-1));
  lightboxEl.querySelector('#lb-next').addEventListener('click', () => slideBW(1));

  lightboxEl.querySelector('#lb-img').addEventListener('click', toggleZoom);
  lightboxEl.querySelector('#lb-bw').addEventListener('click', toggleZoom);

  document.addEventListener('keydown', e => {
    if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbState.hasBW) slideBW(-1);
    if (e.key === 'ArrowRight' && lbState.hasBW) slideBW(1);
    if (e.key === 'h' || e.key === 'H') loadHD();
  });
}

function loadHD() {
  const hdBtn = byId('lb-hd');
  if (lbState.isHD || !hdBtn) return;

  const colorImg = byId('lb-img');
  if (colorImg && colorImg.dataset.full) {
    colorImg.src = colorImg.dataset.full;
  }

  const bwImg = byId('lb-bw');
  if (bwImg && bwImg.dataset.full) {
    bwImg.src = bwImg.dataset.full;
  }

  lbState.isHD = true;
  hdBtn.textContent = '✓ HD';
  hdBtn.classList.add('hd-active');
}

function toggleZoom() {
  lbState.zoom = !lbState.zoom;
  safeRemoveClass('.lightbox-viewport', 'zoomed');
  if (lbState.zoom) {
    const vp = document.querySelector('.lightbox-viewport');
    const wr = byId('lb-wrapper');
    if (vp) vp.classList.add('zoomed');
    if (wr) wr.classList.add('zoomed');
  } else {
    const wr = byId('lb-wrapper');
    if (wr) wr.classList.remove('zoomed');
  }
  updateZoomBadge();
}

function updateZoomBadge() {
  const badge = byId('lb-zoom');
  if (badge) badge.textContent = lbState.zoom ? '100%' : 'Adatta';
}

function slideBW(dir) {
  const wrapper = byId('lb-wrapper');
  if (!wrapper) return;
  if (dir > 0 && !lbState.showBW) {
    lbState.showBW = true;
    wrapper.classList.add('show-bw');
  } else if (dir < 0 && lbState.showBW) {
    lbState.showBW = false;
    wrapper.classList.remove('show-bw');
  }
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('active');
  document.body.style.overflow = '';
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
