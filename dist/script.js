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

const guest = new URLSearchParams(window.location.search).get('invitado');
if (guest) document.getElementById('guest-name').textContent = guest;

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
