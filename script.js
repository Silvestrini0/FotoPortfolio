document.addEventListener('DOMContentLoaded', function () {
    
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

    // Aggiorna l'anno nel footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});