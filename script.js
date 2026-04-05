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

    // Interactive Map & Logbook Logic
    const markers = document.querySelectorAll('.marker');
    const logbook = document.getElementById('logbook');
    const logbookClose = document.getElementById('logbookClose');
    const logbookContent = document.getElementById('logbookContent');

    const expeditionData = {
        "port": {
            date: "2018 - 2023",
            title: "Starting Port: The Foundation Builder",
            role: "Education & Departure",
            desc: `<p>Started with a perfect 10.0 GPA in Class X, proving that consistency and curiosity could coexist. Scored 97% in Intermediate, but something was missing. I was solving textbook problems when real-world challenges existed everywhere.</p>
                   <p><strong>September 2023 marked the departure:</strong> Enrolled in B.Tech Data Science at SNIST, ready to trade theory for impact.</p>`
        },
        "learning": {
            date: "Sep 2023 - Mid 2024",
            title: "The Skill Acquisition Phase",
            role: "Fundamentals & Discovery",
            desc: `<p>Dove deep into the fundamentals: Python, TensorFlow, and Machine Learning algorithms. Earned <strong>certifications</strong> in AI Fundamentals, Data Analytics with Python, and Google's 5-Day AI Agents course.</p>
                   <p>But learning alone wasn't enough; I needed to know if these tools could solve real problems. Started experimenting with <strong>GPT-4</strong> and <strong>Claude</strong>, discovering that the right prompt could unlock solutions that would've taken weeks to code.</p>
                   `
        },
        "knowledge": {
            date: "Mid 2024 - Late 2025",
            title: "The Explorer & Competitor",
            role: "Projects & Hackathons",
            desc: `<p>Developed a <strong>diabetic retinopathy detection system</strong> with accuracy of <strong>67%</strong>,for actual healthcare impact. Then came <strong>NagaraTrack-Lite</strong>, proving I could build production apps using only AI prompts (80% less manual coding).</p>
                   <div class="logbook__list">
                       <p>• <strong>Nov 2025:</strong> 5th place in Kaggle Competition - learned consistency when models fail.</p>
                       <p>• <strong>2025:</strong> 3rd place in Avinya Hackathon - turned pressure into performance.</p>
                       <p>• <strong>Feb 2026:</strong> 4th place in HackFest'26 - mastered rapid prototyping in 48 hours.</p>
                   </div>
                   `
        },
        "creative": {
            date: "Feb 2024 - Present",
            title: "The Builder & Mentor",
            role: "Leadership & Community",
            desc: `<p>Became <strong>Data Head at THE INFINITIX CLUB</strong>. Built the <strong>Alumni Engagement Platform</strong> with a gamified bounty system, proving human psychology matters as much as technical skills.</p>
                   <p>Posting my thoughts in <strong>LinkedIn</strong> about AI agents and autonomous systems. Not just consuming AI trends, but contributing as well.</p>
                   <p><strong>Current Focus:</strong> Architecting MERN stack applications, optimising prompt chains, and proving theory + speed + user empathy = real impact.</p>`
        },
        "treasure": {
            date: "The Future",
            title: "AI Generalist Mastery",
            role: "The Destination",
            desc: `<p>The X on the map isn't a job, it's becoming the person who walks into a startup and says, <em>"I can ship this in 48 hours."</em></p>
                   <p><strong>The Treasure:</strong></p>
                   <ul>
                       <li>Joining a startup solving problems that matter.</li>
                       <li>Building AI systems users actually want.</li>
                       <li>Proving the right prompts + the right team = 10x output.</li>
                       <li>Mentoring the next wave of builders.</li>
                   </ul>
                   `
        }
    };

    if (markers.length > 0 && logbook) {
        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const id = marker.getAttribute('data-event');
                const data = expeditionData[id];

                if (data) {
                    // Update content
                    logbookContent.innerHTML = `
                        <div class="logbook__entry">
                            <span class="logbook__date">${data.date}</span>
                            <h3>${data.title}</h3>
                            <span class="logbook__role">${data.role}</span>
                            <div class="logbook__desc">
                                ${data.desc}
                            </div>
                        </div>
                    `;

                    // Open panel
                    logbook.setAttribute('aria-hidden', 'false');
                    lenis.stop(); // Stop page scrolling
                }
            });
        });

        const closeLogbook = () => {
            logbook.setAttribute('aria-hidden', 'true');
            lenis.start(); // Resume page scrolling
        };

        logbookClose.addEventListener('click', closeLogbook);
        logbook.querySelector('.logbook__overlay').addEventListener('click', closeLogbook);
    }

    // Map reveal animation
    gsap.from('.map-wrapper', {
        scrollTrigger: { trigger: '.map-wrapper', start: 'top 80%' },
        rotationX: 30, opacity: 0, scale: 0.9, duration: 1.2, ease: 'power3.out'
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

    // ====== 6. CONTACT SECTION SYNCHRONIZED ANIMATION ======
    const contactHeadline = document.querySelector('.contact-cta__headline a');
    if (contactHeadline) {
        const textNode = contactHeadline.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const textContent = textNode.textContent;
            const charSpans = textContent.split('').map(char => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char === ' ' ? '\u00A0' : char; // Preserve spaces
                return span;
            });

            // Replace text node with correctly ordered spans
            textNode.remove();
            const arrowNode = contactHeadline.querySelector('.contact-cta__arrow');
            charSpans.forEach(span => {
                if (arrowNode) {
                    contactHeadline.insertBefore(span, arrowNode);
                } else {
                    contactHeadline.appendChild(span);
                }
            });
        }

        // INITIAL STATE: Hide everything for a clean start
        gsap.set('.contact-cta__headline .char', { opacity: 0, y: 15 });
        gsap.set('.contact-plane', { opacity: 0 });

        // CREATE TIMELINE
        const contactTL = gsap.timeline({
            scrollTrigger: {
                trigger: '.contact-cta',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // 1. Plane Swoop (Point to the right)
        contactTL.fromTo('.contact-plane', 
            { 
                x: '-40vw',    // Wider swoop from left
                y: 150, 
                rotation: -15, 
                scale: 0.6,
                opacity: 0
            },
            {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
                scale: 1,
                duration: 2.5, // Slow, premium landing
                ease: "power2.out"
            }, 0);

        // 2. Text formation (Slightly faster stagger)
        contactTL.to('.contact-cta__headline .char', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: "power1.out"
        }, 0.5); // Starts once the plane is well into the screen

        // 3. Arrow reveal
        contactTL.from('.contact-cta__arrow', {
            opacity: 0,
            x: -20,
            duration: 0.8,
            ease: "back.out(1.7)"
        }, "-=0.7");
    }

    // ====== 7. INTERACTIVE PROJECTS FOLDER ======
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
