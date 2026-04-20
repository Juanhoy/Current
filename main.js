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
    let pendingAudio = null;

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
            const songDetails = songHeader.nextElementSibling;
            songDetails.classList.add('expanded');
            
            // Auto-play DJ sets/Audio if linked directly
            const audio = songDetails.querySelector('audio');
            if (audio) {
                // Try playing immediately
                audio.play().catch(err => {
                    console.log('Autoplay blocked. Waiting for user interaction.');
                    pendingAudio = audio; // Save for first interaction
                });
            }
            
            setTimeout(() => {
                songHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    };

    // Resilient Autoplay for Mobile: Listen for first touch
    const triggerPendingAudio = () => {
        if (pendingAudio) {
            pendingAudio.play().catch(err => console.log('Autoplay still failing:', err));
            pendingAudio = null;
        }
        document.removeEventListener('click', triggerPendingAudio);
        document.removeEventListener('touchstart', triggerPendingAudio);
    };

    document.addEventListener('click', triggerPendingAudio);
    document.addEventListener('touchstart', triggerPendingAudio);

    window.addEventListener('hashchange', handleHash);
    handleHash(); // Run on load

    // --- Music Player Bar Logic ---
    const playerBar = document.getElementById('player-bar');
    const playPauseBtn = document.getElementById('player-play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const trackTitleDisplay = document.getElementById('player-track-title');
    const trackArtistDisplay = document.getElementById('player-track-artist');
    const currentTimeDisplay = document.getElementById('player-current-time');
    const durationDisplay = document.getElementById('player-duration');
    const seekerContainer = document.getElementById('player-seeker-container');
    const seekerProgress = document.getElementById('player-seeker-progress');
    const volumeContainer = document.getElementById('player-volume-container');
    const volumeProgress = document.getElementById('player-volume-progress');
    const nextBtn = playerBar.querySelector('.control-btn.next');
    const prevBtn = playerBar.querySelector('.control-btn.prev');

    let activeAudio = null;
    const allAudio = Array.from(document.querySelectorAll('audio'));

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updatePlayerUI = (audio) => {
        if (!audio) return;
        
        // Find metadata from DOM
        const songItem = audio.closest('.song-item');
        const artistItem = audio.closest('.artist-item');
        
        const title = songItem ? songItem.querySelector('.song-title').textContent : 'Unknown Track';
        const artist = artistItem ? artistItem.querySelector('.artist-name').textContent : 'Unknown Artist';
        
        trackTitleDisplay.textContent = title;
        trackArtistDisplay.textContent = artist;
        
        // Show bar
        playerBar.classList.add('visible');
        
        // Update Icons
        if (audio.paused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
    };

    allAudio.forEach(audio => {
        audio.addEventListener('play', () => {
            if (activeAudio && activeAudio !== audio) {
                activeAudio.pause();
                activeAudio.currentTime = 0;
            }
            activeAudio = audio;
            updatePlayerUI(audio);
        });

        audio.addEventListener('pause', () => {
            if (activeAudio === audio) updatePlayerUI(audio);
        });

        audio.addEventListener('timeupdate', () => {
            if (activeAudio === audio) {
                const percent = (audio.currentTime / audio.duration) * 100;
                seekerProgress.style.width = `${percent}%`;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
            }
        });

        audio.addEventListener('loadedmetadata', () => {
            if (activeAudio === audio) {
                durationDisplay.textContent = formatTime(audio.duration);
            }
        });
    });

    playPauseBtn.addEventListener('click', () => {
        if (!activeAudio) return;
        if (activeAudio.paused) {
            activeAudio.play();
        } else {
            activeAudio.pause();
        }
    });

    seekerContainer.addEventListener('click', (e) => {
        if (!activeAudio || !activeAudio.duration) return;
        const rect = seekerContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = x / width;
        activeAudio.currentTime = percent * activeAudio.duration;
    });

    volumeContainer.addEventListener('click', (e) => {
        const rect = volumeContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        volumeProgress.style.width = `${percent * 100}%`;
        allAudio.forEach(a => a.volume = percent);
    });

    const skipTrack = (direction) => {
        if (!activeAudio) return;
        const currentIndex = allAudio.indexOf(activeAudio);
        let nextIndex = currentIndex + direction;
        
        if (nextIndex >= allAudio.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = allAudio.length - 1;
        
        const nextAudio = allAudio[nextIndex];
        
        // Find the expansion parent and expand it if needed
        const nextArtistItem = nextAudio.closest('.artist-item');
        const nextDetails = nextArtistItem.querySelector('.artist-details');
        const nextSongDetails = nextAudio.closest('.song-details');

        // Close others
        document.querySelectorAll('.artist-details').forEach(d => {
            if (d !== nextDetails) d.classList.remove('expanded');
        });
        
        nextDetails.classList.add('expanded');
        nextSongDetails.classList.add('expanded');
        
        nextAudio.play();
        nextAudio.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    nextBtn.addEventListener('click', () => skipTrack(1));
    prevBtn.addEventListener('click', () => skipTrack(-1));

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
