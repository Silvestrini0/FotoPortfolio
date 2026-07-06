document.addEventListener('DOMContentLoaded', function () {

    // ======================
    // 0. ALBUM DATA & RENDER
    // ======================

    const timeline = document.getElementById('timeline');
    const gallery = document.getElementById('gallery');
    const savedOrder = localStorage.getItem('photoOrder');
    let globalOrder = savedOrder ? JSON.parse(savedOrder) : null;

    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    function formatDate(dateStr) {
        const [y, m, d] = dateStr.split('-');
        return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
    }

    function renderTimeline() {
        let html = '<button class="tl-btn active" data-album="tutte">Tutte</button><div class="tl-track">';
        albums.forEach((a, i) => {
            html += '<div class="tl-node">';
            if (i > 0) html += '<span class="tl-line"></span>';
            html += `<button class="tl-btn" data-album="${a.date}">
                <span class="tl-dot"></span>
                <span class="tl-label">${formatDate(a.date)}</span>
            </button></div>`;
        });
        html += '</div>';
        timeline.innerHTML = html;

        timeline.querySelectorAll('.tl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                timeline.querySelectorAll('.tl-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderGallery(btn.dataset.album);
            });
        });
    }

    function renderGallery(albumFilter) {
        gallery.innerHTML = '';
        let items = [];
        albums.forEach(album => {
            album.photos.forEach(p => {
                const src = 'img/' + album.date + '/' + p;
                if (albumFilter === 'tutte' || albumFilter === album.date) {
                    items.push({ src, date: album.date });
                }
            });
        });

        if (albumFilter === 'tutte' && globalOrder) {
            items.sort((a, b) => {
                const ai = globalOrder.indexOf(a.src);
                const bi = globalOrder.indexOf(b.src);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });
        }

        items.forEach(item => {
            const card = document.createElement('article');
            card.className = 'photo-card';
            card.draggable = true;
            card.dataset.date = item.date;
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = '';
            img.loading = 'lazy';
            card.appendChild(img);
            gallery.appendChild(card);
        });

        initDragDrop();
    }

    // ======================
    // 1. DRAG & DROP
    // ======================

    let draggedCard = null;

    function initDragDrop() {
        document.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragover', handleDragOver);
            card.addEventListener('dragenter', handleDragEnter);
            card.addEventListener('dragleave', handleDragLeave);
            card.addEventListener('drop', handleDrop);
            card.addEventListener('dragend', handleDragEnd);
        });
    }

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (this !== draggedCard) this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (draggedCard && this !== draggedCard) {
            const parent = this.parentNode;
            const all = [...parent.querySelectorAll('.photo-card')];
            if (all.indexOf(this) < all.indexOf(draggedCard)) {
                parent.insertBefore(draggedCard, this);
            } else {
                parent.insertBefore(draggedCard, this.nextSibling);
            }
            saveOrder();
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        document.querySelectorAll('.photo-card').forEach(c => c.classList.remove('drag-over'));
        draggedCard = null;
    }

    function saveOrder() {
        const cards = document.querySelectorAll('.photo-card');
        const order = [];
        cards.forEach(c => order.push(c.querySelector('img').getAttribute('src')));
        localStorage.setItem('photoOrder', JSON.stringify(order));
        globalOrder = order;
    }

    // ======================
    // 2. AGGIORNA ANNO FOOTER
    // ======================

    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ======================
    // 3. THEME TOGGLE
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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            htmlElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    // ======================
    // INIT
    // ======================

    renderTimeline();
    renderGallery('tutte');

});
