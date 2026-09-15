// main.js — 全新个人网站
// 处理 scroll-snap 兼容、键盘导航、逐段浮现动画、波浪粒子与鼠标打散粒子

(function () {
  'use strict';

  /* ================= canvas 辅助 ================= */
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function particleColor() {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-particle')
      .trim();
    return raw.length ? raw : '184, 169, 155';
  }

  /* ================= 波浪动态粒子（第 1 / 3 / 4 页） ================= */
  function initWaveFx(canvas) {
    let particles = [];
    let time = 0;
    const ctx = setupCanvas(canvas);

    function create() {
      particles = [];
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // 更紧凑：每 3px 约一个粒子（原为 9px）
      const count = Math.round(Math.min(420, Math.max(150, w / 3)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          baseY: h * (0.28 + Math.random() * 0.5),
          amplitude: 8 + Math.random() * 32,
          frequency: 0.003 + Math.random() * 0.006,
          phase: Math.random() * Math.PI * 2,
          speedX: 0.25 + Math.random() * 0.6,
          size: 1.2 + Math.random() * 2.8,
          alpha: 0.22 + Math.random() * 0.48
        });
      }
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;
      const rgb = particleColor();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x -= p.speedX;
        if (p.x < -20) {
          p.x = w + 20;
          p.baseY = h * (0.28 + Math.random() * 0.5);
        }
        const y = p.baseY + Math.sin(p.x * p.frequency + p.phase + time * 0.7) * p.amplitude;
        ctx.beginPath();
        ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb + ', ' + p.alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    create();
    requestAnimationFrame(draw);

    return {
      recreate: function () {
        setupCanvas(canvas);
        create();
      }
    };
  }

  const waveFxList = [];
  const waveCanvases = document.querySelectorAll('.wave-canvas');
  waveCanvases.forEach(function (canvas) {
    waveFxList.push(initWaveFx(canvas));
  });

  /* ================= 第二页：随机粒子 + 鼠标打散 ================= */
  const burstCanvas = document.getElementById('burst-canvas');
  const page2 = document.getElementById('page-2');
  let burstParticles = [];
  const mouse = { x: -9999, y: -9999 };

  function createBurstParticles() {
    if (!burstCanvas) return;
    burstParticles = [];
    const w = burstCanvas.clientWidth;
    const h = burstCanvas.clientHeight;
    const count = Math.round(Math.min(130, Math.max(70, w / 10)));
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      burstParticles.push({
        x: x, y: y,
        homeX: x, homeY: y,
        vx: 0, vy: 0,
        size: 1.5 + Math.random() * 2.6,
        alpha: 0.28 + Math.random() * 0.42
      });
    }
  }

  function drawBurst() {
    if (!burstCanvas) return;
    const ctx = burstCanvas.getContext('2d');
    const w = burstCanvas.clientWidth;
    const h = burstCanvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const rgb = particleColor();
    const radius = 150;

    for (let i = 0; i < burstParticles.length; i++) {
      const p = burstParticles[i];

      // 鼠标斥力：将附近粒子推开（打散）
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && dist > 0.1) {
        const force = ((radius - dist) / radius) * 2.4;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // 弹簧力：缓慢回到原位
      p.vx += (p.homeX - p.x) * 0.008;
      p.vy += (p.homeY - p.y) * 0.008;

      // 阻尼
      p.vx *= 0.88;
      p.vy *= 0.88;

      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ', ' + p.alpha + ')';
      ctx.fill();
    }
    requestAnimationFrame(drawBurst);
  }

  if (burstCanvas && page2) {
    setupCanvas(burstCanvas);
    createBurstParticles();
    requestAnimationFrame(drawBurst);

    page2.addEventListener('mousemove', function (e) {
      const rect = burstCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    page2.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  /* ================= 浮现动画 ================= */
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');

  function playHero() {
    if (!heroTitle || !heroSubtitle) return;
    heroTitle.classList.remove('visible');
    heroSubtitle.classList.remove('visible');
    void heroTitle.offsetWidth;
    requestAnimationFrame(function () {
      heroTitle.classList.add('visible');
      setTimeout(function () {
        heroSubtitle.classList.add('visible');
      }, 450);
    });
  }

  const mottoLines = document.querySelectorAll('.motto-line');

  function playMotto() {
    if (mottoLines.length === 0) return;
    mottoLines.forEach(function (el) { el.classList.remove('visible'); });
    void mottoLines[0].offsetWidth;
    requestAnimationFrame(function () {
      mottoLines.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('visible');
        }, i * 350);
      });
    });
  }

  const page1 = document.getElementById('page-1');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (entry.target.id === 'page-1') playHero();
      if (entry.target.id === 'page-2') playMotto();
    });
  }, { threshold: 0.5 });

  if (page1) revealObserver.observe(page1);
  if (page2) revealObserver.observe(page2);

  /* ================= scroll-snap 兼容性检测 ================= */
  const supportsScrollSnap = 'scrollSnapType' in document.documentElement.style ||
    'webkitScrollSnapType' in document.documentElement.style;

  if (!supportsScrollSnap) {
    const container = document.querySelector('.scroll-container');
    if (container) container.style.scrollBehavior = 'smooth';
    console.warn('浏览器不支持 scroll-snap，已降级为普通滚动');
  }

  /* ================= 键盘导航（上下方向键翻页） ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const container = document.querySelector('.scroll-container');
    if (!container) return;
    const pages = container.querySelectorAll('.page');
    if (pages.length === 0) return;

    const pageHeight = pages[0].offsetHeight;
    const currentPage = Math.round(container.scrollTop / pageHeight);
    let targetPage;
    if (e.key === 'ArrowDown') {
      targetPage = Math.min(currentPage + 1, pages.length - 1);
    } else {
      targetPage = Math.max(currentPage - 1, 0);
    }

    container.scrollTo({
      top: targetPage * pageHeight,
      behavior: 'smooth'
    });
  });

  /* ================= 窗口尺寸变化时重建粒子 ================= */
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      waveFxList.forEach(function (fx) { fx.recreate(); });
      if (burstCanvas) {
        setupCanvas(burstCanvas);
        createBurstParticles();
      }
    }, 200);
  });

})();