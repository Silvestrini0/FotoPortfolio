// Shared lightbox — used by both main.js (singles) and gallery.js (folders)

let lightboxEl = null;
let lbState = { showBW: false, zoom: false, hasBW: false, zoomLevel: 1, panX: 0, panY: 0 };
let isDragging = false, dragStartX, dragStartY, dragOrigX, dragOrigY;
let lbGallery = null, lbIndex = -1;
let navCooldown = false;

// Touch state
let tMode = null; // 'pan' | 'swipe' | 'pinch'
let tStartX, tStartY, tPinchDist;

function byId(id) { return document.getElementById(id); }

function openLightbox(thumbSrc, fullSrc, bwSrc) {
  if (!lightboxEl) buildLightbox();
  lbGallery = null;
  lbIndex = -1;
  resetState();
  showImage(fullSrc, bwSrc, true);
  updateToolbar();
  if (lightboxEl) lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openGalleryLightbox(gallery, index) {
  if (!lightboxEl) buildLightbox();
  lbGallery = gallery;
  lbIndex = index;
  preloadNeighbors();
  resetState();
  showImage(lbGallery[lbIndex].full, lbGallery[lbIndex].bw, true);
  updateToolbar();
  if (lightboxEl) lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function resetState() {
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
}

function showImage(src, bwSrc, instant) {
  lbState.hasBW = !!bwSrc;
  lbState.showBW = false;
  const wrapper = byId('lb-wrapper');
  if (wrapper) wrapper.classList.remove('show-bw');

  const colorImg = byId('lb-img');
  const bwImg = byId('lb-bw');
  if (bwImg) bwImg.src = bwSrc || '';

  if (colorImg) {
    if (instant) {
      colorImg.style.transition = 'none';
      colorImg.src = src;
      colorImg.style.opacity = '1';
      return;
    }
    colorImg.style.transition = 'none';
    colorImg.style.opacity = '0';
    colorImg.src = src;
    colorImg.offsetHeight;
    colorImg.style.transition = '';
    colorImg.style.opacity = '1';
  }
}

function preloadNeighbors() {
  if (!lbGallery) return;
  [-1, 1].forEach(dir => {
    const ni = (lbIndex + dir + lbGallery.length) % lbGallery.length;
    const img = new Image();
    img.src = lbGallery[ni].full;
  });
}

function navigate(dir) {
  if (!lbGallery || navCooldown) return;
  navCooldown = true;
  lbIndex = (lbIndex + dir + lbGallery.length) % lbGallery.length;
  resetState();
  showImage(lbGallery[lbIndex].full, lbGallery[lbIndex].bw, false);
  updateToolbar();
  preloadNeighbors();
  setTimeout(() => { navCooldown = false; }, 300);
}

function updateToolbar() {
  const prev = byId('lb-prev');
  const next = byId('lb-next');
  const counter = byId('lb-counter');
  const bwBtn = byId('lb-bw-btn');
  const toolbar = byId('lb-toolbar');
  const zoomIn = byId('lb-zoom-in');
  const zoomOut = byId('lb-zoom-out');

  if (lbGallery && lbGallery.length > 1) {
    if (toolbar) toolbar.style.display = '';
    if (prev) { prev.style.display = ''; prev.onclick = () => navigate(-1); }
    if (next) { next.style.display = ''; next.onclick = () => navigate(1); }
    if (counter) counter.textContent = (lbIndex + 1) + ' / ' + lbGallery.length;
  } else {
    if (toolbar) toolbar.style.display = lbState.hasBW ? '' : 'none';
    if (prev) prev.style.display = 'none';
    if (next) next.style.display = 'none';
    if (counter) counter.textContent = '';
  }

  if (bwBtn) {
    bwBtn.style.display = lbState.hasBW ? '' : 'none';
    bwBtn.classList.toggle('active', lbState.showBW);
  }

  if (zoomIn) { zoomIn.style.display = ''; zoomIn.onclick = zoomStepIn; }
  if (zoomOut) { zoomOut.style.display = ''; zoomOut.onclick = zoomStepOut; }
}

function zoomStepIn() {
  stepZoom(0.4);
}

function zoomStepOut() {
  stepZoom(-0.4);
}

function stepZoom(delta) {
  const newLevel = Math.max(1, Math.min(5, lbState.zoomLevel + delta));
  if (newLevel === lbState.zoomLevel) return;
  lbState.zoomLevel = newLevel;
  lbState.zoom = newLevel > 1;
  applyTransform();
}

function toggleBW() {
  if (!lbState.hasBW) return;
  lbState.showBW = !lbState.showBW;
  const wrapper = byId('lb-wrapper');
  if (wrapper) wrapper.classList.toggle('show-bw', lbState.showBW);
  const bwBtn = byId('lb-bw-btn');
  if (bwBtn) bwBtn.classList.toggle('active', lbState.showBW);
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
    <div class="lightbox-toolbar" id="lb-toolbar" style="display:none">
      <button class="lightbox-arrow" id="lb-prev">‹</button>
      <span id="lb-counter"></span>
      <button class="lightbox-arrow" id="lb-next">›</button>
      <div class="lb-zoom-group">
        <button class="lb-zoom-btn" id="lb-zoom-out">−</button>
        <button class="lb-zoom-btn" id="lb-zoom-in">+</button>
      </div>
      <button class="lb-bw-btn" id="lb-bw-btn">BW</button>
    </div>
  `;
  document.body.appendChild(lightboxEl);

  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

  byId('lb-bw-btn').addEventListener('click', toggleBW);

  // Wheel zoom
  lightboxEl.querySelector('#lb-viewport').addEventListener('wheel', onWheel, { passive: false });

  // Mouse drag pan
  const wrapper = lightboxEl.querySelector('#lb-wrapper');
  wrapper.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  // Touch
  wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  document.addEventListener('touchcancel', onTouchEnd);

  // Double-click to toggle zoom
  wrapper.addEventListener('dblclick', () => {
    if (lbState.zoomLevel > 1) {
      lbState.zoomLevel = 1;
      lbState.zoom = false;
      lbState.panX = 0;
      lbState.panY = 0;
    } else {
      lbState.zoomLevel = 2;
      lbState.zoom = true;
    }
    applyTransform();
  });

  document.addEventListener('keydown', e => {
    if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'b' || e.key === 'B') toggleBW();
    if (e.key === '+' || e.key === '=') zoomStepIn();
    if (e.key === '-' || e.key === '_') zoomStepOut();
  });
}

// --- Wheel zoom ---
function onWheel(e) {
  e.preventDefault();
  stepZoom(e.deltaY > 0 ? -0.2 : 0.2);
}

// --- Mouse pan ---
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

// --- Touch ---
function onTouchStart(e) {
  if (e.touches.length === 2) {
    tMode = 'pinch';
    tPinchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    return;
  }
  if (e.touches.length !== 1) return;
  tStartX = e.touches[0].clientX;
  tStartY = e.touches[0].clientY;

  if (lbState.zoomLevel > 1) {
    tMode = 'pan';
    isDragging = true;
    dragStartX = tStartX;
    dragStartY = tStartY;
    dragOrigX = lbState.panX;
    dragOrigY = lbState.panY;
  } else if (lbGallery && lbGallery.length > 1) {
    tMode = 'swipe';
  } else {
    tMode = null;
  }
}

function onTouchMove(e) {
  if (tMode === 'pinch' && e.touches.length === 2) {
    e.preventDefault();
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const ratio = dist / (tPinchDist || 1);
    tPinchDist = dist;
    const newLevel = Math.max(1, Math.min(5, lbState.zoomLevel * ratio));
    if (newLevel !== lbState.zoomLevel) {
      lbState.zoomLevel = newLevel;
      lbState.zoom = newLevel > 1;
      applyTransform();
    }
    return;
  }
  if (tMode === 'pan' && isDragging && e.touches.length === 1) {
    e.preventDefault();
    lbState.panX = dragOrigX + (e.touches[0].clientX - dragStartX);
    lbState.panY = dragOrigY + (e.touches[0].clientY - dragStartY);
    applyTransform();
    return;
  }
  if (tMode === 'swipe' && e.touches.length === 1) {
    const dx = e.touches[0].clientX - tStartX;
    const dy = e.touches[0].clientY - tStartY;
    if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      e.preventDefault();
    }
  }
}

function onTouchEnd(e) {
  if (tMode === 'swipe' && e.changedTouches.length === 1) {
    const dx = e.changedTouches[0].clientX - tStartX;
    const dy = e.changedTouches[0].clientY - tStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      e.preventDefault();
      navigate(dx > 0 ? -1 : 1);
    }
  }
  tMode = null;
  isDragging = false;
  tPinchDist = 0;
}

// --- Transform ---
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

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('active');
  document.body.style.overflow = '';
  lbGallery = null;
  lbIndex = -1;
}

window.openLightbox = openLightbox;
window.openGalleryLightbox = openGalleryLightbox;
window.closeLightbox = closeLightbox;
