document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE MENU TOGGLE ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Guard clause to prevent errors if elements don't exist
    if (mobileMenuBtn && mobileMenu) {
        const iconElement = mobileMenuBtn.querySelector('i');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                iconElement.classList.remove('fa-times');
                iconElement.classList.add('fa-bars');
            } else {
                iconElement.classList.remove('fa-bars');
                iconElement.classList.add('fa-times');
            }
        });

        // Close mobile menu and save active link when clicked
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                iconElement.classList.remove('fa-times');
                iconElement.classList.add('fa-bars');
                
                // Saves the click so the line remains stuck when you reload
                const sectionId = link.getAttribute('href').substring(1);
                if(sectionId) {
                    sessionStorage.setItem('activeSection', sectionId);
                }
            });
        });
    }

    // --- 2. PERFECT SCROLL ANIMATIONS (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        rootMargin: "0px", 
        threshold: 0.15
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });


    // --- 3. ACTIVE NAV LINK HIGHLIGHTING (Stuck logic) ---
    const sections = document.querySelectorAll('section[id]');
    const desktopNavLinks = document.querySelectorAll('#desktop-nav .nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function setActiveLink(activeId) {
        // Remove active from all
        desktopNavLinks.forEach(link => link.classList.remove('active'));
        mobileNavLinks.forEach(link => link.classList.remove('active'));

        // Add active to matching
        desktopNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // 1. Check Session Storage on load to stick the line immediately
    const savedSection = sessionStorage.getItem('activeSection');
    if (savedSection) {
        setActiveLink(savedSection);
    }

    // 2. Update active link while scrolling
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; 
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            setActiveLink(current);
            // Update session storage so it remains correct if user refreshes mid-scroll
            sessionStorage.setItem('activeSection', current);
        }
    });

});