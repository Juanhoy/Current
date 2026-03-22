document.addEventListener('DOMContentLoaded', () => {
    console.log('Current Website - Version 2.1 Loaded');
    const navLinks = document.querySelectorAll('.nav-link');
    const homeView = document.querySelector('.view-home');
    const contentView = document.querySelector('.view-content');
    const categories = document.querySelectorAll('.category');
    const logo = document.querySelector('.logo');

    // Handle view switching
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            homeView.classList.add('hidden');
            contentView.classList.remove('hidden');
            
            categories.forEach(cat => cat.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Reset to home when clicking logo
    logo.addEventListener('click', () => {
        homeView.classList.remove('hidden');
        contentView.classList.add('hidden');
    });

    // Handle artist expansion
    const artistItems = document.querySelectorAll('.artist-item');
    artistItems.forEach(item => {
        const nameElement = item.querySelector('.artist-name');
        const detailsElement = item.querySelector('.artist-details');

        nameElement.addEventListener('click', () => {
            const isExpanded = detailsElement.classList.contains('expanded');
            document.querySelectorAll('.artist-details').forEach(details => {
                if (details !== detailsElement) details.classList.remove('expanded');
            });
            detailsElement.classList.toggle('expanded');
            if (!isExpanded) {
                setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
            }
        });
    });

    // Handle song expansion
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach(song => {
        const songHeader = song.querySelector('.song-header');
        const songDetails = song.querySelector('.song-details');

        songHeader.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger artist collapse
            const isExpanded = songDetails.classList.contains('expanded');
            
            // Close other songs for this artist
            song.closest('.release-list').querySelectorAll('.song-details').forEach(details => {
                if (details !== songDetails) details.classList.remove('expanded');
            });

            songDetails.classList.toggle('expanded');
        });
    });
});
