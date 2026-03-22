document.addEventListener('DOMContentLoaded', () => {
    console.log('Current Website - Version 2.1 Loaded');
    const navLinks = document.querySelectorAll('.nav-link');
    const homeView = document.querySelector('.view-home');
    const contentView = document.querySelector('.view-content');
    const categories = document.querySelectorAll('.category');
    const logo = document.querySelector('.logo');

    // Handle view switching
    const showCategory = (targetId, updateHash = true) => {
        homeView.classList.add('hidden');
        contentView.classList.remove('hidden');
        
        categories.forEach(cat => cat.style.display = 'none');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
            if (updateHash) window.location.hash = targetId;
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showCategory(targetId);
        });
    });

    // Handle deep linking via Hash
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            homeView.classList.remove('hidden');
            contentView.classList.add('hidden');
            return;
        }

        // 1. Check if hash is a category
        const category = document.getElementById(hash);
        if (category && category.classList.contains('category')) {
            showCategory(hash, false);
            return;
        }

        // 2. Check if hash is an artist
        const artist = document.getElementById(hash);
        if (artist && artist.classList.contains('artist-item')) {
            const catId = artist.closest('.category').id;
            showCategory(catId, false);
            artist.querySelector('.artist-details').classList.add('expanded');
            artist.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // 3. Check if hash is a song/set
        const songHeader = document.getElementById(hash);
        if (songHeader && songHeader.classList.contains('song-header')) {
            const artistItem = songHeader.closest('.artist-item');
            const catId = artistItem.closest('.category').id;
            
            showCategory(catId, false);
            artistItem.querySelector('.artist-details').classList.add('expanded');
            songHeader.nextElementSibling.classList.add('expanded');
            
            setTimeout(() => {
                songHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // Run on load

    // Reset to home when clicking logo
    logo.addEventListener('click', () => {
        window.location.hash = '';
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
                window.location.hash = item.id;
                setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
            } else {
                window.location.hash = item.closest('.category').id;
            }
        });
    });

    // Handle song expansion
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach(song => {
        const songHeader = song.querySelector('.song-header');
        const songDetails = song.querySelector('.song-details');

        songHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = songDetails.classList.contains('expanded');
            
            song.closest('.release-list').querySelectorAll('.song-details').forEach(details => {
                if (details !== songDetails) details.classList.remove('expanded');
            });

            songDetails.classList.toggle('expanded');
            
            if (!isExpanded && songHeader.id) {
                window.location.hash = songHeader.id;
            }
        });
    });
});
