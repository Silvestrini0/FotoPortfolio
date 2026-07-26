// Shared lightbox — used by both main.js (singles) and gallery.js (folders)

let lightboxEl = null;
let lbState = { showBW: false, zoom: false, hasBW: false, isHD: false };

function openLightbox(thumbSrc, fullSrc, bwSrc) {
  if (!lightboxEl) buildLightbox();

  lbState.hasBW = !!bwSrc;
  lbState.showBW = false;
  lbState.zoom = false;
  lbState.isHD = false;

  const wrapper = document.getElementById('lb-wrapper');
  wrapper.classList.remove('show-bw', 'zoomed');
  wrapper.querySelectorAll('img').forEach(i => i.classList.remove('zoomed'));

  const colorImg = document.getElementById('lb-img');
  colorImg.src = thumbSrc;
  colorImg.dataset.full = fullSrc;

  const bwImg = document.getElementById('lb-bw');
  if (bwSrc) {
    bwImg.src = bwSrc;
    bwImg.dataset.full = bwSrc;
  }

  document.getElementById('lb-prev').style.display = bwSrc ? '' : 'none';
  document.getElementById('lb-next').style.display = bwSrc ? '' : 'none';

  const hdBtn = document.getElementById('lb-hd');
  hdBtn.style.display = '';
  hdBtn.textContent = 'HD';
  hdBtn.classList.remove('hd-active');

  updateZoomBadge();

  lightboxEl.classList.add('active');
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

  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

  document.getElementById('lb-zoom').addEventListener('click', toggleZoom);
  document.getElementById('lb-hd').addEventListener('click', loadHD);
  document.getElementById('lb-prev').addEventListener('click', () => slideBW(-1));
  document.getElementById('lb-next').addEventListener('click', () => slideBW(1));

  document.getElementById('lb-img').addEventListener('click', toggleZoom);
  document.getElementById('lb-bw').addEventListener('click', toggleZoom);

  document.addEventListener('keydown', e => {
    if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbState.hasBW) slideBW(-1);
    if (e.key === 'ArrowRight' && lbState.hasBW) slideBW(1);
    if (e.key === 'h' || e.key === 'H') loadHD();
  });

  document.body.appendChild(lightboxEl);
}

function loadHD() {
  const hdBtn = document.getElementById('lb-hd');
  if (lbState.isHD) return;

  const colorImg = document.getElementById('lb-img');
  const fullSrc = colorImg.dataset.full;
  if (fullSrc) {
    colorImg.src = fullSrc;
  }

  const bwImg = document.getElementById('lb-bw');
  const bwFull = bwImg.dataset.full;
  if (bwFull) {
    bwImg.src = bwFull;
  }

  lbState.isHD = true;
  hdBtn.textContent = '✓ HD';
  hdBtn.classList.add('hd-active');
}

function toggleZoom() {
  lbState.zoom = !lbState.zoom;
  document.getElementById('lb-wrapper').classList.toggle('zoomed', lbState.zoom);
  updateZoomBadge();
}

function updateZoomBadge() {
  const badge = document.getElementById('lb-zoom');
  if (badge) badge.textContent = lbState.zoom ? '100%' : 'Adatta';
}

function slideBW(dir) {
  const wrapper = document.getElementById('lb-wrapper');
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
