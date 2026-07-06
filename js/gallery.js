document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const folderId = params.get('folder');

  if (!folderId || !window.portfolioData) {
    window.location.href = 'index.html';
    return;
  }

  const folder = window.portfolioData.find(f => f.id === folderId);
  if (!folder || !folder.images.length) {
    window.location.href = 'index.html';
    return;
  }

  const images = folder.images;
  let currentIndex = 0;

  const titleEl = document.getElementById('gallery-title');
  const imgEl = document.getElementById('carousel-image');
  const counterEl = document.getElementById('carousel-counter');
  const thumbsContainer = document.getElementById('carousel-thumbnails');

  if (titleEl) titleEl.textContent = folder.name.toUpperCase();
  if (counterEl) counterEl.textContent = `1 / ${images.length}`;

  const viewport = document.querySelector('.carousel-viewport');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-nav carousel-prev';
  prevBtn.innerHTML = '&#10094;';
  viewport.appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-nav carousel-next';
  nextBtn.innerHTML = '&#10095;';
  viewport.appendChild(nextBtn);

  function showImage(index) {
    currentIndex = index;
    imgEl.src = images[currentIndex];
    imgEl.alt = `${folder.name} - ${currentIndex + 1}`;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${images.length}`;

    const thumbs = thumbsContainer.querySelectorAll('.thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
      thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevImage();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextImage();
  });

  viewport.addEventListener('click', (e) => {
    if (e.target.closest('.carousel-nav')) return;
    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      prevImage();
    } else {
      nextImage();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  images.forEach((src, i) => {
    const thumb = document.createElement('img');
    thumb.className = 'thumb';
    thumb.src = src;
    thumb.alt = `${folder.name} - ${i + 1}`;
    thumb.loading = 'lazy';
    thumb.addEventListener('click', () => showImage(i));
    thumbsContainer.appendChild(thumb);
  });

  showImage(0);
});
