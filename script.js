/* ==========================================================================
   INNOVERSE - Premium AI Master Course Portfolio JavaScript Engine
   Particle canvas, Count-Up stats, Filter systems, Before/After Slider, Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Particle Canvas Background Mesh
  initParticleMesh();

  // 2. Animated Count-Up Counters
  initCountUpCounters();

  // 3. Navigation Bar & Mobile Sticky Bar Scroll Handling
  initScrollHandler();

  // 4. Testimonial Filtering System
  initTestimonialFilter();

  // 5. Success Gallery Filtering System & Lightbox
  initGallerySystem();

  // 6. Before / After Comparison Slider Drag Handler
  initBeforeAfterSlider();

  // 7. Curriculum Progress Bar Animation
  initProgressBar();

  // 8. Modal Window Triggers
  initModals();
});

/* --------------------------------------------------------------------------
   1. Dynamic Particle Canvas Mesh Background
   -------------------------------------------------------------------------- */
function initParticleMesh() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 18), 65);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Draw node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 122, 255, ${p.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#007aff';
      ctx.fill();

      // Connect nearby nodes with mesh lines
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 122, 255, ${0.18 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   2. Animated Count-Up Counters
   -------------------------------------------------------------------------- */
function initCountUpCounters() {
  const counterElements = document.querySelectorAll('.stat-number[data-target]');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = targetVal % 1 !== 0;

        let startVal = 0;
        const duration = 1600; // ms
        const startTime = performance.now();

        function updateNumber(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          // Ease-out cubic curve
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = startVal + (targetVal - startVal) * easeOut;

          el.textContent = `${prefix}${isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            el.textContent = `${prefix}${targetVal}${suffix}`;
          }
        }

        requestAnimationFrame(updateNumber);
        observerInstance.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   3. Scroll Handler for Navbar & Mobile Sticky Bar
   -------------------------------------------------------------------------- */
function initScrollHandler() {
  const navbar = document.querySelector('.glass-nav');
  const stickyBar = document.querySelector('.sticky-mobile-bar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Navbar scroll class
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Mobile sticky CTA bar show on scroll down past hero
    if (stickyBar) {
      if (currentScrollY > 450) {
        stickyBar.style.transform = 'translateY(0)';
      } else {
        stickyBar.style.transform = 'translateY(100%)';
      }
    }

    lastScrollY = currentScrollY;
  });

  // Auto-close mobile navigation dropdown menu when any link is clicked
  document.querySelectorAll('.navbar-collapse .nav-link, .navbar-collapse .btn-primary-blue').forEach(link => {
    link.addEventListener('click', () => {
      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        if (window.bootstrap && window.bootstrap.Collapse) {
          const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse) || new window.bootstrap.Collapse(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        } else {
          navbarCollapse.classList.remove('show');
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Testimonials Filtering
   -------------------------------------------------------------------------- */
function initTestimonialFilter() {
  const filterBtns = document.querySelectorAll('.testimonial-filter-btn');
  const cards = document.querySelectorAll('.testimonial-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterCategory === 'all' || category === filterCategory) {
          card.style.display = 'block';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. Success Gallery Filtering & Lightbox Modal
   -------------------------------------------------------------------------- */
function initGallerySystem() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox click triggers
  items.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').src;
      const title = item.getAttribute('data-title') || 'Student Work';
      const tag = item.getAttribute('data-tool') || 'AI Generated';

      if (lightboxModal && lightboxImage) {
        lightboxImage.src = imgSrc;
        lightboxTitle.textContent = title;
        lightboxTag.textContent = tag;
        lightboxModal.classList.add('show');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Before / After Comparison Drag Slider
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const container = document.querySelector('.comparison-slider-container');
  if (!container) return;

  const afterImgBox = container.querySelector('.slider-img-after');
  const handle = container.querySelector('.slider-handle');

  let isDragging = false;

  const moveSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let positionX = clientX - rect.left;
    if (positionX < 0) positionX = 0;
    if (positionX > rect.width) positionX = rect.width;

    const percentage = (positionX / rect.width) * 100;
    afterImgBox.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  container.addEventListener('mousedown', (e) => { isDragging = true; moveSlider(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (isDragging) moveSlider(e.clientX); });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch device events
  container.addEventListener('touchstart', (e) => { isDragging = true; moveSlider(e.touches[0].clientX); });
  window.addEventListener('touchmove', (e) => { if (isDragging) moveSlider(e.touches[0].clientX); });
  window.addEventListener('touchend', () => { isDragging = false; });
}

/* --------------------------------------------------------------------------
   7. Curriculum Progress Bar Animation
   -------------------------------------------------------------------------- */
function initProgressBar() {
  const progressFill = document.querySelector('.progress-fill');
  if (!progressFill) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progressFill.style.width = '100%';
      }
    });
  }, { threshold: 0.3 });

  observer.observe(progressFill);
}

/* --------------------------------------------------------------------------
   8. Modal Controls
   -------------------------------------------------------------------------- */
function initModals() {
  // Demo Video Modal
  const demoBtn = document.getElementById('watch-demo-btn');
  const demoModal = document.getElementById('demo-video-modal');

  const closeBtns = document.querySelectorAll('.modal-close-trigger');

  if (demoBtn && demoModal) {
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      demoModal.classList.add('show');
    });
  }



  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.custom-modal-backdrop');
      if (modal) modal.classList.remove('show');
    });
  });

  // Close modal on backdrop click
  document.querySelectorAll('.custom-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('show');
      }
    });
  });

  // ESC key to close active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-modal-backdrop.show').forEach(m => m.classList.remove('show'));
    }
  });
}
