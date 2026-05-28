document.addEventListener("DOMContentLoaded", () => {

    // --- Intro Screen & Audio Logic ---
    const introScreen = document.getElementById('intro-screen');
    const enterBtn = document.getElementById('enter-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isMusicPlaying = false;

    // Advanced Parallax Effect via Gyroscope (Mobile)
    function enableGyroscope() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                const x = Math.min(Math.max(e.gamma / 45, -1), 1); 
                const y = Math.min(Math.max(e.beta / 45, -1), 1); 
                
                document.querySelectorAll('.screen.visible .content-wrapper').forEach(content => {
                    content.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(20px)`;
                });
            });
        }
    }

    if (enterBtn && introScreen && bgMusic) {
        enterBtn.addEventListener('click', () => {
            // Request permissions for iOS DeviceOrientation
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableGyroscope();
                    }
                }).catch(console.error);
            } else {
                enableGyroscope();
            }

            // Start music 
            bgMusic.volume = 0.5;
            let playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isMusicPlaying = true;
                    musicToggle.classList.remove('paused');
                }).catch(error => {
                    console.log("Audio playback failed or missing music.mp3 file");
                });
            }

            // Hide intro screen
            introScreen.classList.add('hidden');
            setTimeout(() => { musicToggle.classList.add('visible'); }, 1500);
        });
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                isMusicPlaying = false;
                musicToggle.classList.add('paused');
            } else {
                bgMusic.play();
                isMusicPlaying = true;
                musicToggle.classList.remove('paused');
            }
        });
    }

    // --- Live Neon Particles Canvas ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = window.innerWidth > 768 ? 100 : 50;
        const colors = ['#ff2a85', '#8a2be2', '#4facfe', '#ffffff', '#ffb199'];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() * 0.8) - 0.4;
                this.speedY = (Math.random() * 0.8) - 0.4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeDir = Math.random() > 0.5 ? 1 : -1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += 0.005 * this.fadeDir;
                if (this.opacity >= 0.8) this.fadeDir = -1;
                if (this.opacity <= 0.1) this.fadeDir = 1;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();
    }


    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: document.querySelector('.container'),
        rootMargin: "0px",
        threshold: 0.4
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.screen').forEach(el => observer.observe(el));

    // --- Interactive Heart Logic ---
    const heart = document.querySelector('.interactive-heart');
    if (heart) {
        heart.addEventListener('click', () => {
            heart.classList.add('beating');
            if (typeof confetti === 'function') {
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

                const interval = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    
                    const particleCount = 50 * (timeLeft / duration);
                    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                }, 250);
            }
            setTimeout(() => { heart.classList.remove('beating'); }, 3000);
        });
    }

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    // --- Mouse Tracking for Parallax (Desktop) ---
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            // Shift background blobs slightly
            document.querySelectorAll('.blob-container').forEach((container, index) => {
                const speed = (index + 1) * 30;
                container.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });

            // 3D Tilt on text cards
            document.querySelectorAll('.screen.visible .content-wrapper').forEach(content => {
                content.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(30px)`;
            });
        });
    }
});
