document.addEventListener('DOMContentLoaded', function () {
    
    // ======================
    // 0. CARICA ORDINE SALVATO
    // ======================
    
    const gallery = document.querySelector('.gallery');
    const savedOrder = localStorage.getItem('photoOrder');
    if (savedOrder) {
        try {
            const order = JSON.parse(savedOrder);
            const cards = document.querySelectorAll('.photo-card');
            const cardMap = {};
            cards.forEach(c => {
                const src = c.querySelector('img').getAttribute('src');
                cardMap[src] = c;
            });
            // Reorder based on saved order
            order.forEach(src => {
                if (cardMap[src]) gallery.appendChild(cardMap[src]);
            });
            // Append any new cards not in saved order
            cards.forEach(c => {
                const src = c.querySelector('img').getAttribute('src');
                if (!order.includes(src)) gallery.appendChild(c);
            });
        } catch (e) {}
    }

    // ======================
    // 1. FILTRO DELLE FOTO
    // ======================
    
    const filterButtons = document.querySelectorAll('.filter');

    function applyFilter() {
        const activeFilter = document.querySelector('.filter.active');
        if (!activeFilter) return;
        const filterValue = activeFilter.getAttribute('data-filter');
        const photoCards = document.querySelectorAll('.photo-card');
        photoCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const filterValueLower = filterValue.toLowerCase();
            const categoryLower = category.toLowerCase();
            if (filterValueLower === 'tutte') {
                card.style.display = 'block';
            } else if (categoryLower === filterValueLower) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilter();
        });
    });

    // ======================
    // 2. AGGIORNA ANNO FOOTER
    // ======================
    
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ======================
    // 3. THEME TOGGLE (Light/Dark Mode)
    // ======================
    
    const themeToggle = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // Use saved theme preference
        htmlElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        // Use system preference
        htmlElement.setAttribute('data-theme', 'dark');
    }
    
    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Update theme
            htmlElement.setAttribute('data-theme', newTheme);
            
            // Save preference to localStorage
            localStorage.setItem('theme', newTheme);
            
            // Optional: Add animation feedback
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only update if user hasn't set a manual preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
        }
    });

    // ======================
    // 4. DRAG & DROP
    // ======================
    
    let draggedCard = null;

    function initDragDrop() {
        const cards = document.querySelectorAll('.photo-card');
        cards.forEach(card => {
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
        if (this !== draggedCard) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (draggedCard && this !== draggedCard) {
            const parent = this.parentNode;
            const allCards = [...parent.querySelectorAll('.photo-card')];
            const dropIndex = allCards.indexOf(this);
            const dragIndex = allCards.indexOf(draggedCard);
            if (dropIndex < dragIndex) {
                parent.insertBefore(draggedCard, this);
            } else {
                parent.insertBefore(draggedCard, this.nextSibling);
            }
            saveOrder();
            applyFilter();
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
        cards.forEach(c => {
            const src = c.querySelector('img').getAttribute('src');
            order.push(src);
        });
        localStorage.setItem('photoOrder', JSON.stringify(order));
    }

    initDragDrop();

});