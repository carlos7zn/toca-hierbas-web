// Core functionality - shared across all pages
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// WebGL Background
window.initWebGLBackground = function() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f1210, 0.0005);
  
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Create glowing particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 150;
  
  const posArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }
  
  for (let i = 0; i < particlesCount; i++) {
    scaleArray[i] = Math.random();
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));
  
  const particlesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `
      attribute float aScale;
      varying float vScale;
      void main() {
        vScale = aScale;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (30.0 * vScale) / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vScale;
      void main() {
        float distance = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, distance) * vScale;
        if (alpha <= 0.0) discard;
        gl_FragColor = vec4(0.54, 0.67, 0.36, alpha * 0.6);
      }
    `,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  // Create floating leaf shapes
  const leafCount = 8;
  const leafGeometry = new THREE.BufferGeometry();
  const leafPositions = new Float32Array(leafCount * 3);
  const leafScales = new Float32Array(leafCount);
  const leafRotations = new Float32Array(leafCount);
  
  for (let i = 0; i < leafCount * 3; i++) {
    leafPositions[i] = (Math.random() - 0.5) * 8;
  }
  
  for (let i = 0; i < leafCount; i++) {
    leafScales[i] = 0.5 + Math.random() * 1.5;
    leafRotations[i] = Math.random() * Math.PI * 2;
  }
  
  leafGeometry.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
  leafGeometry.setAttribute('aScale', new THREE.BufferAttribute(leafScales, 1));
  leafGeometry.setAttribute('aRotation', new THREE.BufferAttribute(leafRotations, 1));
  
  const leafMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `
      attribute float aScale;
      attribute float aRotation;
      varying float vScale;
      varying float vRotation;
      void main() {
        vScale = aScale;
        vRotation = aRotation;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vScale;
      varying float vRotation;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float angle = vRotation;
        float cosA = cos(angle);
        float sinA = sin(angle);
        vec2 rotatedUV = vec2(
          uv.x * cosA - uv.y * sinA,
          uv.x * sinA + uv.y * cosA
        );
        
        float leaf = smoothstep(0.15, 0.0, 
          length(rotatedUV) * 2.0 * vScale
        );
        leaf *= smoothstep(0.0, 0.1, abs(rotatedUV.x) * 2.0 * vScale);
        leaf *= smoothstep(0.0, 0.1, abs(rotatedUV.y) * 2.0 * vScale);
        
        if (leaf <= 0.0) discard;
        gl_FragColor = vec4(0.54, 0.67, 0.36, leaf * 0.3);
      }
    `,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  const leafMesh = new THREE.Points(leafGeometry, leafMaterial);
  scene.add(leafMesh);
  
  // Animation
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.1;
    leafMesh.rotation.y = elapsedTime * 0.05;
    
    // Update material time uniforms if needed
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

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

// Initialize WebGL background after Three.js loads
if (typeof THREE !== 'undefined') {
  initWebGLBackground();
} else {
  // Load Three.js dynamically if not already loaded
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js';
  script.onload = () => {
    initWebGLBackground();
  };
  document.head.appendChild(script);
}

// Theme toggle
(function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'dark');
  }
  
  applyTheme(initialTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();