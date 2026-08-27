// main.js — 极简商务风个人简历网站
// 处理 scroll-snap 兼容性、轮播、键盘导航、逐行浮现

(function () {
  'use strict';

  // ===== 轮播 =====
  let carouselIndex = 0;
  const carouselTrack = document.getElementById('carousel-track');
  const slides = carouselTrack ? carouselTrack.querySelectorAll('.carousel-slide') : [];
  const slideCount = slides.length;
  const carouselInterval = 4000; // 4秒切换

  function goToSlide(index) {
    if (!carouselTrack || slideCount === 0) return;
    carouselIndex = ((index % slideCount) + slideCount) % slideCount;
    carouselTrack.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';
  }

  function nextSlide() {
    goToSlide(carouselIndex + 1);
  }

  // 启动轮播
  if (slideCount > 1) {
    setInterval(nextSlide, carouselInterval);
  }

  // ===== 介绍文字逐行浮现 =====
  const heroLines = document.querySelectorAll('.hero-line');
  if (heroLines.length > 0) {
    setTimeout(function () {
      heroLines.forEach(function (line, i) {
        setTimeout(function () {
          line.classList.add('visible');
        }, i * 600); // 每行间隔 600ms
      });
    }, 300); // 页面加载后 300ms 开始
  }

  // ===== scroll-snap 兼容性检测 =====
  const supportsScrollSnap = 'scrollSnapType' in document.documentElement.style ||
    'webkitScrollSnapType' in document.documentElement.style;

  if (!supportsScrollSnap) {
    document.querySelector('.scroll-container').style.scrollBehavior = 'smooth';
    console.warn('浏览器不支持 scroll-snap，已降级为普通滚动');
  }

  // ===== 键盘导航 =====
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = document.querySelector('.scroll-container');
      const pages = container.querySelectorAll('.page');
      const currentScroll = container.scrollTop;
      const pageHeight = pages[0].offsetHeight;
      const currentPage = Math.round(currentScroll / pageHeight);

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
    }
  });

})();