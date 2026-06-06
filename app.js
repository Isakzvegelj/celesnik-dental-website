/**
 * Core Logic for Dentalno estetski studio Nina Čelesnik
 * Includes: Interactive Booking, Web Audio API Ambient Pad, Google Reviews Slider, and SEO Helpers.
 * Performance-optimized version with reduced reflows and improved accessibility.
 */

// Cache DOM queries for better performance
const DOM_CACHE = new Map();

function $(sel) {
  if (!DOM_CACHE.has(sel)) {
    DOM_CACHE.set(sel, document.querySelector(sel));
  }
  return DOM_CACHE.get(sel);
}

function $$ (sel) {
  return [...document.querySelectorAll(sel)];
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initReviewsSlider();
  initBookingSystem();
  initAmbientMusic();
  initAnimations();
  initBeforeAfterSlider();
});

/* ==========================================
    Header Scroll Behavior - Performance Optimized
    ========================================== */
function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('header-navigation-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
}

/* ==========================================
    Google Reviews Slider - Performance Optimized
    ========================================== */
function initReviewsSlider() {
  const slides = document.querySelectorAll('.review-slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    if (dots[index]) {
      dots[index].classList.add('active');
    }
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, 7000);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoplay();
    });
  });

  showSlide(0);
  startAutoplay();
}

/* ==========================================
   Procedural Spa Ambient Music (Web Audio API)
   ========================================== */
function initAmbientMusic() {
  const musicBtn = document.querySelector('.music-control');
  if (!musicBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let nodes = [];
  let arpInterval = null;

  // Rich spa chord progression: Cmaj7 → Fmaj7 → Am7 → G6
  const chordProgressions = [
    [130.81, 164.81, 196.00, 246.94],  // Cmaj7
    [174.61, 207.65, 261.63, 329.63],  // Fmaj7
    [110.00, 130.81, 164.81, 220.00],  // Am7
    [98.00, 123.47, 146.83, 164.81],   // G6
  ];
  let chordIdx = 0;

  function createReverbNode(ctx) {
    const convolver = ctx.createConvolver();
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
      }
    }
    convolver.buffer = buffer;
    return convolver;
  }

  function playNote(ctx, freq, masterGain, reverb, startTime, duration) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.detune.setValueAtTime((Math.random() - 0.5) * 6, startTime);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(0.07, startTime + 0.04);
    env.gain.exponentialRampToValueAtTime(0.03, startTime + 0.3);
    env.gain.setValueAtTime(0.03, startTime + duration - 0.3);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(env);
    env.connect(masterGain);
    env.connect(reverb);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.5);
    nodes.push(osc);
    nodes.push(env);
  }

  function startProceduralAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 4);
      masterGain.connect(audioCtx.destination);
      nodes.push(masterGain);

      const reverb = createReverbNode(audioCtx);
      const reverbGain = audioCtx.createGain();
      reverbGain.gain.value = 0.25;
      reverb.connect(reverbGain);
      reverbGain.connect(audioCtx.destination);
      nodes.push(reverb);
      nodes.push(reverbGain);

      function playChordArp() {
        if (!audioCtx || !isPlaying) return;
        const chord = chordProgressions[chordIdx % chordProgressions.length];
        chordIdx++;
        const t = audioCtx.currentTime;
        chord.forEach((freq, i) => {
          playNote(audioCtx, freq, masterGain, reverb, t + i * 0.55, 3.0);
          if (i === chord.length - 1) {
            playNote(audioCtx, freq * 2, masterGain, reverb, t + i * 0.55 + 0.25, 2.2);
          }
        });
      }

      playChordArp();
      arpInterval = setInterval(() => {
        if (isPlaying && audioCtx) playChordArp();
      }, 6000);

    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  function stopProceduralAudio() {
    if (arpInterval) { clearInterval(arpInterval); arpInterval = null; }
    if (audioCtx) {
      const masterGain = nodes[0];
      if (masterGain && audioCtx.state !== 'closed') {
        try {
          masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
        } catch (err) {}
      }
      setTimeout(() => {
        nodes.forEach(node => {
          try { node.stop(); } catch(e) {}
          try { node.disconnect(); } catch(e) {}
        });
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        audioCtx = null;
        nodes = [];
      }, 1600);
    }
  }

  musicBtn.addEventListener('click', () => {
    if (!isPlaying) {

      startProceduralAudio();
      // Explicitly resume in click handler to handle browser gestures
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isPlaying = true;
      musicBtn.classList.add('playing');
      // Update HTML inside the button to show "Mute" icon or sound waves active
      musicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      `;
    } else {
      stopProceduralAudio();
      isPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    }
  });
}

/* ==========================================
   Booking Request & Storage Flow (Paper-Safe)
   ========================================== */
function initBookingSystem() {
  const form = document.getElementById('booking-request-form');
  const modal = document.getElementById('booking-success-modal');
  const modalClose = document.getElementById('modal-close-btn');
  if (!form) return;

  // Set minimum date to today to prevent booking in the past
  const today = new Date().toISOString().split('T')[0];
  const dateInput1 = document.getElementById('preferred-date-1');
  const dateInput2 = document.getElementById('preferred-date-2');
  if (dateInput1) dateInput1.min = today;
  if (dateInput2) dateInput2.min = today;

  // Pre-fill fields from LocalStorage if returning patient
  const savedName = localStorage.getItem('patient_name');
  const savedPhone = localStorage.getItem('patient_phone');
  const savedEmail = localStorage.getItem('patient_email');

  if (savedName) document.getElementById('patient-name').value = savedName;
  if (savedPhone) document.getElementById('patient-phone').value = savedPhone;
  if (savedEmail) document.getElementById('patient-email').value = savedEmail;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect data
    const name = document.getElementById('patient-name').value.trim();
    const phone = document.getElementById('patient-phone').value.trim();
    const email = document.getElementById('patient-email').value.trim();
    const dentistType = document.getElementById('dentist-type').value;
    const serviceType = document.getElementById('service-type').value;
    
    const date1 = document.getElementById('preferred-date-1').value;
    const time1 = document.getElementById('preferred-time-1').value;
    const date2 = document.getElementById('preferred-date-2').value || "Ni izbrano / Not chosen";
    const time2 = document.getElementById('preferred-time-2').value || "Ni izbrano / Not chosen";
    
    const note = document.getElementById('patient-notes').value.trim() || "Brez opomb / No notes";

    // Save details to localstorage for next visit
    localStorage.setItem('patient_name', name);
    localStorage.setItem('patient_phone', phone);
    localStorage.setItem('patient_email', email);

    // Build human-readable email format for the receptionist (Slovenian primary with English translation)
    const emailSubject = `Naročanje DES Čelesnik: ${name}`;
    const emailBody = `Pozdravljeni DES Čelesnik,

Prejeli ste spletno POVPRAŠEVANJE ZA TERMIN.
Prosimo, preverite fizični papirni koledar in potrdite termin stranki.

--- PODATKI O PACIENTU ---
Ime in priimek: ${name}
Telefon: ${phone}
E-naslov: ${email}

--- STORITEV ---
Želena oskrba: ${dentistType === 'specialist' ? 'dr. Nina Čelesnik (Premium in Estetska Oskrba)' : 'Splošna in preventivna oskrba (Ugodna splošna oskrba)'}
Tip storitve: ${serviceType}

--- ŽELENI ČASI (Prosim izberite enega glede na papirni koledar) ---
Možnost 1: ${date1} ob ${time1}
Možnost 2: ${date2} ob ${time2}

--- OPOMBE PACIENTA ---
${note}

--------------------------------------
Navodila za recepcijo:
1. Preverite papirni koledar za izbrana termina.
2. Vpišite pacienta v prosti termin.
3. Pokličite pacienta na ${phone} ali odgovorite na to e-pošto za končno potrditev.
`;

    // Construct Mailto Link
    const mailtoUrl = `mailto:des.celesnik@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoUrl;

    // Show beautiful customized feedback modal
    if (modal) {
      modal.classList.add('active');
    }
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
      form.reset();
      // Re-set min dates
      if (dateInput1) dateInput1.min = today;
      if (dateInput2) dateInput2.min = today;
    });
  }
}

/* ==========================================
   Smooth Fade-in On-Scroll Animations
   ========================================== */
function initAnimations() {
  const animatedElements = document.querySelectorAll('.service-tier-card, .team-card, .concept-img-wrapper, .concept-text, .booking-card, .contact-panel');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  } else {
    // Fallback if browser is very old (e.g. some older clients from Austria/Italy)
    animatedElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
}

/* ==========================================
     Interactive Before & After Smile Slider - Enhanced UX
     ========================================== */
function initBeforeAfterSlider() {
  const sliders = document.querySelectorAll('.before-after-slider-wrapper');
  sliders.forEach(slider => {
    const rangeInput = slider.querySelector('.slider-range-input');
    const afterImgContainer = slider.querySelector('.slider-img-after');
    const dividerLine = slider.querySelector('.slider-divider-line');
    const dividerHandle = slider.querySelector('.slider-divider-handle');

    if (!rangeInput || !afterImgContainer || !dividerLine || !dividerHandle) return;

    const updateSlider = (val) => {
      const pct = Math.max(0, Math.min(100, val));
      afterImgContainer.style.width = `${pct}%`;
      dividerLine.style.left = `${pct}%`;
      dividerHandle.style.left = `${pct}%`;
    };

    rangeInput.addEventListener('input', (e) => updateSlider(e.target.value), { passive: true });
    rangeInput.addEventListener('change', (e) => updateSlider(e.target.value), { passive: true });

    updateSlider(rangeInput.value);
  });
}
