document.addEventListener('DOMContentLoaded', function () {
    
    // ======================
    // 1. FILTRO DELLE FOTO
    // ======================
    
    const filterButtons = document.querySelectorAll('.filter');
    const photoCards = document.querySelectorAll('.photo-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            // Filter photo cards
            photoCards.forEach(card => {
                const category = card.getAttribute('data-category');

                // Convert both to lowercase for case-insensitive comparison
                const filterValueLower = filterValue.toLowerCase();
                const categoryLower = category.toLowerCase();

                // For "tutte", show all cards
                if (filterValueLower === 'tutte') {
                    card.style.display = 'block';
                }
                // For other filters, show matching categories
                else if (categoryLower === filterValueLower) {
                    card.style.display = 'block';
                }
                // Hide non-matching cards
                else {
                    card.style.display = 'none';
                }
            });
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

});