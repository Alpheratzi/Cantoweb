/**
 * Dúo Canto y Cuerda - Main JS Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core Elements
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // ==========================================================================
    // 1. Mobile Navigation & Sticky Header
    // ==========================================================================
    
    // Toggle Mobile Menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
        
        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close Menu when clicking a Link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Sticky Header on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        highlightActiveSection();
    });

    // Highlight active link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    function highlightActiveSection() {
        const scrollY = window.pageYOffset + 120; // offset for sticky header

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    }

    // ==========================================================================
    // 2. Custom Audio Player (with Simulation Fallback)
    // ==========================================================================
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackItems = document.querySelectorAll('.track-item');
    const playerTitle = document.getElementById('playerTitle');
    const playerCard = document.querySelector('.player-card');

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audio = new Audio();
    
    // Simulation variables (if files don't exist)
    let isSimulated = false;
    let simulatedProgress = 0;
    let simulatedInterval = null;
    let simulatedDuration = 180; // 3 minutes default

    // Tracks metadata matching index.html
    const playlist = [
        { title: "Amor de mis Amores", duration: 204, genre: "Bolero - Clásico Latino" },
        { title: "Luna Tucumana", duration: 178, genre: "Zamba - Tradición Argentina" },
        { title: "Rumba del Alba", duration: 192, genre: "Rumba - Estilo Español" },
        { title: "Chega de Saudade", duration: 220, genre: "Bossa Nova - Portugués" },
        { title: "La Vie en Rose", duration: 165, genre: "Chanson - Francés & Guitarra" }
    ];

    // Load track
    function loadTrack(index) {
        currentTrackIndex = index;
        const track = playlist[index];
        playerTitle.textContent = track.title;
        
        // Remove active class from tracklist, add to selected
        trackItems.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Set audio source (mock file or real path)
        audio.src = `assets/track_${index + 1}.mp3`;
        
        // Reset timers
        currentTimeEl.textContent = "0:00";
        totalDurationEl.textContent = formatTime(track.duration);
        progressFill.style.width = '0%';
        
        // If playing, start playback
        if (isPlaying) {
            playAudio();
        }
    }

    // Play/Pause Action
    function togglePlay() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function playAudio() {
        isPlaying = true;
        playerCard.classList.add('playing');
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Pause SVG Path

        // Try playing real audio
        audio.play().then(() => {
            isSimulated = false;
            if (simulatedInterval) clearInterval(simulatedInterval);
        }).catch(err => {
            // Fall back to simulation since local mock mp3 files might not exist yet
            console.log("Real audio file not found. Running simulated playback for demo.");
            startSimulation();
        });
    }

    function pauseAudio() {
        isPlaying = false;
        playerCard.classList.remove('playing');
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; // Play SVG Path

        if (isSimulated) {
            clearInterval(simulatedInterval);
        } else {
            audio.pause();
        }
    }

    // Real audio events
    audio.addEventListener('timeupdate', () => {
        if (!isSimulated && audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalDurationEl.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('ended', () => {
        nextTrack();
    });

    // Volume adjustment
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // Seek Click
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;

        if (isSimulated) {
            const track = playlist[currentTrackIndex];
            simulatedProgress = percentage * track.duration;
            progressFill.style.width = `${percentage * 100}%`;
            currentTimeEl.textContent = formatTime(simulatedProgress);
        } else {
            if (audio.duration) {
                audio.currentTime = percentage * audio.duration;
            }
        }
    });

    // Navigation Controls
    function nextTrack() {
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= playlist.length) nextIndex = 0;
        loadTrack(nextIndex);
    }

    function prevTrack() {
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
        loadTrack(prevIndex);
    }

    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    playBtn.addEventListener('click', togglePlay);

    // Tracklist click binding
    trackItems.forEach((item, idx) => {
        item.addEventListener('click', () => {
            if (currentTrackIndex === idx) {
                togglePlay();
            } else {
                isPlaying = true;
                loadTrack(idx);
            }
        });
    });

    // Helper: Simulated Playback Loop
    function startSimulation() {
        isSimulated = true;
        if (simulatedInterval) clearInterval(simulatedInterval);
        
        const track = playlist[currentTrackIndex];
        const duration = track.duration;
        
        // Start from current width percentage if paused/resumed
        const currentPercentage = parseFloat(progressFill.style.width) || 0;
        simulatedProgress = (currentPercentage / 100) * duration;

        simulatedInterval = setInterval(() => {
            simulatedProgress += 1;
            if (simulatedProgress >= duration) {
                clearInterval(simulatedInterval);
                nextTrack();
                return;
            }
            
            const percent = (simulatedProgress / duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(simulatedProgress);
        }, 1000);
    }

    // Time Formatter
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Initialize track
    loadTrack(0);


    // ==========================================================================
    // 3. IndexedDB for Video Gallery Upload & Management
    // ==========================================================================
    const uploadZone = document.getElementById('uploadZone');
    const videoInput = document.getElementById('videoInput');
    const videoGrid = document.getElementById('videoGrid');
    const uploadProgressContainer = document.getElementById('uploadProgressContainer');
    const uploadProgressFill = document.getElementById('uploadProgressFill');
    const uploadStatusText = document.getElementById('uploadStatusText');

    let db = null;
    const DB_NAME = 'DuoMusicGalleryDB';
    const STORE_NAME = 'videos';

    // Initialize Database
    const dbRequest = indexedDB.open(DB_NAME, 1);

    dbRequest.onerror = (e) => {
        console.error("IndexedDB error:", e);
    };

    dbRequest.onsuccess = (e) => {
        db = e.target.result;
        loadVideosFromDB();
    };

    dbRequest.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    };

    // Open video selector when clicking upload zone
    uploadZone.addEventListener('click', (e) => {
        // Prevent trigger if clicking progress bars
        if (e.target.closest('.upload-progress-container')) return;
        videoInput.click();
    });

    // Drag and Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleVideoUpload(files[0]);
        }
    });

    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleVideoUpload(e.target.files[0]);
        }
    });

    // Handle Upload Processing
    function handleVideoUpload(file) {
        if (!file.type.startsWith('video/')) {
            alert('Por favor, selecciona un archivo de video válido (MP4 o WebM).');
            return;
        }

        // Show Progress Bar
        uploadProgressContainer.style.display = 'block';
        uploadProgressFill.style.width = '0%';
        uploadStatusText.textContent = 'Analizando archivo...';

        // Read the file and store it
        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                uploadProgressFill.style.width = `${percent}%`;
                uploadStatusText.textContent = `Cargando archivo: ${percent}%`;
            }
        };

        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const blob = new Blob([arrayBuffer], { type: file.type });
            
            uploadStatusText.textContent = 'Generando miniatura...';

            try {
                // Get video metadata (Duration and Thumbnail)
                const metadata = await getVideoMetadata(blob);
                
                const videoData = {
                    title: prompt("Introduce un título para tu video:", file.name.substring(0, file.name.lastIndexOf('.')) || file.name) || "Video de Ensayo",
                    description: prompt("Escribe una breve descripción:", "Video corto grabado por el público/duo.") || "Grabación de ensayo.",
                    date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                    duration: metadata.durationText,
                    thumbnail: metadata.thumbnail || '', // Base64 Thumbnail or placeholder
                    blob: blob,
                    fileType: file.type
                };

                // Save to DB
                saveVideoToDB(videoData);
            } catch (err) {
                console.error("Metadata extraction failed, saving with defaults:", err);
                const videoData = {
                    title: "Video de Ensayo",
                    description: "Grabación local.",
                    date: new Date().toLocaleDateString('es-ES'),
                    duration: "0:30",
                    thumbnail: '',
                    blob: blob,
                    fileType: file.type
                };
                saveVideoToDB(videoData);
            }
        };

        reader.onerror = () => {
            alert('Hubo un error al leer el archivo de video.');
            hideProgress();
        };

        reader.readAsArrayBuffer(file);
    }

    function hideProgress() {
        uploadProgressContainer.style.display = 'none';
        videoInput.value = '';
    }

    // Advanced: Generate Video Thumbnail using Canvas & Offscreen Video
    function getVideoMetadata(blob) {
        return new Promise((resolve) => {
            const videoUrl = URL.createObjectURL(blob);
            const video = document.createElement('video');
            video.src = videoUrl;
            video.muted = true;
            video.playsInline = true;
            
            video.addEventListener('loadedmetadata', () => {
                const duration = video.duration;
                const min = Math.floor(duration / 60);
                const sec = Math.floor(duration % 60);
                const durationText = `${min}:${sec < 10 ? '0' : ''}${sec}`;

                // Seek slightly to capture a non-black frame
                video.currentTime = Math.min(1.0, duration / 2);
            });

            video.addEventListener('seeked', () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 320;
                    canvas.height = 180;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                    URL.revokeObjectURL(videoUrl);
                    resolve({ durationText, thumbnail });
                } catch (e) {
                    URL.revokeObjectURL(videoUrl);
                    resolve({ durationText: "0:30", thumbnail: '' });
                }
            });

            video.addEventListener('error', () => {
                URL.revokeObjectURL(videoUrl);
                resolve({ durationText: "0:30", thumbnail: '' });
            });
        });
    }

    // Save Video Record in IndexedDB
    function saveVideoToDB(videoData) {
        if (!db) return;

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(videoData);

        request.onsuccess = () => {
            uploadStatusText.textContent = '¡Video guardado con éxito!';
            setTimeout(() => {
                hideProgress();
                loadVideosFromDB(); // Reload list
            }, 1000);
        };

        request.onerror = (e) => {
            console.error("Error saving video:", e);
            alert("Error al guardar el video en la base de datos.");
            hideProgress();
        };
    }

    // Load Videos from IndexedDB
    function loadVideosFromDB() {
        if (!db) return;

        // Clear dynamically added cards (keep defaults)
        const customCards = videoGrid.querySelectorAll('.video-card[data-video-type="custom"]');
        customCards.forEach(card => card.remove());

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                const data = cursor.value;
                createVideoCard(data);
                cursor.continue();
            }
        };
    }

    // Render Video Card
    function createVideoCard(data) {
        const card = document.createElement('div');
        card.className = 'video-card glass';
        card.setAttribute('data-video-type', 'custom');
        card.setAttribute('data-id', data.id);
        
        // Use custom generated thumbnail or fallback image
        const thumbnailSrc = data.thumbnail || 'assets/duo_hero_bg.png';

        card.innerHTML = `
            <div class="video-thumbnail" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${thumbnailSrc}')">
                <div class="play-overlay">
                    <span class="play-symbol">▶</span>
                </div>
                <span class="video-duration">${data.duration}</span>
            </div>
            <div class="video-details">
                <h4>${data.title}</h4>
                <p>${data.description}</p>
            </div>
        `;

        // Add to grid
        videoGrid.appendChild(card);

        // Bind Play Lightbox Event
        card.addEventListener('click', () => {
            openLightbox(data);
        });
    }


    // ==========================================================================
    // 4. Lightbox Player Component
    // ==========================================================================
    const lightbox = document.getElementById('videoLightbox');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxVideoTitle = document.getElementById('lightboxVideoTitle');
    const lightboxVideoDesc = document.getElementById('lightboxVideoDesc');
    const deleteVideoBtn = document.getElementById('deleteUploadedVideoBtn');

    let currentSelectedVideoId = null;

    // Handle default video card clicks
    const defaultVideoCards = document.querySelectorAll('.video-card[data-video-type="default"]');
    defaultVideoCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h4').textContent;
            const desc = card.querySelector('p').textContent;
            // Since actual video files might not be on system, we load a royalty-free sample loop or just mock it
            // We use standard test video URL for reliable rendering in the demo
            const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
            
            openLightbox({
                title,
                description: desc,
                src: videoSrc,
                isDefault: true
            });
        });
    });

    function openLightbox(videoData) {
        // Stop audio if playing
        if (isPlaying) pauseAudio();

        lightboxVideoTitle.textContent = videoData.title;
        lightboxVideoDesc.textContent = videoData.description;

        if (videoData.isDefault) {
            lightboxVideo.src = videoData.src;
            deleteVideoBtn.classList.add('hidden');
        } else {
            // Load file blob
            const fileUrl = URL.createObjectURL(videoData.blob);
            lightboxVideo.src = fileUrl;
            
            // Show Delete button for custom videos
            currentSelectedVideoId = videoData.id;
            deleteVideoBtn.classList.remove('hidden');
        }

        lightbox.style.display = 'flex';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        lightbox.setAttribute('aria-hidden', 'true');
        
        // Revoke ObjectURL if it was set
        if (lightboxVideo.src.startsWith('blob:')) {
            URL.revokeObjectURL(lightboxVideo.src);
        }
        lightboxVideo.src = '';
        document.body.style.overflow = '';
    }

    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);

    // Delete Uploaded Video
    deleteVideoBtn.addEventListener('click', () => {
        if (!currentSelectedVideoId || !db) return;
        if (confirm('¿Estás seguro de que quieres eliminar este video de tu galería?')) {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(currentSelectedVideoId);

            request.onsuccess = () => {
                closeLightbox();
                loadVideosFromDB(); // Reload list
            };

            request.onerror = (e) => {
                console.error("Error deleting video:", e);
                alert("Error al borrar el video.");
            };
        }
    });

    // Escape Key to Close Lightbox
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
            closeLightbox();
        }
    });


    // ==========================================================================
    // 5. Booking Form Handling
    // ==========================================================================
    const bookingForm = document.getElementById('bookingForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    const successCloseBtn = document.getElementById('successCloseBtn');

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values for mock submission
        const name = document.getElementById('clientName').value;
        const email = document.getElementById('clientEmail').value;
        const date = document.getElementById('eventDate').value;
        const type = document.getElementById('eventType').value;
        const location = document.getElementById('eventLocation').value;
        const message = document.getElementById('clientMessage').value;

        // Visual presentation of sending
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando solicitud...';

        setTimeout(() => {
            // Show Success Card overlaying the form
            bookingForm.style.opacity = '0';
            setTimeout(() => {
                bookingForm.classList.add('hidden');
                formSuccessMessage.style.display = 'flex';
                bookingForm.style.opacity = '1';
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                bookingForm.reset();
            }, 300);
        }, 1500);
    });

    successCloseBtn.addEventListener('click', () => {
        formSuccessMessage.style.display = 'none';
        bookingForm.classList.remove('hidden');
    });

    // Set minimum date of event to today dynamically
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').setAttribute('min', today);
});
