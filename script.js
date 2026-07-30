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

  // 4. Dynamic Testimonials Loading from data/testimonials.json & Audio Player Controls
  loadTestimonials();

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
   4. Dynamic Testimonials Rendering from data/testimonials.json & Audio Controls
   -------------------------------------------------------------------------- */
async function loadTestimonials() {
  const track1 = document.getElementById('testimonials-row-1');
  const track2 = document.getElementById('testimonials-row-2');
  if (!track1 && !track2) return;

  let testimonials = [];
  try {
    const res = await fetch('data/testimonials.json');
    if (res.ok) {
      testimonials = await res.json();
    }
  } catch (e) {
    console.warn('Fetch data/testimonials.json failed or blocked by local CORS. Using fallback data.', e);
  }

  // Fallback data if fetch failed (e.g. local file:// protocol)
  if (!testimonials || testimonials.length === 0) {
    testimonials = [
      {
        "id": 1,
        "name": "Amina Rahman",
        "location": "Malappuram",
        "rating": 5,
        "quote": "ഈ കോഴ്സ് എടുത്തതിന് ശേഷം AI ഉപയോഗിച്ച് vudeo ഉണ്ടാക്കുന്നത് വളരെ എളുപ്പമായി. ഓരോ ക്ലാസും simple & practical aayum explain ചെയ്തിട്ടുണ്ട്. Thankyou sir for your support."
      },
      {
        "id": 2,
        "name": "Fathima",
        "location": "Malappuram",
        "rating": 5,
        "audioUrl": "assets/audio/testimonial_fathima.mp3",
        "audioDuration": "0:15",
        "quote": null
      },
      {
        "id": 3,
        "name": "Anjana Sivadas",
        "location": "Calicut",
        "rating": 5,
        "audioUrl": "assets/audio/testimonial_anjana_sivadas.mp3",
        "audioDuration": "0:30",
        "quote": null
      },
      {
        "id": 4,
        "name": "pixora._ai",
        "instagramUrl": "https://www.instagram.com/pixora._ai",
        "location": "Kasaragod",
        "rating": 5,
        "audioUrl": "assets/audio/testimonial_pixora_ai.mp3",
        "audioDuration": "0:26",
        "quote": "ഞാൻ ഇപ്പോൾ തന്നെ ഒരു 3 paid work ചെയ്തു കൊടുത്തു. എല്ലാം ഈ കോഴ്സ് il ചേരാൻ സാധിച്ചത് കൊണ്ടാണ് 🤝."
      },
      {
        "id": 5,
        "name": "Muhammad Asif",
        "location": "Adoor",
        "rating": 5,
        "quote": "മുമ്പ് വീഡിയോ എഡിറ്റിംഗിൽ കോൺഫിഡൻസ് ഇല്ലായിരുന്നു. ഇപ്പോൾ AI ടൂളുകൾ ഉപയോഗിച്ച് പ്രൊഫഷണൽ വീഡിയോകൾ വളരെ വേഗത്തിൽ ചെയ്യാൻ കഴിയുന്നു. Thanks 🙏"
      }
    ];
  }

  // Split testimonials into 2 balanced rows
  const mid = Math.ceil(testimonials.length / 2);
  const row1Data = testimonials.slice(0, mid);
  const row2Data = testimonials.slice(mid);

  if (track1) {
    // Duplicate array for smooth infinite marquee looping
    track1.innerHTML = renderTestimonialsHTML([...row1Data, ...row1Data]);
  }
  if (track2) {
    // Duplicate array for smooth infinite marquee looping
    track2.innerHTML = renderTestimonialsHTML([...row2Data, ...row2Data]);
  }

  initAudioPlayers();
}

function renderTestimonialsHTML(testimonials) {
  return testimonials.map(item => {
    const stars = Array(item.rating || 5).fill('<i class="bi bi-star-fill"></i>').join('');
    
    let quoteHtml = '';
    if (item.quote) {
      quoteHtml = `<p class="fst-italic text-light ${item.audioUrl ? 'mb-2' : ''}">"${item.quote}"</p>`;
    }

    let audioHtml = '';
    if (item.audioUrl) {
      audioHtml = `
        <div class="testimonial-audio-player">
          <div class="audio-controls-row">
            <button class="audio-play-btn" data-audio="${item.audioUrl}" aria-label="Play ${item.name} Voice Testimonial">
              <i class="bi bi-play-fill"></i>
            </button>
            <div class="audio-info-col">
              <div class="audio-top-line">
                <div class="audio-waveform">
                  <span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span>
                  <span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"></span>
                </div>
                <span class="audio-time-display">0:00 / ${item.audioDuration || '0:30'}</span>
              </div>
              <input type="range" class="audio-progress-bar" value="0" min="0" max="100">
            </div>
          </div>
        </div>
      `;
    }

    const firstLetter = item.name ? item.name.trim().charAt(0).toUpperCase() : '?';
    const avatarHtml = item.avatar 
      ? `<img src="${item.avatar}" alt="${item.name}" class="author-avatar">` 
      : `<div class="author-avatar-initial">${firstLetter}</div>`;

    const subtext = item.role ? `${item.role} &bull; ${item.location}` : item.location;
    const nameTitle = item.instagramUrl 
      ? `<a href="${item.instagramUrl}" target="_blank" rel="noopener noreferrer" class="text-white text-decoration-none hover-blue">${item.name} <i class="bi bi-instagram text-danger ms-1" style="font-size: 0.9em;"></i></a>` 
      : item.name;

    return `
      <div class="testimonial-marquee-card">
        <div class="glass-card testimonial-card h-100">
          <div>
            <div class="testimonial-author">
              ${avatarHtml}
              <div class="author-info">
                <h4>${nameTitle}</h4>
                <span>${subtext}</span>
              </div>
            </div>
            <div class="stars-rating mb-2 fs-6">${stars}</div>
            ${quoteHtml}
            ${audioHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initAudioPlayers() {
  const playerBoxes = document.querySelectorAll('.testimonial-audio-player');
  let currentActiveAudio = null;
  let currentActivePlayerBox = null;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  playerBoxes.forEach(playerBox => {
    const playBtn = playerBox.querySelector('.audio-play-btn');
    const progressBar = playerBox.querySelector('.audio-progress-bar');
    const timeDisplay = playerBox.querySelector('.audio-time-display');
    const audioSrc = playBtn ? playBtn.getAttribute('data-audio') : null;

    if (!playBtn || !audioSrc) return;

    const audio = new Audio(audioSrc);

    audio.addEventListener('loadedmetadata', () => {
      if (timeDisplay) {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = pct;
        if (timeDisplay) {
          timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
      }
    });

    audio.addEventListener('ended', () => {
      playerBox.classList.remove('playing');
      playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      if (progressBar) progressBar.value = 0;
      if (timeDisplay && audio.duration) {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
      }
      currentActiveAudio = null;
      currentActivePlayerBox = null;
    });

    playBtn.addEventListener('click', () => {
      // Pause any other active audio
      if (currentActiveAudio && currentActiveAudio !== audio) {
        currentActiveAudio.pause();
        if (currentActivePlayerBox) {
          currentActivePlayerBox.classList.remove('playing');
          const oldBtn = currentActivePlayerBox.querySelector('.audio-play-btn');
          if (oldBtn) oldBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
      }

      if (audio.paused) {
        audio.play().then(() => {
          playerBox.classList.add('playing');
          playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
          currentActiveAudio = audio;
          currentActivePlayerBox = playerBox;
        }).catch(err => {
          console.log('Audio playback error or interrupted:', err);
        });
      } else {
        audio.pause();
        playerBox.classList.remove('playing');
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        currentActiveAudio = null;
        currentActivePlayerBox = null;
      }
    });

    if (progressBar) {
      progressBar.addEventListener('input', (e) => {
        if (audio.duration) {
          const seekTime = (e.target.value / 100) * audio.duration;
          audio.currentTime = seekTime;
        }
      });
    }
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

      // Filter individual items
      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });

      // Filter category sections if present
      const sectionBlocks = document.querySelectorAll('[data-category-section]');
      sectionBlocks.forEach(sec => {
        const secCat = sec.getAttribute('data-category-section');
        if (filter === 'all' || secCat === filter) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });

  // Lightbox click triggers (image items)
  items.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      item.addEventListener('click', () => {
        const imgSrc = img.src;
        const title = item.getAttribute('data-title') || 'Student Work';
        const tag = item.getAttribute('data-tool') || 'AI Generated';

        if (lightboxModal && lightboxImage) {
          lightboxImage.src = imgSrc;
          lightboxTitle.textContent = title;
          lightboxTag.textContent = tag;
          lightboxModal.classList.add('show');
        }
      });
    }
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
  // Demo / Intro Video Trigger & Modal
  const demoBtn = document.getElementById('watch-demo-btn');
  const demoModal = document.getElementById('demo-video-modal');
  const heroVideo = document.getElementById('hero-intro-video');

  const closeBtns = document.querySelectorAll('.modal-close-trigger');

  if (demoBtn) {
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Scroll smoothly to the hero video container and play it
      const videoSection = document.getElementById('hero-video');
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (heroVideo) {
        heroVideo.play().catch(() => {});
      }
    });
  }

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('show');
    const modalVideo = modal.querySelector('video');
    if (modalVideo) {
      modalVideo.pause();
    }
  };

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.custom-modal-backdrop');
      closeModal(modal);
    });
  });

  // Close modal on backdrop click
  document.querySelectorAll('.custom-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // ESC key to close active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-modal-backdrop.show').forEach(m => closeModal(m));
    }
  });
}
