document.addEventListener('DOMContentLoaded', () => {
    
// --- 1. MOBILE MENU TOGGLE & SLIDE ANIMATION ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        // Toggle the menu slide animation
        mobileMenu.classList.toggle('open');
        
        // Toggle the "open" class on the button (triggers the lines -> X animation)
        mobileMenuBtn.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open'); // Slide up
            mobileMenuBtn.classList.remove('open'); // Turn X back to lines
        
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
