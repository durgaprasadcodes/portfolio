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
        threshold: 0.3
    });

    reveals.forEach(el => observer.observe(el));
}


/* ── Welcome Card ── */

const welcome = document.querySelector('.welcome');

function activateWelcome() {
    welcome.classList.add('loaded');

    setTimeout(() => {
        welcome.classList.add('disappear');
    }, 2000);

    welcome.addEventListener('transitionend', () => {
        startRevealAnimation();
    });
}

window.addEventListener('load', activateWelcome);