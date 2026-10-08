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
