document.addEventListener('DOMContentLoaded', function () {

  // ======================
  // 0. UTILITIES
  // ======================

  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  function formatDate(dateStr) {
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
    }
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  // ======================
  // 1. TIMELINE RENDER
  // ======================

  const timeline = document.getElementById('timeline');
  const gallerySection = document.getElementById('gallerySection');
  const gallery = document.getElementById('gallery');
  const galleryDate = document.getElementById('galleryDate');
  const galleryBack = document.getElementById('galleryBack');
  const savedOrder = JSON.parse(localStorage.getItem('photoOrder') || '[]');

  function renderTimeline() {
    let html = '';

    albums.forEach((album, i) => {
      const side = i % 2 === 0 ? 'right' : 'left';
      const x1 = side === 'right' ? '70' : '30';
      const x2 = side === 'right' ? '30' : '70';

      html += `<div class="tl-v-item" data-side="${side}" data-date="${album.date}">`;
      html += `<div class="tl-v-half">`;
      if (side === 'right') {
        html += `<span class="tl-v-label">${formatDate(album.date)}</span>`;
        html += `<span class="tl-v-arm"></span>`;
      }
      html += `</div>`;
      html += `<div class="tl-v-center"><span class="tl-v-dot"></span></div>`;
      html += `<div class="tl-v-half">`;
      if (side === 'left') {
        html += `<span class="tl-v-arm"></span>`;
        html += `<span class="tl-v-label">${formatDate(album.date)}</span>`;
      }
      html += `</div>`;
      html += `</div>`;

      if (i < albums.length - 1) {
        html += `<svg class="tl-v-connector" viewBox="0 0 100 28" preserveAspectRatio="none">
          <line x1="${x1}" y1="0" x2="${x2}" y2="28" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/>
        </svg>`;
      }
    });

    timeline.innerHTML = html;

    timeline.querySelectorAll('.tl-v-item').forEach(item => {
      item.addEventListener('click', () => {
        const date = item.dataset.date;
        if (item.classList.contains('active')) {
          hideGallery();
        } else {
          timeline.querySelectorAll('.tl-v-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          showGallery(date);
        }
      });
    });
  }

  // ======================
  // 2. GALLERY
  // ======================

  function showGallery(date) {
    const album = albums.find(a => a.date === date);
    if (!album) return;

    const items = [...album.photos];

    items.sort((a, b) => {
      const srcA = `img/${date}/${a}`;
      const srcB = `img/${date}/${b}`;
      const iA = savedOrder.indexOf(srcA);
      const iB = savedOrder.indexOf(srcB);
      if (iA === -1 && iB === -1) return 0;
      if (iA === -1) return 1;
      if (iB === -1) return -1;
      return iA - iB;
    });

    gallery.innerHTML = '';
    galleryDate.textContent = formatDate(date);

    items.forEach(p => {
      const card = document.createElement('article');
      card.className = 'photo-card';
      card.draggable = true;
      const img = document.createElement('img');
      img.src = `img/${date}/${p}`;
      img.alt = '';
      img.loading = 'lazy';
      card.appendChild(img);
      gallery.appendChild(card);
    });

    gallerySection.classList.add('visible');
    gallerySection.scrollIntoView({ behavior: 'smooth' });
    initDragDrop();
  }

  function hideGallery() {
    gallerySection.classList.remove('visible');
    timeline.querySelectorAll('.tl-v-item').forEach(i => i.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  galleryBack.addEventListener('click', hideGallery);

  // ======================
  // 3. DRAG & DROP
  // ======================

  let draggedCard = null;

  function initDragDrop() {
    document.querySelectorAll('.photo-card').forEach(card => {
      card.addEventListener('dragstart', e => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });
      card.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      card.addEventListener('dragenter', e => {
        e.preventDefault();
        if (card !== draggedCard) card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (draggedCard && card !== draggedCard) {
          const parent = card.parentNode;
          const all = [...parent.querySelectorAll('.photo-card')];
          if (all.indexOf(card) < all.indexOf(draggedCard)) {
            parent.insertBefore(draggedCard, card);
          } else {
            parent.insertBefore(draggedCard, card.nextSibling);
          }
          const cards = parent.querySelectorAll('.photo-card');
          const order = [];
          cards.forEach(c => order.push(c.querySelector('img').getAttribute('src')));
          localStorage.setItem('photoOrder', JSON.stringify(order));
          savedOrder.length = 0;
          savedOrder.push(...order);
        }
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.photo-card').forEach(c => c.classList.remove('drag-over'));
        draggedCard = null;
      });
    });
  }

  // ======================
  // 4. FOOTER YEAR
  // ======================

  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ======================
  // 5. THEME TOGGLE
  // ======================

  const themeToggle = document.querySelector('.theme-toggle');
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggle.style.transform = 'scale(0.9)';
      setTimeout(() => { themeToggle.style.transform = 'scale(1)'; }, 150);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      htmlElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  // ======================
  // INIT
  // ======================

  renderTimeline();
});
