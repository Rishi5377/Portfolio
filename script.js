document.addEventListener('DOMContentLoaded', () => {

    // ====== 1. LENIS SMOOTH SCROLL ======
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ====== 1.5 NEURAL NETWORK CANVAS ANIMATION ======
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        const particles = [];
        const particleCount = 50;

        let mouse = { x: -1000, y: -1000 };
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(201, 169, 110, 0.8)'; // var(--gold)
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 80) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(201, 169, 110, ${1 - dist / 80})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ====== 2. MOBILE MENU TOGGLE ======
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isExpanded = navLinks.classList.contains('open');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ====== 3. SMOOTH SCROLL FOR NAV LINKS (via Lenis) ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, { offset: 0 });
            }
        });
    });

    // ====== 4. ACTIVE NAV HIGHLIGHTING ======
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.navbar__links a');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            end: 'bottom 40%',
            onEnter: () => setActiveNav(section.id),
            onEnterBack: () => setActiveNav(section.id),
        });
    });

    function setActiveNav(id) {
        navItems.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.navbar__links a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    // ====== 5. SPLITTYPE HERO TEXT REVEAL & TYPEWRITER ======
    const tagline1 = document.querySelector('.tagline-line1');
    const taglinePrefix = document.querySelector('.tagline-prefix');

    if (tagline1) {
        const split1 = new SplitType(tagline1, { types: 'chars' });
        let charsToAnimate = split1.chars;

        if (taglinePrefix) {
            const splitPrefix = new SplitType(taglinePrefix, { types: 'chars' });
            charsToAnimate = [...split1.chars, ...splitPrefix.chars];
        }

        gsap.set(charsToAnimate, { opacity: 0, y: 30 });

        gsap.to(charsToAnimate, {
            opacity: 1, y: 0,
            stagger: 0.04,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.3,
            onComplete: startTypewriter
        });
    }

    function startTypewriter() {
        const typedTextSpan = document.querySelector(".typed-text");
        const cursorSpan = document.querySelector(".cursor");
        if (!typedTextSpan || !cursorSpan) return;

        const textToType = "AI Generalist";
        const typingDelay = 100;
        let charIndex = 0;

        function type() {
            if (charIndex < textToType.length) {
                if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
                typedTextSpan.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                cursorSpan.classList.remove("typing");
            }
        }

        setTimeout(type, 200);
    }

    // ====== 6. GSAP SCROLL-TRIGGERED ANIMATIONS ======

    // Hero bio + CTA fade up
    gsap.from('.hero__bio', {
        scrollTrigger: { trigger: '.hero__bio', start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.2,
    });
    gsap.from('.hero__actions', {
        scrollTrigger: { trigger: '.hero__actions', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.5,
    });

    // Hero video float-in
    gsap.from('.hero__illustration', {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5,
    });

    // Section titles slide up
    gsap.utils.toArray('.section__title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: { trigger: title, start: 'top 85%' },
            y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
        });
    });

    // Projects carousel scale in
    gsap.from('.projects-carousel', {
        scrollTrigger: { trigger: '.projects-carousel', start: 'top 80%' },
        scale: 0.9, opacity: 0, duration: 1, ease: 'power3.out',
    });

    // Timeline items stagger in
    gsap.utils.toArray('.timeline__item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: 'top 85%' },
            x: -40, opacity: 0, duration: 0.7, ease: 'power3.out',
            delay: i * 0.15,
        });
    });

    // Skills tags stagger
    gsap.utils.toArray('.skills-category').forEach(category => {
        const tags = category.querySelectorAll('.skill-tag');
        gsap.from(tags, {
            scrollTrigger: { trigger: category, start: 'top 85%' },
            y: 20, opacity: 0, duration: 0.4, ease: 'power3.out',
            stagger: 0.06,
        });
    });

    // Contact card reveal
    gsap.from('.contact-card', {
        scrollTrigger: { trigger: '.contact-card', start: 'top 80%' },
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
    });

    // ====== 6. INTERACTIVE PROJECTS FOLDER ======
    const folders = document.querySelectorAll('.folder');

    folders.forEach(folder => {
        // Find papers specifically inside this folder's wrapper
        const papers = folder.querySelectorAll('.paper');

        // Toggle folder open/close on click
        folder.addEventListener('click', (e) => {
            // Prevent toggling if the user clicked on a link inside a paper
            if (e.target.closest('a')) return;

            const isFolderOpen = folder.classList.contains('open');

            // If they clicked on a paper (and it's already open), actually open the project link
            const clickedPaper = e.target.closest('.paper');
            if (isFolderOpen && clickedPaper) {
                const url = clickedPaper.getAttribute('data-github');
                if (url) {
                    window.open(url, '_blank');
                    return; // Don't close the folder
                }
            }

            // Normal folder toggle
            folder.classList.add('folder--click'); // Add temporary class to prevent hover jump during click
            setTimeout(() => folder.classList.remove('folder--click'), 300);

            const willBeOpen = !isFolderOpen;
            folder.classList.toggle('open', willBeOpen);

            // Reset magnet positions when closing
            if (!willBeOpen) {
                papers.forEach(paper => {
                    paper.style.setProperty('--magnet-x', '0px');
                    paper.style.setProperty('--magnet-y', '0px');
                });
            }
        });

        // Magnetic effect on papers when folder is open
        papers.forEach(paper => {
            paper.addEventListener('mousemove', (e) => {
                if (!folder.classList.contains('open') || window.innerWidth <= 768) return;

                const rect = paper.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate offset (15% strength matching the React reference)
                const offsetX = (e.clientX - centerX) * 0.15;
                const offsetY = (e.clientY - centerY) * 0.15;

                paper.style.setProperty('--magnet-x', `${offsetX}px`);
                paper.style.setProperty('--magnet-y', `${offsetY}px`);
            });

            paper.addEventListener('mouseleave', () => {
                if (!folder.classList.contains('open') || window.innerWidth <= 768) return;

                // Spring back to 0
                paper.style.setProperty('--magnet-x', '0px');
                paper.style.setProperty('--magnet-y', '0px');
            });
        });
    });
});
