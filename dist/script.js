const weddingDate = new Date('2026-12-12T19:00:00-03:00');
const units = ['days', 'hours', 'minutes', 'seconds'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown() {
  let remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
  units.forEach((unit) => {
    document.getElementById(unit).textContent = pad(values[unit]);
  });
}


updateCountdown();
setInterval(updateCountdown, 1000);

const galleryButtons = [...document.querySelectorAll('[data-gallery-index]')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox__image');
let activeGalleryIndex = 0;

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const image = galleryButtons[activeGalleryIndex].querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
}

galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    showGalleryImage(index);
    lightbox.showModal();
  });
});

document.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox__nav--previous').addEventListener('click', () => showGalleryImage(activeGalleryIndex - 1));
document.querySelector('.lightbox__nav--next').addEventListener('click', () => showGalleryImage(activeGalleryIndex + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') showGalleryImage(activeGalleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(activeGalleryIndex + 1);
});

const bankDialog = document.querySelector('.bank-dialog');
const bankToast = document.querySelector('.bank-toast');
let bankToastTimer;

document.querySelector('.bank-open').addEventListener('click', () => bankDialog.showModal());
document.querySelector('.bank-close').addEventListener('click', () => bankDialog.close());
bankDialog.addEventListener('click', (event) => { if (event.target === bankDialog) bankDialog.close(); });

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  bankDialog.append(field);
  field.select();
  document.execCommand('copy');
  field.remove();
  return Promise.resolve();
}

document.querySelectorAll('.bank-copy').forEach((button) => {
  button.addEventListener('click', () => {
    copyText(button.dataset.alias).then(() => {
      bankToast.textContent = `Alias copiado: ${button.dataset.alias}`;
    }).catch(() => {
      bankToast.textContent = `Alias: ${button.dataset.alias}`;
    });
    bankToast.classList.add('is-visible');
    clearTimeout(bankToastTimer);
    bankToastTimer = setTimeout(() => bankToast.classList.remove('is-visible'), 2200);
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const audioToggle = document.querySelector('#audioToggle');
const invitationAudio = document.querySelector('#invitationAudio');
let audioFadeFrame = 0;

function syncAudioControl(isPlaying) {
  audioToggle.classList.toggle('is-playing', isPlaying);
  audioToggle.setAttribute('aria-pressed', String(isPlaying));
  audioToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
}

function fadeAudioTo(targetVolume = 0.6, duration = 1600) {
  cancelAnimationFrame(audioFadeFrame);
  const startedAt = performance.now();
  const startingVolume = invitationAudio.volume;
  function step(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    invitationAudio.volume = startingVolume + (targetVolume - startingVolume) * (1 - Math.pow(1 - progress, 3));
    if (progress < 1) audioFadeFrame = requestAnimationFrame(step);
  }
  audioFadeFrame = requestAnimationFrame(step);
}

async function startInvitationAudio() {
  cancelAnimationFrame(audioFadeFrame);
  invitationAudio.volume = 0.05;
  try {
    await invitationAudio.play();
    fadeAudioTo();
  } catch {
    syncAudioControl(false);
  }
}

// El botón solo aparece si el archivo de música existe (en iPhone el audio no se
// precarga hasta que se toca la pantalla, por eso se consulta el archivo directamente).
fetch(invitationAudio.src, { method: 'HEAD' })
  .then((response) => { if (response.ok) audioToggle.hidden = false; })
  .catch(() => {});

audioToggle.addEventListener('click', () => {
  if (invitationAudio.paused) {
    startInvitationAudio();
  } else {
    cancelAnimationFrame(audioFadeFrame);
    invitationAudio.pause();
  }
});
invitationAudio.addEventListener('play', () => syncAudioControl(true));
invitationAudio.addEventListener('pause', () => syncAudioControl(false));

/* Intro: entrar con o sin música. */
(function setupInvitationIntro() {
  const intro = document.querySelector('.invitation-intro');
  const main = document.querySelector('#invitationMain');
  if (!intro) return;
  let leaving = false;

  const enter = (withMusic) => {
    if (leaving) return;
    leaving = true;
    intro.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    // Se llama dentro del toque para que los celulares permitan reproducir.
    if (withMusic) startInvitationAudio();
    intro.classList.add('is-leaving');
    setTimeout(() => {
      document.body.classList.remove('intro-is-open');
      intro.remove();
      window.scrollTo(0, 0);
      main?.focus({ preventScroll: true });
    }, reducedMotion ? 260 : 900);
  };

  intro.querySelector('#introWithMusic')?.addEventListener('click', () => enter(true));
  intro.querySelector('#introWithoutMusic')?.addEventListener('click', () => enter(false));
})();
