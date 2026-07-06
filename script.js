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
  // 1. RENDER TIMELINE
  // ======================

  const container = document.querySelector('.timeline__container');

  function renderTimeline() {
    let html = '';
    albums.forEach(album => {
      html += `<div class="timeline__block">`;
      html += `<div class="timeline__content">`;
      html += `<span class="timeline__date">${formatDate(album.date)}</span>`;
      html += `<div class="carousel" data-date="${album.date}">`;
      html += `<div class="carousel__viewport">`;
      html += `<div class="carousel__slides">`;
      album.photos.forEach(p => {
        html += `<img src="img/${album.date}/${p}" alt="" loading="lazy">`;
      });
      html += `</div></div>`;
      if (album.photos.length > 1) {
        html += `<button class="carousel__btn carousel__prev">‹</button>`;
        html += `<button class="carousel__btn carousel__next">›</button>`;
        html += `<div class="carousel__dots"></div>`;
      }
      html += `</div></div>`;
      html += `<div class="timeline__marker"></div>`;
      html += `</div>`;
    });
    container.innerHTML = html;
    initCarousels();
    initScrollAnimations();
  }

  // ======================
  // 2. CAROUSEL
  // ======================

  function initCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
      const slides = carousel.querySelector('.carousel__slides');
      const imgs = slides.querySelectorAll('img');
      if (imgs.length <= 1) return;

      const prev = carousel.querySelector('.carousel__prev');
      const next = carousel.querySelector('.carousel__next');
      const dotsContainer = carousel.querySelector('.carousel__dots');
      let current = 0;
      let autoTimer;

      imgs.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });

      function goTo(index) {
        current = index;
        slides.style.transform = `translateX(-${current * 100}%)`;
        dotsContainer.querySelectorAll('.carousel__dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }

      prev.addEventListener('click', () => {
        goTo(current > 0 ? current - 1 : imgs.length - 1);
        resetAuto();
      });

      next.addEventListener('click', () => {
        goTo(current < imgs.length - 1 ? current + 1 : 0);
        resetAuto();
      });

      dotsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('carousel__dot')) resetAuto();
      });

      function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => {
          goTo(current < imgs.length - 1 ? current + 1 : 0);
        }, 4000);
      }

      function stopAuto() {
        clearInterval(autoTimer);
      }

      function resetAuto() {
        stopAuto();
        startAuto();
      }

      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);

      startAuto();
    });
  }

  // ======================
  // 3. SCROLL ANIMATIONS
  // ======================

  function initScrollAnimations() {
    const items = container.querySelectorAll('.timeline__content, .timeline__marker');

    function checkVisibility() {
      items.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }

    checkVisibility();

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkVisibility();
          ticking = false;
        });
        ticking = true;
      }
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
