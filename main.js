document.addEventListener('DOMContentLoaded', () => {
    console.log('Current Website - Version 3.0 Loaded');
    
    // Core Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const homeView = document.querySelector('.view-home');
    const contentView = document.querySelector('.view-content');
    const categories = document.querySelectorAll('.category');
    const logo = document.querySelector('.logo');
    
    // Controller Elements
    const controller = document.getElementById('audio-controller');
    const ctrlTitle = controller.querySelector('.controller-title');
    const ctrlArtist = controller.querySelector('.controller-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressFill = document.getElementById('progress-fill');
    const progressWrap = controller.querySelector('.progress-wrap');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const closeBtn = document.getElementById('close-controller');

    let currentNativeAudio = null;
    let playlist = [];
    let currentIndex = -1;

    // Build Global Playlist
    const buildPlaylist = () => {
        playlist = [];
        const artistItems = document.querySelectorAll('.artist-item');
        artistItems.forEach(artist => {
            const artistName = artist.querySelector('.artist-name').textContent;
            const songs = artist.querySelectorAll('.song-item');
            songs.forEach(song => {
                const title = song.querySelector('.song-title').textContent;
                const audio = song.querySelector('audio');
                const iframe = song.querySelector('iframe');
                playlist.push({
                    artist: artistName,
                    title: title,
                    type: audio ? 'native' : 'spotify',
                    audioElement: audio,
                    songItem: song,
                    id: song.querySelector('.song-header').id || `track-${playlist.length}`
                });
            });
        });
    };
    buildPlaylist();

    // Controller Logic
    const updateControllerUI = (track) => {
        ctrlTitle.textContent = track.title;
        ctrlArtist.textContent = track.artist;
        controller.classList.remove('hidden');
        
        if (track.type === 'native') {
            playPauseBtn.style.opacity = '1';
            progressWrap.style.opacity = '1';
        } else {
            // For Spotify, we just show info, can't easily control playback
            playPauseBtn.style.opacity = '0.3';
            progressWrap.style.opacity = '0.3';
            progressFill.style.width = '0%';
        }
    };

    const syncPlayPauseIcon = (playing) => {
        if (playing) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    };

    const setTrack = (index) => {
        if (index < 0 || index >= playlist.length) return;
        
        const track = playlist[index];
        currentIndex = index;

        // Stop existing native audio
        if (currentNativeAudio) {
            currentNativeAudio.pause();
        }

        updateControllerUI(track);

        if (track.type === 'native') {
            currentNativeAudio = track.audioElement;
            currentNativeAudio.play();
            syncPlayPauseIcon(true);
            
            // Expand parent artist and song in UI
            expandArtistAndSong(track);
        } else {
            currentNativeAudio = null;
            syncPlayPauseIcon(false);
            expandArtistAndSong(track);
        }
    };

    const expandArtistAndSong = (track) => {
        const artistItem = track.songItem.closest('.artist-item');
        const artistDetails = artistItem.querySelector('.artist-details');
        const songDetails = track.songItem.querySelector('.song-details');
        
        // Close others
        document.querySelectorAll('.artist-details').forEach(d => {
            if (d !== artistDetails) d.classList.remove('expanded');
        });
        
        artistDetails.classList.add('expanded');
        
        artistItem.querySelectorAll('.song-details').forEach(d => {
            if (d !== songDetails) d.classList.remove('expanded');
        });
        songDetails.classList.add('expanded');
        
        setTimeout(() => {
            track.songItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    // Track native audio events
    const allNativeAudios = document.querySelectorAll('audio');
    allNativeAudios.forEach(audio => {
        audio.addEventListener('play', () => {
            // Find which track this is
            const trackIndex = playlist.findIndex(t => t.audioElement === audio);
            if (trackIndex !== -1 && trackIndex !== currentIndex) {
                setTrack(trackIndex);
            }
            syncPlayPauseIcon(true);
            
            // Pause others
            allNativeAudios.forEach(other => {
                if (other !== audio) {
                    other.pause();
                    other.currentTime = 0;
                }
            });
        });

        audio.addEventListener('pause', () => syncPlayPauseIcon(false));
        
        audio.addEventListener('timeupdate', () => {
            if (currentNativeAudio === audio) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = `${progress}%`;
            }
        });

        audio.addEventListener('ended', () => {
            nextBtn.click();
        });
    });

    // Handle clicks on song headers (including Spotify ones)
    const songHeaders = document.querySelectorAll('.song-header');
    songHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const songItem = header.closest('.song-item');
            const trackIndex = playlist.findIndex(t => t.songItem === songItem);
            if (trackIndex !== -1) {
                // If it's spotify, we just update the UI info since the iframe handles its own play
                const track = playlist[trackIndex];
                if (track.type === 'spotify') {
                    setTrack(trackIndex);
                    // For Spotify, the user has to click the iframe play button themselves
                }
            }
        });
    });

    // Controller Buttons
    playPauseBtn.addEventListener('click', () => {
        if (currentNativeAudio) {
            if (currentNativeAudio.paused) {
                currentNativeAudio.play();
            } else {
                currentNativeAudio.pause();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) setTrack(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < playlist.length - 1) setTrack(currentIndex + 1);
    });

    closeBtn.addEventListener('click', () => {
        controller.classList.add('hidden');
        if (currentNativeAudio) currentNativeAudio.pause();
    });

    // Progress Bar Interaction
    progressWrap.addEventListener('click', (e) => {
        if (currentNativeAudio) {
            const rect = progressWrap.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            currentNativeAudio.currentTime = pos * currentNativeAudio.duration;
        }
    });

    // --- Original Logic Wrappers ---

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

    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            homeView.classList.remove('hidden');
            contentView.classList.add('hidden');
            return;
        }
        const category = document.getElementById(hash);
        if (category && category.classList.contains('category')) {
            showCategory(hash, false);
            return;
        }
        const artist = document.getElementById(hash);
        if (artist && artist.classList.contains('artist-item')) {
            const catId = artist.closest('.category').id;
            showCategory(catId, false);
            artist.querySelector('.artist-details').classList.add('expanded');
            artist.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    logo.addEventListener('click', () => {
        window.location.hash = '';
    });

    const artistNameElements = document.querySelectorAll('.artist-name');
    artistNameElements.forEach(name => {
        name.addEventListener('click', () => {
            const item = name.closest('.artist-item');
            const details = item.querySelector('.artist-details');
            const isExpanded = details.classList.contains('expanded');
            
            document.querySelectorAll('.artist-details').forEach(d => {
                if (d !== details) d.classList.remove('expanded');
            });
            details.classList.toggle('expanded');
            
            if (!isExpanded) {
                window.location.hash = item.id;
                setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
            } else {
                window.location.hash = item.closest('.category').id;
            }
        });
    });

    const songHeaderElements = document.querySelectorAll('.song-header');
    songHeaderElements.forEach(header => {
        header.addEventListener('click', (e) => {
            const songItem = header.closest('.song-item');
            const details = songItem.querySelector('.song-details');
            const isExpanded = details.classList.contains('expanded');
            
            songItem.closest('.release-list').querySelectorAll('.song-details').forEach(d => {
                if (d !== details) d.classList.remove('expanded');
            });
            details.classList.toggle('expanded');
        });
    });
});
