/* ============================================
   Main — 导航、滚动状态、抽屉、进入动画、回到顶部
   ============================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 导航滚动态（背景模糊） ---------- */
  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");
  const progress = document.getElementById("progress");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    // 导航固定常驻：不随滚动隐藏，锚点跳转靠 scroll-padding-top 避让内容
    if (toTop) toTop.classList.toggle("show", y > 600);
    // 顶部进度条
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端抽屉 ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  const drawerClose = document.querySelector(".nav-drawer-close");

  function openDrawer() {
    header.classList.remove("hide");
    drawer.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (toggle) toggle.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) closeDrawer();
  });

  /* ---------- 滚动进入动画（IntersectionObserver） ---------- */
  let observer;
  function setupReveal() {
    if (prefersReduced) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observeAll();
  }
  function observeAll() {
    if (!observer) return;
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
  }
  // 供 render.js 在动态渲染后调用
  window.__reobserve = observeAll;

  /* ---------- 当前章节高亮 ---------- */
  function setupSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");
    if (!sections.length || !navLinks.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- 回到顶部 ---------- */
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- 首屏视差：标题与图片错位移动 ---------- */
  if (!prefersReduced) {
    const heroLeft = document.querySelector(".hero-left");
    const heroRight = document.querySelector(".hero-right");
    const heroBottom = document.querySelector(".hero-bottom");
    if (heroLeft && heroRight) {
      let ticking = false;
      function parallax() {
        const y = window.scrollY;
        const max = window.innerHeight;
        if (y < max) {
          heroLeft.style.transform = `translateY(${y * 0.18}px)`;
          heroRight.style.transform = `translateY(${y * 0.06}px)`;
          if (heroBottom) heroBottom.style.transform = `translateY(${y * -0.08}px)`;
        }
        ticking = false;
      }
      window.addEventListener("scroll", () => {
        if (!ticking) { window.requestAnimationFrame(parallax); ticking = true; }
      }, { passive: true });
    }
  }

  /* ---------- 首屏柔光团：reduced-motion 时隐藏动画 ---------- */
  if (prefersReduced) {
    document.querySelectorAll(".hero-glow, .hero-scroll-hint .bar").forEach((el) => {
      el.style.animation = "none";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupReveal();
    setupSpy();
  });
})();
