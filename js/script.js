/* ============================================
   PORTFOLIO — script.js
   Dynamic content loading, 3D scroll animations,
   parallax, and all interactive behaviour.
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     0.  UTILITY HELPERS & LENIS SMOOTH SCROLL
     ------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Check for reduced-motion preference */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Throttle using requestAnimationFrame */
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  }

  let lenis = null;

  function initLenis() {
    if (typeof Lenis === 'undefined' || prefersReducedMotion) return;

    lenis = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2.0,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth scroll for all anchor navigation links
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target && lenis) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.3,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  }

  /* ------------------------------------------
     1.  LOAD PORTFOLIO DATA & BOOT
     ------------------------------------------ */
  fetch('js/portfolio-data.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load portfolio data');
      return res.json();
    })
    .then(data => {
      populatePage(data);
      initAnimations(data);
    })
    .catch(err => {
      console.error('Portfolio data error:', err);
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:40px;">
          <div>
            <h2 style="margin-bottom:12px;">Unable to load portfolio data</h2>
            <p style="color:#888;">Make sure <code>portfolio-data.json</code> is in the same folder.</p>
          </div>
        </div>`;
    });

  /* ------------------------------------------
     2.  POPULATE PAGE FROM JSON
     ------------------------------------------ */
  function populatePage(data) {
    populateNavbar(data);
    populateHero(data);
    populateAbout(data);
    populateSkills(data);
    populateProjects(data);
    populateContact(data);
    populateFooter(data);
  }

  /* --- Navbar --- */
  function populateNavbar(data) {
    const logo = $('#navLogo');
    const brandParts = data.home.navbar.logo.split('.');
    logo.innerHTML = `${brandParts[0]}<span>.${brandParts[1]}</span>`;

    const navLinksEl = $('#navLinks');
    data.navigation.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.link;
      a.textContent = item.name;
      if (item.download) {
        a.setAttribute('download', '');
        a.setAttribute('target', '_blank');
        a.classList.add('nav-resume-btn');
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-download';
        a.prepend(icon);
      } else {
        a.dataset.section = item.link.replace('#', '');
      }
      li.appendChild(a);
      navLinksEl.appendChild(li);
    });
  }

  /* --- Hero --- */
  function populateHero(data) {
    const hero = data.home.hero;
    $('#heroBgText').textContent = hero.backgroundText;
    $('#heroGreeting').textContent = hero.smallTitle;
    $('#heroName').textContent = hero.mainTitle;
    $('#heroRole').textContent = hero.highlightText;
    $('#heroDesc').textContent = hero.description;
    $('#heroImage').src = hero.image;

    // Buttons
    const btnContainer = $('#heroButtons');
    data.home.buttons.forEach(btn => {
      const a = document.createElement('a');
      a.href = btn.link;
      a.textContent = btn.text;
      a.className = btn.type === 'primary' ? 'btn-primary' : 'btn-secondary';
      btnContainer.appendChild(a);
    });

    // Social icons
    const socialsContainer = $('#heroSocials');
    data.socialLinks.forEach(s => {
      const a = document.createElement('a');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', s.name);
      a.innerHTML = `<i class="${s.icon}"></i>`;
      socialsContainer.appendChild(a);
    });

    // Stats
    const statsContainer = $('#heroStats');
    data.home.stats.forEach(stat => {
      const div = document.createElement('div');
      div.className = 'stat-item';
      div.innerHTML = `
        <div class="stat-number">${stat.number}</div>
        <div class="stat-label">${stat.label}</div>`;
      statsContainer.appendChild(div);
    });
  }

  /* --- About --- */
  function populateAbout(data) {
    const about = data.about;
    $('#aboutLabel').textContent = about.sectionTitle;
    $('#aboutTitle').textContent = about.heading;
    $('#aboutDesc').textContent = about.description;

    const hlContainer = $('#aboutHighlights');
    about.highlights.forEach(h => {
      const div = document.createElement('div');
      div.className = 'highlight-item';
      div.innerHTML = `<i class="fa-solid fa-diamond"></i><span>${h}</span>`;
      hlContainer.appendChild(div);
    });

    // Timeline
    const tlContainer = $('#timelineContainer');
    about.timeline.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'timeline-item';
      div.dataset.index = i;
      div.innerHTML = `
        <div class="timeline-dot"></div>
        <span class="timeline-year">${item.year}</span>
        <div class="timeline-card">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>`;
      tlContainer.appendChild(div);
    });
  }

  /* --- Skills --- */
  // Map skill names → { icon class, brand color }
  // Uses colored Devicon variants where available
  const SKILL_DATA = {
    'HTML5': { icon: 'devicon-html5-plain', color: '#E34F26' },
    'CSS3': { icon: 'devicon-css3-plain', color: '#1572B6' },
    'JavaScript': { icon: 'devicon-javascript-plain', color: '#F7DF1E' },
    'React.js': { icon: 'devicon-react-original', color: '#61DAFB' },
    'React': { icon: 'devicon-react-original', color: '#61DAFB' },
    'Responsive Design': { icon: 'devicon-chrome-plain', color: '#4285F4' },
    'REST API Integration': { icon: 'devicon-fastapi-plain', color: '#009688' },
    'Python': { icon: 'devicon-python-plain', color: '#3776AB' },
    'Django': { icon: 'devicon-django-plain', color: '#092E20' },
    'Django REST Framework': { icon: 'devicon-djangorest-plain', color: '#A30000' },
    'FastAPI': { icon: 'devicon-fastapi-plain', color: '#009688' },
    'REST APIs': { icon: 'devicon-fastapi-plain', color: '#009688' },
    'REST API': { icon: 'devicon-fastapi-plain', color: '#009688' },
    'Authentication': { icon: 'fa-solid fa-shield-halved', color: '#4CAF50' },
    'JWT': { icon: 'fa-solid fa-key', color: '#D63AFF' },
    'PostgreSQL': { icon: 'devicon-postgresql-plain', color: '#336791' },
    'MySQL': { icon: 'devicon-mysql-plain', color: '#4479A1' },
    'SQLite': { icon: 'devicon-sqlite-plain', color: '#003B57' },
    'Database Design': { icon: 'fa-solid fa-diagram-project', color: '#FF6F00' },
    'NumPy': { icon: 'devicon-numpy-plain', color: '#013243' },
    'Pandas': { icon: 'devicon-pandas-plain', color: '#150458' },
    'Scikit-learn': { icon: 'devicon-scikitlearn-plain', color: '#F7931E' },
    'Data Preprocessing': { icon: 'fa-solid fa-filter', color: '#00BCD4' },
    'Feature Engineering': { icon: 'fa-solid fa-sliders', color: '#8BC34A' },
    'Model Evaluation': { icon: 'fa-solid fa-chart-line', color: '#FF5722' },
    'Neural Networks': { icon: 'fa-solid fa-circle-nodes', color: '#9C27B0' },
    'TensorFlow': { icon: 'devicon-tensorflow-original', color: '#FF6F00' },
    'PyTorch': { icon: 'devicon-pytorch-original', color: '#EE4C2C' },
    'CNN': { icon: 'fa-solid fa-image', color: '#2196F3' },
    'RNN': { icon: 'fa-solid fa-wave-square', color: '#673AB7' },
    'NLP Basics': { icon: 'fa-solid fa-language', color: '#00897B' },
    'NLP': { icon: 'fa-solid fa-language', color: '#00897B' },
    'Machine Learning': { icon: 'fa-solid fa-brain', color: '#7C3AED' },
    'LangChain': { icon: 'fa-solid fa-link', color: '#1C3C3C' },
    'RAG': { icon: 'fa-solid fa-magnifying-glass', color: '#E91E63' },
    'LLMs': { icon: 'fa-solid fa-robot', color: '#7C3AED' },
    'Embeddings': { icon: 'fa-solid fa-vector-square', color: '#0288D1' },
    'Vector Databases': { icon: 'fa-solid fa-database', color: '#43A047' },
    'Vector Database': { icon: 'fa-solid fa-database', color: '#43A047' },
    'Prompt Engineering': { icon: 'fa-solid fa-terminal', color: '#37474F' },
  };

  function getSkillData(name) {
    return SKILL_DATA[name] || { icon: 'fa-solid fa-code', color: '#7C3AED' };
  }

  function populateSkills(data) {
    const skills = data.skills;
    $('#skillsLabel').textContent = skills.sectionTitle;
    $('#skillsTitle').textContent = skills.heading;

    const grid = $('#skillsGrid');
    skills.categories.forEach((cat, i) => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.style.transitionDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="skill-card-icon"><i class="${cat.icon}"></i></div>
        <h3>${cat.name}</h3>
        <div class="skill-tags">
          ${cat.skills.map(s => {
        const sd = getSkillData(s);
        return `<span class="skill-tag"><i class="${sd.icon}" style="color:${sd.color}"></i>${s}</span>`;
      }).join('')}
        </div>`;
      grid.appendChild(card);
    });
  }

  /* --- Projects --- */
  function populateProjects(data) {
    const proj = data.projects;
    $('#projectsLabel').textContent = proj.sectionTitle;
    $('#projectsTitle').textContent = proj.heading;
    $('#projectsDesc').textContent = proj.description;

    const grid = $('#projectsGrid');
    proj.items.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.index = i;
      card.style.setProperty('--card-index', i);
      card.innerHTML = `
        <div class="project-card-inner">
          <div class="project-body">
            <div class="project-card-header">
              <span class="project-num">0${i + 1}</span>
              <span class="project-category">${p.category}</span>
            </div>
            <h3>${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-tech">
              ${p.technologies.map(t => {
        const sd = getSkillData(t);
        return `<span><i class="${sd.icon}"></i>${t}</span>`;
      }).join('')}
            </div>
            <div class="project-links">
              <a href="${p.github || 'https://github.com/'}" class="project-link-github" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Code</a>
              <a href="${p.live || '#contact'}" class="project-link-live" ${p.live ? 'target="_blank" rel="noopener"' : ''}><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>
            </div>
          </div>
          <div class="project-image-container">
            <img src="${p.image}" alt="${p.title}" loading="lazy" />
            <div class="project-image-glow"></div>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* --- Contact --- */
  function populateContact(data) {
    const c = data.contact;
    $('#contactLabel').textContent = c.sectionTitle;
    $('#contactTitle').textContent = c.heading;
    $('#contactDesc').textContent = c.description;

    // Info items
    const info = $('#contactInfo');
    info.innerHTML = `
      <div class="contact-info-item">
        <div class="contact-info-icon"><i class="fa-solid fa-envelope"></i></div>
        <div class="contact-info-text">
          <h4>Email</h4>
          <p>${c.email}</p>
        </div>
      </div>
      <div class="contact-info-item">
        <div class="contact-info-icon"><i class="fa-solid fa-location-dot"></i></div>
        <div class="contact-info-text">
          <h4>Location</h4>
          <p>${c.location}</p>
        </div>
      </div>
      <div class="contact-info-item">
        <div class="contact-info-icon"><i class="fa-solid fa-circle-check"></i></div>
        <div class="contact-info-text">
          <h4>Status</h4>
          <p class="availability-badge">${c.availability}</p>
        </div>
      </div>`;

    // Social links
    const socials = $('#contactSocials');
    data.socialLinks.forEach(s => {
      const a = document.createElement('a');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', s.name);
      a.innerHTML = `<i class="${s.icon}"></i>`;
      socials.appendChild(a);
    });

    // Form
    const form = $('#contactForm');
    c.form.fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'form-group';
      if (field.type === 'textarea') {
        group.innerHTML = `
          <textarea id="field-${field.name}" name="${field.name}" placeholder=" " ${field.required ? 'required' : ''}></textarea>
          <label for="field-${field.name}">${field.label}</label>
          <div class="form-error">${field.label} is required</div>`;
      } else {
        group.innerHTML = `
          <input type="${field.type}" id="field-${field.name}" name="${field.name}" placeholder=" " ${field.required ? 'required' : ''} />
          <label for="field-${field.name}">${field.label}</label>
          <div class="form-error">${field.type === 'email' ? 'Please enter a valid email' : `${field.label} is required`}</div>`;
      }
      form.appendChild(group);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-submit';
    submitBtn.innerHTML = `<span class="btn-text">${c.form.button}</span><span class="spinner"></span>`;
    form.appendChild(submitBtn);
  }

  /* --- Footer --- */
  function populateFooter(data) {
    const f = data.footer;

    // Brand
    const brandEl = $('#footerBrand');
    const brandParts = f.brand.split('.');
    brandEl.innerHTML = `${brandParts[0]}<span>.${brandParts[1]}</span>`;

    $('#footerDesc').textContent = f.description;

    // Social
    const socialsEl = $('#footerSocials');
    data.socialLinks.forEach(s => {
      const a = document.createElement('a');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', s.name);
      a.innerHTML = `<i class="${s.icon}"></i>`;
      socialsEl.appendChild(a);
    });

    // Nav
    $('#footerNavTitle').textContent = f.navigationTitle;
    const footerNav = $('#footerNav');
    data.navigation.forEach(n => {
      const a = document.createElement('a');
      a.href = n.link;
      a.textContent = n.name;
      footerNav.appendChild(a);
    });

    // Contact Info
    $('#footerContactTitle').textContent = f.contactTitle;
    const fci = $('#footerContactInfo');
    fci.innerHTML = `
      <div class="footer-contact-item"><i class="fa-solid fa-envelope"></i><span>${data.contact.email}</span></div>
      <div class="footer-contact-item"><i class="fa-solid fa-location-dot"></i><span>${data.contact.location}</span></div>
      <div class="footer-contact-item"><i class="fa-solid fa-circle-check"></i><span>${data.contact.availability}</span></div>`;

    $('#footerCopyright').textContent = f.copyright;
  }

  /* ------------------------------------------
     3.  ANIMATION SYSTEM
     ------------------------------------------ */
  function initAnimations() {
    initLenis();
    initNavbar();
    initScrollProgress();
    initRevealObserver();
    initTimelineObserver();
    initSkillCardObserver();
    initProjectCardObserver();
    initProjectScrollStack();
    initParallaxHero();
    initRingFloat();
    initContactForm();
    initCursorGlow();
  }

  /* --- Navbar: scroll state + active section --- */
  function initNavbar() {
    const navbar = $('#navbar');
    const hamburger = $('#navHamburger');
    const navLinks = $('#navLinks');
    const overlay = $('#navOverlay');
    const sections = $$('section[id]');
    const links = $$('a[data-section]', navLinks);

    // Dark sections: about, projects, footer
    const darkSections = ['about', 'projects'];

    // Toggle mobile menu
    function toggleMenu() {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      overlay.classList.toggle('open');
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close on link click
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) toggleMenu();
      });
    });

    // Scroll handler
    const onScroll = rafThrottle(() => {
      const scrollY = window.scrollY;

      // Scrolled state (add bg)
      navbar.classList.toggle('scrolled', scrollY > 50);

      // Determine which section navbar is over to set dark-mode
      let overDark = false;
      darkSections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          const rect = sec.getBoundingClientRect();
          // Check if the navbar is within this dark section
          if (rect.top < 72 && rect.bottom > 72) {
            overDark = true;
          }
        }
      });
      navbar.classList.toggle('dark-mode', overDark);

      // Active section highlighting — use getBoundingClientRect for accuracy
      // with section dividers in the layout
      let current = '';
      const threshold = window.innerHeight * 0.35;
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > 0) {
          current = sec.id;
        }
      });
      links.forEach(a => {
        a.classList.toggle('active', a.dataset.section === current);
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
  }

  /* --- Scroll progress bar --- */
  function initScrollProgress() {
    const bar = $('#scrollProgress');
    const onScroll = rafThrottle(() => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = pct + '%';
    });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Generic reveal with IntersectionObserver --- */
  function initRevealObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  /* --- Timeline 3D scroll animation ---
     Items start pushed back on Z-axis and rotate.
     As they enter the viewport they spring forward.
     The most-centred item becomes "active" with glow. */
  function initTimelineObserver() {
    if (prefersReducedMotion) {
      $$('.timeline-item').forEach(el => el.classList.add('visible', 'active'));
      return;
    }

    const items = $$('.timeline-item');
    const progressBar = $('#timelineProgress');
    const container = $('#timelineContainer');

    // Reveal observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });

    items.forEach(el => observer.observe(el));

    // Scroll-based active state & progress
    const onScroll = rafThrottle(() => {
      const viewCenter = window.innerHeight * 0.55;
      let closestIdx = 0;
      let closestDist = Infinity;

      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - viewCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      items.forEach((item, i) => {
        item.classList.toggle('active', i === closestIdx);
      });

      // Progress line
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerH = containerRect.height;
        const scrollIntoContainer = viewCenter - containerTop;
        const pct = Math.min(Math.max(scrollIntoContainer / containerH, 0), 1);
        progressBar.style.height = (pct * 100) + '%';
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Skill cards reveal with IntersectionObserver --- */
  function initSkillCardObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    $$('.skill-card').forEach(el => observer.observe(el));
  }

  /* --- Project cards reveal --- */
  function initProjectCardObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    $$('.project-card').forEach(el => observer.observe(el));
  }

  /* --- Project cards scroll stack animation --- */
  function initProjectScrollStack() {
    const cards = $$('.project-card');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      card.style.setProperty('--card-index', i);
    });

    if (prefersReducedMotion) return;

    const onScroll = rafThrottle(() => {
      const windowHeight = window.innerHeight;
      const isMobile = window.innerWidth <= 900;
      const baseTop = isMobile ? 75 : 90;
      const stepTop = isMobile ? 16 : 24;

      cards.forEach((card, i) => {
        const nextCard = cards[i + 1];
        if (!nextCard) return;

        const nextRect = nextCard.getBoundingClientRect();
        const targetTop = baseTop + (i + 1) * stepTop;

        const startY = windowHeight * 0.85;
        const endY = targetTop;

        if (nextRect.top < startY && nextRect.top > endY) {
          const progress = (startY - nextRect.top) / (startY - endY);
          const scale = 1 - progress * 0.04;
          const brightness = 1 - progress * 0.15;
          const blur = progress * 0.8;
          card.style.transform = `scale(${scale})`;
          card.style.filter = `brightness(${brightness}) blur(${blur}px)`;
        } else if (nextRect.top <= endY) {
          let totalStackedOver = 0;
          for (let j = i + 1; j < cards.length; j++) {
            const r = cards[j].getBoundingClientRect();
            const tTop = baseTop + j * stepTop;
            if (r.top <= tTop + 5) {
              totalStackedOver++;
            }
          }
          const scale = Math.max(1 - totalStackedOver * 0.035, 0.84);
          const brightness = Math.max(1 - totalStackedOver * 0.1, 0.5);
          const blur = Math.min(totalStackedOver * 0.6, 2.5);
          card.style.transform = `scale(${scale})`;
          card.style.filter = `brightness(${brightness}) blur(${blur}px)`;
        } else {
          card.style.transform = 'scale(1)';
          card.style.filter = 'brightness(1) blur(0px)';
        }
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* --- Hero parallax: mouse movement creates subtle 3D perspective --- */
  function initParallaxHero() {
    if (prefersReducedMotion) return;

    const bgText = $('#heroBgText');
    const heroLeft = $('#heroLeft');
    const imgWrapper = $('#heroImageWrapper');

    document.addEventListener('mousemove', rafThrottle(e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 to 1
      const dy = (e.clientY - cy) / cy;

      // Background text — slow, opposite direction
      if (bgText) {
        bgText.style.transform = `translate(calc(-50% + ${dx * -20}px), calc(-50% + ${dy * -10}px))`;
      }

      // Hero text block — very subtle
      if (heroLeft) {
        heroLeft.style.transform = `translate(${dx * 4}px, ${dy * 3}px)`;
      }

      // Image wrapper — perspective tilt
      if (imgWrapper) {
        const rotY = dx * 6;
        const rotX = dy * -4;
        imgWrapper.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }
    }));
  }

  /* --- Floating ring animation around hero image --- */
  function initRingFloat() {
    if (prefersReducedMotion) return;

    const wrapper = $('#heroImageWrapper');
    if (!wrapper) return;

    // Create real elements to animate (can't animate pseudo-elements via JS)
    const ringInner = document.createElement('div');
    const ringOuter = document.createElement('div');
    ringInner.className = 'hero-ring hero-ring-inner';
    ringOuter.className = 'hero-ring hero-ring-outer';
    wrapper.appendChild(ringInner);
    wrapper.appendChild(ringOuter);

    // Hide CSS pseudo-element rings since we replaced them
    wrapper.classList.add('rings-active');

    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;

      // Gentle sine wave drift: ~3-5px, slow period
      const innerX = Math.sin(elapsed * 0.8) * 4;
      const innerY = Math.cos(elapsed * 0.6) * 2;
      const outerX = Math.sin(elapsed * 0.5 + Math.PI) * 5;
      const outerY = Math.cos(elapsed * 0.7 + Math.PI) * 3;

      ringInner.style.transform = `rotate(3deg) translate(${innerX}px, ${innerY}px)`;
      ringOuter.style.transform = `rotate(-2deg) translate(${outerX}px, ${outerY}px)`;

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }


  /* --- Contact form validation & Web3Forms submit --- */
  function initContactForm() {
    const form = $('#contactForm');
    const success = $('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      $$('.form-group', form).forEach(group => {
        const input = $('input, textarea', group);
        if (!input) return;
        const value = input.value.trim();
        let isInvalid = false;

        if (input.required && !value) isInvalid = true;
        if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) isInvalid = true;

        group.classList.toggle('error', isInvalid);
        if (isInvalid) valid = false;
      });

      if (!valid) return;

      // Show loading state
      const btn = $('.btn-submit', form);
      btn.classList.add('loading');

      try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        btn.classList.remove('loading');

        if (result.success) {
          form.style.display = 'none';
          success.classList.add('show');
          form.reset();
        } else {
          alert(result.message || 'Failed to send message.');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        btn.classList.remove('loading');
        alert('Something went wrong. Please try again.');
      }
    });

    // Clear errors on input
    form.addEventListener('input', e => {
      const group = e.target.closest('.form-group');
      if (group) group.classList.remove('error');
    });
  }

  /* --- Cursor glow (desktop only) --- */
  function initCursorGlow() {
    if (prefersReducedMotion) return;
    const glow = $('#cursorGlow');
    if (!glow || !window.matchMedia('(hover: hover)').matches) return;

    document.addEventListener('mousemove', rafThrottle(e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }));
  }

})();
