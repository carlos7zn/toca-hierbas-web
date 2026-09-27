// Core functionality - shared across all pages
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Nav scroll effect
const navEl = document.querySelector('nav.wrap');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 8);
  });
}

// Global IntersectionObserver for scroll reveals
window.io = null;
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    window.io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          window.io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => window.io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
}

// Re-observe function for dynamically added content
window.observeReveals = function(root = document) {
  if (window.io) {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach(el => window.io.observe(el));
  }
};

// Scroll progress indicator
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  });
}

// Floating particles
window.initParticles = function() {
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer && !particlesContainer.dataset.init) {
    particlesContainer.dataset.init = 'true';
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (8 + Math.random() * 4) + 's';
      particlesContainer.appendChild(p);
    }
  }
};
window.initParticles();

// Discord widget stats
const statMembers = document.getElementById('stat-members');
const statOnlineHero = document.getElementById('stat-online-hero');
const statOnline = document.getElementById('stat-online');
if (statMembers || statOnlineHero || statOnline) {
  (async function loadStats() {
    try {
      const res = await fetch('https://discord.com/api/guilds/1307129882215579749/widget.json');
      if (!res.ok) throw new Error('widget disabled');
      const data = await res.json();
      if (statMembers) statMembers.textContent = data.member_count || '—';
      if (statOnlineHero) statOnlineHero.textContent = data.presence_count || '—';
      if (statOnline) statOnline.textContent = data.presence_count || '—';
    } catch (e) {
      // Widget disabled or not responding
    }
  })();
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Mini-game "Corta la hierba"
const gameArea = document.getElementById('game-area');
if (gameArea) {
  const scoreEl = document.getElementById('game-score');
  const timeEl = document.getElementById('game-time');
  const startBtn = document.getElementById('game-start');
  const leafSVG = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;"><path d="M12 20C12 20 12 12 8 8C6.2 6.2 4 5 3 5C3 5 3.4 9.2 6 12C8.4 14.8 12 15.5 12 20Z"/><path d="M12 20C12 20 12 10.5 16 7C17.8 5.4 20 4.5 21 4.5C21 4.5 20.6 9 18 12C15.3 15 12 15.8 12 20Z"/></svg>';
  let score = 0, timeLeft = 20, spawnId = null, timerId = null;

  function spawnTarget() {
    const btn = document.createElement('button');
    btn.className = 'grass-target';
    btn.innerHTML = leafSVG;
    const maxX = Math.max(gameArea.clientWidth - 44, 0);
    const maxY = Math.max(gameArea.clientHeight - 44, 0);
    btn.style.left = Math.random() * maxX + 'px';
    btn.style.top = Math.random() * maxY + 'px';
    btn.addEventListener('click', () => {
      score++;
      scoreEl.textContent = score;
      btn.remove();
    });
    gameArea.appendChild(btn);
    setTimeout(() => { if (btn.parentElement) btn.remove(); }, 900);
  }

  function startGame() {
    score = 0; timeLeft = 20;
    scoreEl.textContent = 0;
    timeEl.textContent = timeLeft;
    gameArea.innerHTML = '';
    startBtn.disabled = true;
    startBtn.textContent = 'Jugando...';
    spawnId = setInterval(spawnTarget, 550);
    timerId = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(spawnId);
        clearInterval(timerId);
        gameArea.innerHTML = '<div class="game-empty">Bien jugado. Dale a "Jugar de nuevo" para otra ronda.</div>';
        startBtn.disabled = false;
        startBtn.textContent = 'Jugar de nuevo';
      }
    }, 1000);
  }

  startBtn.addEventListener('click', startGame);
}