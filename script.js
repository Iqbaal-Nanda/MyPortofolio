
// Mobile detection utility
const isMobileDevice = () => window.innerWidth <= 768;

// Magnetic Buttons (Desktop Only)
const magneticEls = document.querySelectorAll('.magnetic');

magneticEls.forEach(el => {
    let destX = 0;
    let destY = 0;
    let ticking = false;

    const updateMagnetic = () => {
        gsap.to(el, {
            x: destX * 0.3,
            y: destY * 0.3,
            duration: 0.3,
            ease: "power2.out"
        });
        ticking = false;
    };

    el.addEventListener('mousemove', (e) => {
        // Disable magnetic effect on mobile
        if (isMobileDevice()) return;

        const rect = el.getBoundingClientRect();
        destX = e.clientX - rect.left - rect.width / 2;
        destY = e.clientY - rect.top - rect.height / 2;

        if (!ticking) {
            requestAnimationFrame(updateMagnetic);
            ticking = true;
        }
    });

    el.addEventListener('mouseleave', () => {
        if (isMobileDevice()) return;

        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// Tilt Effect for Bento Cards (Desktop Only)
const tiltCards = document.querySelectorAll('.tilt-effect');

tiltCards.forEach(card => {
    let targetX = 0;
    let targetY = 0;
    let rotating = false;

    const updateTilt = () => {
        gsap.to(card, {
            rotateX: targetX,
            rotateY: targetY,
            transformPerspective: 1000,
            duration: 0.5,
            ease: "power2.out"
        });
        rotating = false;
    };

    card.addEventListener('mousemove', (e) => {
        // Disable tilt effect on mobile
        if (isMobileDevice()) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        targetX = ((y - centerY) / centerY) * -10;
        targetY = ((x - centerX) / centerX) * 10;

        if (!rotating) {
            requestAnimationFrame(updateTilt);
            rotating = true;
        }
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
});

// Playlist System
const playlist = [
    { title: "The Beach Dance Remix", src: "assets/music/The Beach (Dance Remix).mp3" },
    { title: "The Earth Color Remix", src: "assets/music/The Earth (Color Remix).mp3" },
    { title: "The Spring Festival", src: "assets/music/The Spring Festival.mp3" },
    { title: "The Crystal", src: "assets/music/The Crystal.mp3" },
    { title: "The Basketball", src: "assets/music/The Basketball.mp3" },
    { title: "The Desert", src: "assets/music/The Desert.mp3" },
    { title: "The Plains", src: "assets/music/The Plains.mp3" },
    { title: "Dream Of Sky", src: "assets/music/Dream Of Sky.mp3" },
    { title: "The Savanna", src: "assets/music/The Savanna.mp3" },
    { title: "The Hip Hop Evolution", src: "assets/music/The Hip Hop Evolution.mp3" },

];

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const vinyl = document.getElementById('vinyl');
const bgAudio = document.getElementById('bg-audio');
const songTitleEl = document.getElementById('song-title-text');
const trackIndexEl = document.getElementById('track-index');

let currentTrack = 0;
let isPlaying = false;

function loadTrack(index, autoplay = false) {
    const track = playlist[index];
    bgAudio.src = track.src;
    bgAudio.load();

    // Update UI text
    if (songTitleEl) songTitleEl.textContent = track.title;
    if (trackIndexEl) trackIndexEl.textContent = `${index + 1} / ${playlist.length}`;

    if (autoplay) {
        bgAudio.play().catch(e => console.warn("Autoplay blocked:", e));
    }
}

function updatePlayerUI(playing) {
    isPlaying = playing;
    if (isPlaying) {
        vinyl.classList.add('playing');
        playBtn.textContent = '⏸️';
    } else {
        vinyl.classList.remove('playing');
        playBtn.textContent = '▶️';
    }
}

// Load first track immediately
loadTrack(currentTrack, false);

if (bgAudio) {
    bgAudio.volume = 0.5;

    // Sync UI with actual audio state
    bgAudio.addEventListener('play', () => updatePlayerUI(true));
    bgAudio.addEventListener('pause', () => updatePlayerUI(false));

    // Auto-advance to next song when current ends
    bgAudio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack, true);
    });

    // AGGRESSIVE AUTOPLAY — try to start on first user interaction
    const tryAutoplay = () => {
        if (!isPlaying) {
            bgAudio.play().catch(() => { });
        }
        document.removeEventListener('click', tryAutoplay);
        document.removeEventListener('touchstart', tryAutoplay);
        document.removeEventListener('keydown', tryAutoplay);
    };

    // Attempt silent autoplay immediately
    bgAudio.play().catch(() => {
        // Browser blocked — wait for first user interaction
        document.addEventListener('click', tryAutoplay, { once: true });
        document.addEventListener('touchstart', tryAutoplay, { once: true });
        document.addEventListener('keydown', tryAutoplay, { once: true });
    });
}

// Play / Pause
playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
        bgAudio.pause();
    } else {
        bgAudio.play();
    }
});

// Previous track
if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack, isPlaying);
    });
}

// Next track
if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack, isPlaying);
    });
}

// Interactive Bento Logic (Draggable removed to keep layout static)
// The emoji reaction system handles the interactivity.

// Emoji Reaction System
const reactBtns = document.querySelectorAll('.react-btn');

reactBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const emoji = btn.getAttribute('data-emoji');
        createFloatingEmoji(emoji, e.clientX, e.clientY);
    });
});

function createFloatingEmoji(emojiText, x, y) {
    const emoji = document.createElement('div');
    emoji.textContent = emojiText;
    emoji.style.position = 'fixed';
    emoji.style.left = x + 'px';
    emoji.style.top = y + 'px';
    emoji.style.fontSize = '2rem';
    emoji.style.pointerEvents = 'none';
    emoji.style.zIndex = '10000';
    document.body.appendChild(emoji);

    // Randomize trajectory
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = -100 - Math.random() * 200;
    const randomRot = (Math.random() - 0.5) * 180;

    gsap.to(emoji, {
        x: randomX,
        y: randomY,
        rotation: randomRot,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => {
            emoji.remove();
        }
    });
}

// Initial Animation removed to prevent visibility bugs

// Lanyard 3D Effect (Desktop Only)
const lanyardArea = document.getElementById('lanyard-area');
const idCard = document.getElementById('id-card');

if (lanyardArea && idCard) {
    // Drop Entrance Animation (works on all devices)
    if (!isMobileDevice()) {
        gsap.from(".lanyard-string", {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1.2,
            ease: "bounce.out",
            delay: 0.2
        });
    }

    gsap.from(idCard, {
        y: -200,
        rotationZ: 0,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.4)",
        delay: 0.2
    });

    // 3D Tilt effect only on desktop
    if (!isMobileDevice()) {
        lanyardArea.addEventListener('mousemove', (e) => {
            const rect = lanyardArea.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate rotation for pendulum swing and 3D tilt
            const rotateY = (x / rect.width) * 30;
            const rotateX = -(y / rect.height) * 30;
            const rotateZ = (x / rect.width) * 15; // Swing effect

            gsap.to(idCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                rotateZ: rotateZ,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        lanyardArea.addEventListener('mouseleave', () => {
            gsap.to(idCard, {
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }
}

// --- DYNAMIC THEME SWITCHER ---
const themes = [
    {
        name: 'Cyberpunk',
        a1: '#00f0ff',
        a2: '#ff00ff',
        a3: '#ffff00',
        bg: 'linear-gradient(135deg, #0a1a2e 0%, #16213e 25%, #0f3460 50%, #16213e 75%, #0a1a2e 100%)'
    },
    {
        name: 'Toxic Matrix',
        a1: '#39ff14',
        a2: '#000000',
        a3: '#ccff00',
        bg: 'linear-gradient(135deg, #0d3d0d 0%, #1a5c1a 25%, #2d8a2d 50%, #1a5c1a 75%, #0d3d0d 100%)'
    },
    {
        name: 'Vaporwave',
        a1: '#ff71ce',
        a2: '#01cdfe',
        a3: '#05ffa1',
        bg: 'linear-gradient(135deg, #1a0033 0%, #330066 25%, #1a3366 50%, #330066 75%, #1a0033 100%)'
    },
    {
        name: 'Dracula Dark',
        a1: '#bd93f9',
        a2: '#ff79c6',
        a3: '#8be9fd',
        bg: 'linear-gradient(135deg, #21222c 0%, #282a36 25%, #44475a 50%, #282a36 75%, #21222c 100%)'
    }
];
let currentThemeIndex = 0;

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const t = themes[currentThemeIndex];

        // Morph CSS Variables smoothly
        document.documentElement.style.setProperty('--accent-1', t.a1);
        document.documentElement.style.setProperty('--accent-2', t.a2);
        document.documentElement.style.setProperty('--accent-3', t.a3);

        // Change background gradient with smooth transition
        document.body.style.transition = 'background 0.8s ease';
        document.body.style.background = t.bg;

        // Add a cool glitch effect to the button
        themeBtn.innerText = `✨ ${t.name}`;
        themeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => themeBtn.style.transform = 'scale(1)', 200);
    });
}

const navToggle = document.querySelector('.nav-toggle');
const glassNav = document.querySelector('.glass-nav');
const navLinks = document.querySelectorAll('.nav-links a');

if (navToggle && glassNav) {
    navToggle.addEventListener('click', () => {
        glassNav.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            glassNav.classList.remove('open');
        });
    });

    document.addEventListener('click', (event) => {
        if (!glassNav.contains(event.target) && glassNav.classList.contains('open')) {
            glassNav.classList.remove('open');
        }
    });
}

// --- SCROLL ANIMATIONS ---
document.addEventListener("DOMContentLoaded", () => {
    if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.bento-item').forEach((box, i) => {
            gsap.from(box, {
                scrollTrigger: {
                    trigger: box,
                    start: "top 90%", // Trigger slightly before it comes fully into view
                    toggleActions: "play none none reverse"
                },
                y: 60,
                opacity: 0,
                scale: 0.95,
                duration: 0.8,
                ease: "power3.out",
                delay: i % 3 * 0.1 // Slight stagger effect for rows
            });
        });
    }
});

// --- LIGHTBOX FEATURE ---
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.querySelector('.close-lightbox');
const projectImages = document.querySelectorAll('.p-card img');

if (lightboxModal && lightboxImg && closeLightbox) {
    projectImages.forEach(img => {
        img.addEventListener('click', (e) => {
            lightboxModal.classList.add('active');
            lightboxImg.src = e.target.src;
            document.body.style.overflow = 'hidden'; // Mencegah scrolling background
        });
    });

    const closeModal = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Mengembalikan scrolling background
    };

    closeLightbox.addEventListener('click', closeModal);

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// --- CONTACT FORM TO EMAIL/GMAIL ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending message... ✉️';
        btn.disabled = true;

        const name = document.getElementById('sender-name').value.trim();
        const email = document.getElementById('sender-email').value.trim();
        const message = document.getElementById('sender-message').value.trim();

        const targetEmail = 'iqbaalnanda240803@gmail.com';
        const subject = encodeURIComponent(`Pesan dari ${name || 'Pengunjung'}`);
        const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`);

        const formSubmitUrl = `https://formsubmit.co/ajax/${targetEmail}`;
        const formData = {
            Nama: name,
            Email: email,
            Pesan: message,
            _subject: `Pesan baru dari portofolio ${name || 'Pengunjung'}`,
            _captcha: 'false'
        };

        fetch(formSubmitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success === 'true' || data.success === true || data.message) {
                    alert('Pesan berhasil terkirim! Terima kasih.');
                    contactForm.reset();
                } else {
                    throw new Error('Pengiriman gagal');
                }
            })
            .catch(() => {
                const mailto = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
                const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}&body=${body}`;

                let didHide = false;
                const visibilityHandler = () => {
                    if (document.visibilityState === 'hidden') didHide = true;
                };

                document.addEventListener('visibilitychange', visibilityHandler);
                window.location.href = mailto;

                setTimeout(() => {
                    document.removeEventListener('visibilitychange', visibilityHandler);
                    if (!didHide) {
                        window.open(gmailLink, '_blank');
                    }
                }, 900);
            })
            .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
    });

    const emailButton = document.querySelector('.social-btn.email');
    if (emailButton) {
        emailButton.addEventListener('click', (e) => {
            e.preventDefault();
            const mailto = 'mailto:iqbaalnanda240803@gmail.com?subject=Hai%2C%20Bro&body=Bolehkan%20saya%20belajar%20dengan%20Anda';
            window.open(mailto, '_self');
        });
    }
}

// --- Project overlay for persistent audio/video ---
const projectOverlay = document.getElementById('project-overlay');
const projectIframe = document.getElementById('project-iframe');
const closeOverlay = document.querySelector('.close-overlay');

const projectLinks = document.querySelectorAll('.project-link');
projectLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const projectUrl = link.getAttribute('href');
        if (!projectUrl) return;
        projectIframe.src = projectUrl;
        projectOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

if (projectIframe) {
    projectIframe.addEventListener('load', () => {
        try {
            const iframeDoc = projectIframe.contentDocument || projectIframe.contentWindow.document;
            const backButtons = iframeDoc.querySelectorAll('a.btn-back, a[href="../index.html"], a[href$="index.html"]');
            backButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    projectOverlay.classList.remove('active');
                    projectIframe.src = '';
                    document.body.style.overflow = 'auto';
                });
            });
        } catch (error) {
            console.warn('Cannot attach iframe back listeners:', error);
        }
    });
}

if (closeOverlay) {
    closeOverlay.addEventListener('click', () => {
        projectOverlay.classList.remove('active');
        projectIframe.src = '';
        document.body.style.overflow = 'auto';

        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectOverlay && projectOverlay.classList.contains('active')) {
        projectOverlay.classList.remove('active');
        projectIframe.src = '';
        document.body.style.overflow = 'auto';
    }
});
