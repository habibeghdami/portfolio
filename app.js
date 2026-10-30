/**
 * HABIB EGHDAMI - PORTFOLIO INTERACTIVITY & PERFORMANCE ENGINE
 * Optimized for lightning-fast buffering, smooth 60fps animations, and zero CLS.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================
     1. VIDEO LAZY-BUFFERING & HOVER PREVIEW
     ======================================================== */
  const videoCards = document.querySelectorAll('.project-card.video-card');

  // Video IntersectionObserver: Load src ONLY when within 300px of viewport
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;
      const video = card.querySelector('video');
      if (!video) return;

      if (entry.isIntersecting) {
        // Prepare video src with metadata buffering
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
      } else {
        // Pause if scrolled out of view to save battery and GPU
        if (!video.paused) {
          video.pause();
          video.classList.remove('is-active');
        }
      }
    });
  }, { rootMargin: '300px 0px' });

  videoCards.forEach(card => {
    videoObserver.observe(card);

    const video = card.querySelector('video');
    if (!video) return;

    let hoverTimeout;

    // Hover Enter: Play preview
    card.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
        }
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              video.classList.add('is-active');
            })
            .catch(() => {
              // Auto-play was prevented (e.g. browser policy), keep poster visible
            });
        }
      }, 70); // Brief debounce
    });

    // Hover Leave: Pause and hide
    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      video.pause();
      video.classList.remove('is-active');
    });
  });


  /* ========================================================
     2. CATEGORY FILTER TABS
     ======================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const projectsGrid = document.getElementById('projectsGrid');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;
      if (projectsGrid) {
        projectsGrid.dataset.activeFilter = filterVal;
      }

      projectCards.forEach(card => {
        const categories = (card.dataset.category || '').split(' ');
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });


  /* ========================================================
     3. THEATER MODAL (LIGHTBOX) FOR FULL VIDEO & IMAGE VIEW
     ======================================================== */
  const modal = document.getElementById('mediaModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalHolder = document.getElementById('modalMediaHolder');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalClient = document.getElementById('modalClient');
  const modalMuteBtn = document.getElementById('modalMuteBtn');

  let currentModalVideo = null;

  function openModal(card) {
    const type = card.dataset.type;
    const title = card.dataset.title || 'نمونه کار';
    const client = card.dataset.client || '';
    const category = card.querySelector('.card-category')?.textContent || '';

    modalTitle.textContent = title;
    modalClient.textContent = client;
    modalCategory.textContent = category;
    modalHolder.innerHTML = '';

    if (type === 'video') {
      const videoSrc = card.dataset.video || card.querySelector('video')?.dataset.src;
      const videoElem = document.createElement('video');
      videoElem.src = videoSrc;
      videoElem.controls = true;
      videoElem.autoplay = true;
      videoElem.playsInline = true;
      videoElem.loop = true;
      videoElem.muted = false; // With sound in modal!
      videoElem.className = 'modal-video-player';

      modalHolder.appendChild(videoElem);
      currentModalVideo = videoElem;
      modalMuteBtn.style.display = 'inline-flex';
    } else {
      const imgSrc = card.dataset.image || card.querySelector('img')?.src;
      const imgElem = document.createElement('img');
      imgElem.src = imgSrc;
      imgElem.alt = title;
      imgElem.className = 'modal-image-view';

      modalHolder.appendChild(imgElem);
      currentModalVideo = null;
      modalMuteBtn.style.display = 'none';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (currentModalVideo) {
      currentModalVideo.pause();
      currentModalVideo.src = '';
      currentModalVideo = null;
    }
    modalHolder.innerHTML = '';
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  modalCloseBtn?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  // Mute / Unmute Button in Modal
  modalMuteBtn?.addEventListener('click', () => {
    if (!currentModalVideo) return;
    currentModalVideo.muted = !currentModalVideo.muted;
    const label = modalMuteBtn.querySelector('span');
    if (label) {
      label.textContent = currentModalVideo.muted ? 'بی‌صدا' : 'با صدا';
    }
  });

  // ESC key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });


  /* ========================================================
     4. 3D CYBER HUD TILT EFFECT (AVATAR CARD)
     ======================================================== */
  const hudCard = document.getElementById('hudCard');
  if (hudCard && window.matchMedia('(pointer: fine)').matches) {
    hudCard.addEventListener('mousemove', (e) => {
      const rect = hudCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      hudCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    hudCard.addEventListener('mouseleave', () => {
      hudCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }


  /* ========================================================
     5. ONE-CLICK COPY PHONE & TOAST NOTIFICATION
     ======================================================== */
  const copyBtn = document.getElementById('copyPhoneBtn');
  const toast = document.getElementById('toastNotify');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout;

  function showToast(text) {
    if (!toast) return;
    toastMsg.textContent = text;
    toast.classList.add('is-shown');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-shown');
    }, 3200);
  }

  copyBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const phoneToCopy = copyBtn.dataset.copy || '09126717255';
    const isEn = document.documentElement.lang === 'en';
    const successMsg = copyBtn.dataset.toastSuccess || (isEn ? `Phone number copied: ${phoneToCopy}` : `شماره تماس کپی شد: ${phoneToCopy}`);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phoneToCopy);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = phoneToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      showToast(successMsg);
    } catch (err) {
      showToast(phoneToCopy);
    }
  });


  /* ========================================================
     6. ACTIVE NAVIGATION LINK ON SCROLL
     ======================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

});
