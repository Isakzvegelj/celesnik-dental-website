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
  initAnimations();
  initBeforeAfterSlider();
  initThemeToggle();
  initScrollAnimations();
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

