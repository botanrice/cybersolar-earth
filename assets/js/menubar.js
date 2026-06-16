// ── About Modal ──
const overlay = document.getElementById('about-modal');
const trigger = document.getElementById('about-trigger');
const closeBtn = document.getElementById('modal-close');
const okBtn = document.getElementById('modal-ok');

function openModal() { overlay.classList.add('open'); }
function closeModal() { overlay.classList.remove('open'); }

trigger.addEventListener('click', function() {
  const path = window.location.pathname;
  const isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/index');
  if (isHome) {
    openModal();
  } else {
    window.location.href = '/index.html';
  }
});
closeBtn.addEventListener('click', closeModal);
okBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', function(e) {
  if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ── Dropdown Menu Logic ──
const menuTriggers = document.querySelectorAll('.menubar-item[data-menu]');
let openMenu = null;

function closeAllMenus() {
  if (openMenu) {
    openMenu.classList.remove('open');
    openMenu.closest('.menubar-item').classList.remove('menu-open');
    openMenu = null;
  }
}

function positionMenu(trigger, menu) {
  const trigRect = trigger.getBoundingClientRect();
  const vw = window.innerWidth;
  menu.style.visibility = 'hidden';
  menu.style.display = 'block';
  const menuW = menu.offsetWidth;
  menu.style.display = '';
  menu.style.visibility = '';

  let left = trigRect.left;
  const top = trigRect.bottom + 3;
  if (left + menuW > vw - 8) {
    left = vw - menuW - 8;
  }
  if (left < 8) left = 8;

  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
}

menuTriggers.forEach(trigger => {
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const menu = trigger.querySelector('.dropdown-menu');
    if (!menu) return;
    if (openMenu === menu) {
      closeAllMenus();
    } else {
      closeAllMenus();
      positionMenu(trigger, menu);
      menu.classList.add('open');
      trigger.classList.add('menu-open');
      openMenu = menu;
    }
  });
});

document.addEventListener('click', closeAllMenus);

document.querySelectorAll('.dropdown-item:not(.disabled)').forEach(item => {
  item.addEventListener('click', e => {
    e.stopPropagation();
    const action = item.dataset.action;
    closeAllMenus();
    if (action) handleMenuAction(action);
  });
});

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2500);
}

// ── State ──
const wallpapers = [
  '',
  'radial-gradient(ellipse at center, #1c3a1c 0%, #0a1205 100%)',
  'radial-gradient(ellipse at center, #1a0a3a 0%, #08050f 100%)',
  'radial-gradient(ellipse at center, #3a2510 0%, #150d05 100%)',
  'radial-gradient(ellipse at center, #0a1a3a 0%, #03060f 100%)',
];
const wallpaperNames = ['Default', 'Greenfield', 'Ultraviolet', 'Desert', 'Deep Sea'];
let wallpaperIdx = 0;
let isInverted = false;
let isDark = false;
let zoomLevel = 1;

function handleMenuAction(action) {
  switch (action) {
    case 'arena':
      window.open('https://www.are.na', '_blank', 'noopener');
      break;
    case 'borice':
      window.open('http://borice.exposed', '_blank', 'noopener');
      break;
    case 'alias':
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('Alias created — URL copied ✓'))
        .catch(() => showToast('Could not access clipboard'));
      break;
    case 'print':
      window.print();
      break;
    case 'wallpaper':
      wallpaperIdx = (wallpaperIdx + 1) % wallpapers.length;
      document.body.style.background = wallpapers[wallpaperIdx];
      showToast('Wallpaper: ' + wallpaperNames[wallpaperIdx]);
      break;
    case 'invert':
      isInverted = !isInverted;
      document.body.style.filter = isInverted ? 'invert(1)' : '';
      showToast(isInverted ? 'Colors inverted' : 'Colors restored');
      break;
    case 'glitch':
      document.body.classList.remove('glitching');
      void document.body.offsetWidth;
      document.body.classList.add('glitching');
      setTimeout(() => document.body.classList.remove('glitching'), 800);
      break;
    case 'darkmode':
      isDark = !isDark;
      document.body.classList.toggle('dark-mode', isDark);
      document.getElementById('darkmode-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
      showToast(isDark ? 'Dark mode on' : 'Light mode on');
      break;
    case 'zoomin':
      zoomLevel = Math.min(+(zoomLevel + 0.15).toFixed(2), 2);
      document.body.style.zoom = zoomLevel;
      showToast('Zoom: ' + Math.round(zoomLevel * 100) + '%');
      break;
    case 'zoomout':
      zoomLevel = Math.max(+(zoomLevel - 0.15).toFixed(2), 0.5);
      document.body.style.zoom = zoomLevel;
      showToast('Zoom: ' + Math.round(zoomLevel * 100) + '%');
      break;
    case 'fullscreen':
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .catch(() => showToast('Fullscreen not available'));
      } else {
        document.exitFullscreen();
      }
      break;
    case 'about':
      openModal();
      break;
    case 'whatisthis':
      document.getElementById('help-modal').classList.add('open');
      break;
    case 'viewsource':
      window.open('view-source:' + window.location.href, '_blank', 'noopener');
      break;
  }
}

// ── Help Modal ──
const helpModal = document.getElementById('help-modal');
document.getElementById('help-modal-close').addEventListener('click', () => helpModal.classList.remove('open'));
document.getElementById('help-modal-ok').addEventListener('click', () => helpModal.classList.remove('open'));
helpModal.addEventListener('click', e => { if (e.target === helpModal) helpModal.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') helpModal.classList.remove('open'); });
