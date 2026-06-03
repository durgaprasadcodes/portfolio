/* ── Sidebar toggle ── */
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.side-bar');
const crossBtn = document.querySelector('.alternate .cross');
const body = document.querySelector('.alternate');

const openSidebar = () => sidebar.classList.add('active');
const closeSidebar = () => sidebar.classList.remove('active');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // prevents body click from firing
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

document.querySelectorAll("img").forEach(img => {
    img.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
});

/* ── Scroll reveal (IntersectionObserver) ── */
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));
