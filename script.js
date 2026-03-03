document.addEventListener('DOMContentLoaded', () => {
    // ====== 1. MOBILE MENU TOGGLE ======
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isExpanded = navLinks.classList.contains('open');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ====== 2. SMOOTH SCROLL ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ====== 3. ACTIVE NAV HIGHLIGHTING ======
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.navbar__links a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // Remove active class from all
                navItems.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to current
                const activeLink = document.querySelector(`.navbar__links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: "-10% 0px -10% 0px"
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ====== 4. SCROLL FADE-IN ANIMATION ======
    // Add fade-in class to elements we want to animate
    const elementsToAnimate = [
        ...document.querySelectorAll('.section__title'),
        document.querySelector('.hero__content'),
        document.querySelector('.projects-carousel'),
        document.querySelector('.timeline-card'),
        document.querySelector('.contact-card')
    ];

    elementsToAnimate.forEach(el => {
        if (el) el.classList.add('fade-in');
    });

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15
    });

    elementsToAnimate.forEach(el => {
        if (el) fadeObserver.observe(el);
    });

    // ====== 5. PREMIUM 3D CAROUSEL WITH TILT & GLARE ======
    const track = document.getElementById('carouselTrack');
    let isAnimating = false; // Prevent double-clicks during transition

    // --- Project data for info panel ---
    const projectData = {
        'Diabetic Retinopathy Detection': {
            title: 'Diabetic Retinopathy Detection System',
            desc: 'Developed end-to-end AI-powered medical diagnostic application using Convolutional Neural Networks (CNN) to detect and classify diabetic retinopathy from retinal fundus images with 92% accuracy.',
            link: 'https://github.com/Rishi5377/Diabetic-Retinopathy-Detector'
        },
        'NagaraTrack-Lite': {
            title: 'NagaraTrack-Lite',
            desc: 'Built production-ready application using only AI prompts and LLM interactions, demonstrating advanced prompt engineering skills and zero-code development capabilities.',
            link: 'https://github.com/Rishi5377/NagaraTrack-Lite'
        },
        'Python AI/ML Portfolio': {
            title: 'Python AI/ML Projects Portfolio',
            desc: 'Created comprehensive collection of ML algorithms and data science applications including predictive modeling, data visualization, and statistical analysis tools.',
            link: 'https://github.com/Rishi5377/Python-Projects'
        }
    };

    // --- Inject holographic glare overlay into each card ---
    document.querySelectorAll('.card-face').forEach(face => {
        const glare = document.createElement('div');
        glare.classList.add('card-glare');
        face.appendChild(glare);
    });

    // --- Apply carousel positions based on DOM order ---
    function applyCarouselPositions() {
        const cards = Array.from(track.children);
        cards.forEach((card, i) => {
            // Remove all position classes
            card.classList.remove('project-card--left', 'project-card--center', 'project-card--right');
            card.style.transform = ''; // Clear any tilt inline styles

            if (i === 0) card.classList.add('project-card--left');
            else if (i === 1) card.classList.add('project-card--center');
            else card.classList.add('project-card--right');
        });

        // Update info panel to match center card
        const centerCard = cards[1];
        if (centerCard) {
            const title = centerCard.querySelector('.card-title').textContent;
            updateProjectInfo(title);
        }
    }

    // --- 3D Tilt + Holographic Glare (mouse tracking) ---
    function attachTiltListeners(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const w = rect.width;
            const h = rect.height;

            // Normalized -1 to 1
            const normX = (x / w) * 2 - 1;
            const normY = (y / h) * 2 - 1;

            // 3D tilt angles (max ±15deg)
            const tiltX = normY * -15;
            const tiltY = normX * 15;

            // Build transform based on card position
            if (card.classList.contains('project-card--center')) {
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.06) translateZ(30px)`;
            } else if (card.classList.contains('project-card--left')) {
                card.style.transform = `translateX(-200px) perspective(1000px) rotateX(${tiltX * 0.5}deg) rotateY(${20 + tiltY * 0.4}deg) scale(0.85)`;
            } else {
                card.style.transform = `translateX(200px) perspective(1000px) rotateX(${tiltX * 0.5}deg) rotateY(${-20 + tiltY * 0.4}deg) scale(0.85)`;
            }

            // Move holographic glare
            const glare = card.querySelector('.card-glare');
            if (glare) {
                glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 30%, transparent 70%)`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = ''; // CSS handles resting position
            const glare = card.querySelector('.card-glare');
            if (glare) {
                glare.style.opacity = '0';
            }
        });
    }

    // --- Clickable Carousel (infinite rotation) ---
    function attachClickListeners() {
        const cards = Array.from(track.children);
        cards.forEach(card => {
            // Remove old listeners by cloning
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });

        // Re-query after clone and re-attach everything
        const freshCards = Array.from(track.children);
        freshCards.forEach(card => {
            attachTiltListeners(card);

            card.addEventListener('click', () => {
                if (isAnimating) return;
                if (card.classList.contains('project-card--center')) return; // Already center

                isAnimating = true;
                const cards = Array.from(track.children);
                const clickedIndex = cards.indexOf(card);

                if (clickedIndex === 0) {
                    // Clicked LEFT → rotate right (move last to front)
                    const last = track.lastElementChild;
                    track.insertBefore(last, track.firstElementChild);
                } else {
                    // Clicked RIGHT → rotate left (move first to end)
                    const first = track.firstElementChild;
                    track.appendChild(first);
                }

                applyCarouselPositions();

                // Re-attach listeners after DOM reorder
                setTimeout(() => {
                    attachClickListeners();
                    isAnimating = false;
                }, 500); // Match CSS transition duration
            });
        });
    }

    function updateProjectInfo(title) {
        const infoContainer = document.getElementById('projectInfo');
        const titleEl = infoContainer.querySelector('.project-info__title');
        const descEl = infoContainer.querySelector('.project-info__desc');
        const btnEl = document.getElementById('projectLink');

        infoContainer.style.opacity = 0;

        setTimeout(() => {
            const data = projectData[title] || { title: title, desc: '', link: '#' };
            titleEl.textContent = data.title;
            descEl.textContent = data.desc;
            btnEl.href = data.link;
            infoContainer.style.opacity = 1;
        }, 300);
    }

    // --- Initialize carousel ---
    applyCarouselPositions();
    attachClickListeners();
});
