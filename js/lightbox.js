// Shared lightbox — used by both main.js (singles) and gallery.js (folders)

let lightboxEl = null;
let lbState = { showBW: false, zoom: false, hasBW: false, zoomLevel: 1, panX: 0, panY: 0 };
let isDragging = false, dragStartX, dragStartY, dragOrigX, dragOrigY;

function byId(id) { return document.getElementById(id); }
function safeRemoveClass(sel, cls) { const el = document.querySelector(sel); if (el) el.classList.remove(cls); }

function openLightbox(thumbSrc, fullSrc, bwSrc) {
  if (!lightboxEl) buildLightbox();

  lbState.hasBW = !!bwSrc;
  lbState.showBW = false;
  lbState.zoom = false;
  lbState.zoomLevel = 1;
  lbState.panX = 0;
  lbState.panY = 0;

  const wrapper = byId('lb-wrapper');
  if (wrapper) {
    wrapper.classList.remove('show-bw', 'zoomed');
    wrapper.style.transform = '';
    wrapper.style.cursor = '';
  }

  byId('lb-viewport').classList.remove('zoomed');

  const colorImg = byId('lb-img');
  if (colorImg) {
    colorImg.src = thumbSrc;
  }

  const bwImg = byId('lb-bw');
  if (bwImg && bwSrc) {
    bwImg.src = bwSrc;
  }

  const prev = byId('lb-prev');
  const next = byId('lb-next');
  if (prev) prev.style.display = bwSrc ? '' : 'none';
  if (next) next.style.display = bwSrc ? '' : 'none';

  updateZoomBadge();

  if (lightboxEl) lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function buildLightbox() {
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <div class="lightbox-viewport" id="lb-viewport">
      <div class="lightbox-image-wrapper" id="lb-wrapper">
        <img id="lb-img" class="lb-color" alt="">
        <img id="lb-bw" class="lb-bw" alt="">
      </div>
    </div>
    <div class="lightbox-toolbar">
      <button class="lightbox-arrow" id="lb-prev" style="display:none">‹</button>
      <span class="lightbox-zoom-badge" id="lb-zoom">100%</span>
      <button class="lightbox-arrow" id="lb-next" style="display:none">›</button>
    </div>
  `;
  document.body.appendChild(lightboxEl);

  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

  lightboxEl.querySelector('#lb-zoom').addEventListener('click', resetZoom);

  lightboxEl.querySelector('#lb-prev').addEventListener('click', () => slideBW(-1));
  lightboxEl.querySelector('#lb-next').addEventListener('click', () => slideBW(1));

  // Wheel zoom
  lightboxEl.querySelector('#lb-viewport').addEventListener('wheel', onWheel, { passive: false });

  // Drag pan
  const wrapper = lightboxEl.querySelector('#lb-wrapper');
  wrapper.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);

  document.addEventListener('keydown', e => {
    if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbState.hasBW) slideBW(-1);
    if (e.key === 'ArrowRight' && lbState.hasBW) slideBW(1);
  });
}

function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.2 : 0.2;
  const newLevel = Math.max(1, Math.min(5, lbState.zoomLevel + delta));
  if (newLevel === lbState.zoomLevel) return;
  lbState.zoomLevel = newLevel;
  lbState.zoom = newLevel > 1;
  applyTransform();
  updateZoomBadge();
}

function onDragStart(e) {
  if (lbState.zoomLevel <= 1) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOrigX = lbState.panX;
  dragOrigY = lbState.panY;
  byId('lb-wrapper').style.cursor = 'grabbing';
  e.preventDefault();
}

function onDragMove(e) {
  if (!isDragging) return;
  lbState.panX = dragOrigX + (e.clientX - dragStartX);
  lbState.panY = dragOrigY + (e.clientY - dragStartY);
  applyTransform();
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (byId('lb-wrapper')) byId('lb-wrapper').style.cursor = lbState.zoomLevel > 1 ? 'grab' : '';
}

function onTouchStart(e) {
  if (lbState.zoomLevel <= 1 || e.touches.length !== 1) return;
  isDragging = true;
  dragStartX = e.touches[0].clientX;
  dragStartY = e.touches[0].clientY;
  dragOrigX = lbState.panX;
  dragOrigY = lbState.panY;
}

function onTouchMove(e) {
  if (!isDragging || e.touches.length !== 1) return;
  lbState.panX = dragOrigX + (e.touches[0].clientX - dragStartX);
  lbState.panY = dragOrigY + (e.touches[0].clientY - dragStartY);
  applyTransform();
  e.preventDefault();
}

function onTouchEnd() { isDragging = false; }

function applyTransform() {
  const wrapper = byId('lb-wrapper');
  if (!wrapper) return;
  const vp = byId('lb-viewport');
  if (lbState.zoomLevel > 1) {
    wrapper.style.transform = `translate(${lbState.panX}px, ${lbState.panY}px) scale(${lbState.zoomLevel})`;
    wrapper.style.cursor = 'grab';
    if (vp) vp.classList.add('zoomed');
  } else {
    wrapper.style.transform = '';
    wrapper.style.cursor = '';
    lbState.panX = 0;
    lbState.panY = 0;
    if (vp) vp.classList.remove('zoomed');
  }
}

function resetZoom() {
  lbState.zoomLevel = 1;
  lbState.zoom = false;
  lbState.panX = 0;
  lbState.panY = 0;
  applyTransform();
  updateZoomBadge();
}

function updateZoomBadge() {
  const badge = byId('lb-zoom');
  if (badge) badge.textContent = lbState.zoomLevel === 1 ? 'Adatta' : Math.round(lbState.zoomLevel * 100) + '%';
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
