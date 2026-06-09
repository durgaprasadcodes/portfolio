/* ── Smooth Scroll (Lenis) ── */

const lenis = new Lenis({
    duration: 1.5,
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);


/* ── Sidebar toggle ── */

const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.side-bar');
const crossBtn = document.querySelector('.alternate .cross');
const body = document.querySelector('.alternate');

const openSidebar = () => sidebar.classList.add('active');
const closeSidebar = () => sidebar.classList.remove('active');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
});

crossBtn.addEventListener('click', closeSidebar);

body.addEventListener('click', closeSidebar);

sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

sidebar.addEventListener('click', (e) => {
    if (e.target === sidebar) closeSidebar();
});


/* ── Disable image right-click ── */

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});


/* ── Scroll reveal (IntersectionObserver) ── */

function startRevealAnimation() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of element is in view for smoother scrolling
        rootMargin: '0px 0px -20px 0px' // Slightly trigger before element enters the edge
    });

    reveals.forEach(el => observer.observe(el));
}


/* ── Welcome Card ── */

const welcome = document.querySelector('.welcome');

function activateWelcome() {
    welcome.classList.add('loaded');

    setTimeout(() => {
        welcome.classList.add('disappear');
        setTimeout(() => {
            startRevealAnimation();
        }, 200);
    }, 2000);
}

window.addEventListener('load', activateWelcome);

/* cursor follow */

const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let isVisible = false;

window.addEventListener('mousemove', (e) => {
    // Fade in on first movement
    if (!isVisible) {
        dot.classList.add('visible');
        ring.classList.add('visible');
        isVisible = true;
    }

    // Set position and center elements
    dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    dot.classList.remove('visible');
    ring.classList.remove('visible');
    isVisible = false;
});

// Event delegation for hover states on interactive elements
window.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, [role="button"], input, textarea, select, .skill-card, .profile-wrapper, .hamburger, .cross , .resume, .tags span');
    if (target) {
        dot.classList.add('hover');
        ring.classList.add('hover');
    } else {
        dot.classList.remove('hover');
        ring.classList.remove('hover');
    }
});

// Click interactions
window.addEventListener('mousedown', () => {
    dot.classList.add('click');
    ring.classList.add('click');
});

window.addEventListener('mouseup', () => {
    dot.classList.remove('click');
    ring.classList.remove('click');
});