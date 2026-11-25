/* ============================================
   旅行区 V8 — 旅途路径式（一条线串联城市）
   左侧一条蜿蜒的旅行长线，城市作为沿线节点分布，
   城市左右交替错落，照片展开在节点旁。
   依赖 data/travel.js（TRAVEL_ROUTE）
   ============================================ */

(function () {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  let lightbox, lbImg, lbCap, lastFocused, photoIndex = [];

  /* ---------- 渲染旅途路径 ---------- */
  function renderJournal() {
    const wrap = document.getElementById("journal-entries");
    if (!wrap || typeof TRAVEL_ROUTE === "undefined") return;
    photoIndex = [];

    const cardsHtml = TRAVEL_ROUTE.map((stop, si) => {
      const cells = stop.photos.map((ph) => {
        const gi = photoIndex.length;
        photoIndex.push({ ...ph, city: stop.city });
        const sizeCls = ph.size || "w-med";
        const inner = ph.src
          ? `<img src="${esc(ph.src)}" alt="${esc(stop.city)}旅行照片" loading="lazy">`
          : `<div class="wall-empty">${esc(stop.city)}</div>`;
        return `
          <div class="wall-photo ${sizeCls}" data-idx="${gi}" ${ph.src ? 'role="button" tabindex="0"' : ''} aria-label="${esc(stop.city)}照片">
            ${inner}
          </div>`;
      }).join("");

      return `
        <article class="route-stop reveal" id="city-${esc(stop.pinyin)}">
          <span class="route-dot" aria-hidden="true"></span>
          <div class="route-card">
            <div class="route-head">
              <span class="route-index">${String(si + 1).padStart(2, "0")}</span>
              <h3 class="route-title">${esc(stop.city)}</h3>
            </div>
            <p class="route-memo">${esc(stop.memo)}</p>
            <div class="photo-wall">${cells}</div>
          </div>
        </article>`;
    }).join("");

    // 三份相同卡片实现无缝循环；只有中间一份对读屏可见
    wrap.innerHTML = `
      <svg class="route-line" id="route-line" aria-hidden="true" preserveAspectRatio="none"></svg>
      <div class="route-stops">${cardsHtml}${cardsHtml}${cardsHtml}</div>`;
    wrap.querySelectorAll(".route-stop").forEach((el, i) => {
      const inMiddle = i >= TRAVEL_ROUTE.length && i < TRAVEL_ROUTE.length * 2;
      if (!inMiddle) {
        el.removeAttribute("id");
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ---------- 画横向旅行长线（贯穿所有城市节点） ---------- */
  function drawRouteLine() {
    const svg = document.getElementById("route-line");
    const stops = document.querySelectorAll(".route-stop .route-dot");
    if (!svg || !stops.length) return;

    const wrap = document.getElementById("journal-entries");
    const scroller = document.getElementById("route-scroller");
    const wrapRect = wrap.getBoundingClientRect();
    // 容器横向滚动后，getBoundingClientRect 的 left 会移动，补回 scrollLeft 得到内容坐标
    const scrollX = scroller ? scroller.scrollLeft : 0;

    const pts = Array.from(stops).map((dot) => {
      const r = dot.getBoundingClientRect();
      return {
        x: r.left - wrapRect.left + scrollX + r.width / 2,
        y: r.top - wrapRect.top + r.height / 2,
      };
    });

    const y = pts[0].y;
    const x0 = Math.max(0, pts[0].x - 26);
    const x1 = pts[pts.length - 1].x + 26;
    const d = `M ${x0} ${y} L ${x1} ${y}`;
    const w = Math.max(wrap.scrollWidth, wrapRect.width);

    svg.setAttribute("viewBox", `0 0 ${w} ${wrapRect.height}`);
    svg.style.width = w + "px";
    svg.style.height = wrapRect.height + "px";
    svg.innerHTML = `
      <path d="${d}" class="route-ghost" />
      <path d="${d}" class="route-main" />
    `;
  }

  /* ---------- 轨道滚动控制（三份内容无缝循环） ---------- */
  function setupRouteControls() {
    const scroller = document.getElementById("route-scroller");
    const prev = document.getElementById("route-prev");
    const next = document.getElementById("route-next");
    if (!scroller || !prev || !next) return;

    let setWidth = 0;
    let ticking = false;

    function measure() {
      const stops = scroller.querySelector(".route-stops");
      if (!stops || stops.children.length < TRAVEL_ROUTE.length * 2) return;
      // 第二份的第一张卡片 = 一组完整卡片的宽度
      setWidth = stops.children[TRAVEL_ROUTE.length].offsetLeft - stops.offsetLeft;
      scroller.scrollLeft = setWidth; // 从中间一份开始，前后都能循环
    }
    function loop() {
      if (!setWidth) return;
      const x = scroller.scrollLeft;
      if (x >= setWidth * 2) scroller.scrollLeft = x - setWidth;
      else if (x < setWidth * 0.5) scroller.scrollLeft = x + setWidth;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => { loop(); ticking = false; });
    }
    function step(dir) {
      const card = scroller.querySelector(".route-stop");
      const gap = parseFloat(getComputedStyle(scroller.querySelector(".route-stops")).gap) || 20;
      const amount = card ? card.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
      scroller.scrollBy({ left: dir * amount, behavior: "smooth" });
    }

    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => setTimeout(measure, 200));
    window.addEventListener("load", () => setTimeout(measure, 120));
    measure();
    setTimeout(measure, 350);
  }

  /* ---------- 沉浸式相册（左右切换） ---------- */
  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "照片浏览");
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="关闭">✕</button>
      <button class="lightbox-nav lightbox-prev" aria-label="上一张">‹</button>
      <button class="lightbox-nav lightbox-next" aria-label="下一张">›</button>
      <div class="lightbox-inner">
        <img class="lb-img" alt="">
        <div class="lightbox-cap lb-cap"></div>
      </div>`;
    document.body.appendChild(lightbox);
    lbImg = lightbox.querySelector(".lb-img");
    lbCap = lightbox.querySelector(".lb-cap");
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  let currentIdx = 0;
  function showLightbox(idx) {
    const ph = photoIndex[idx];
    if (!ph || !ph.src) return;
    currentIdx = idx;
    lbImg.src = ph.src;
    lbImg.alt = `${ph.city}旅行照片`;
    const meta = [ph.date, ph.location].filter(Boolean).join(" · ");
    lbCap.innerHTML = `<span class="lb-city">${esc(ph.city)}</span>${meta ? esc(meta) + "<br>" : ""}${ph.caption ? esc(ph.caption) : ""}`;
  }
  function openLightbox(idx) {
    if (!photoIndex[idx] || !photoIndex[idx].src) return;
    lastFocused = document.activeElement;
    showLightbox(idx);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }
  function stepLightbox(dir) {
    let next = currentIdx + dir;
    while (next >= 0 && next < photoIndex.length && !photoIndex[next].src) next += dir;
    if (next < 0 || next >= photoIndex.length) return;
    showLightbox(next);
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.src = "";
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderJournal();
    buildLightbox();
    setupRouteControls();

    // 绑定 lightbox（照片点击）
    document.querySelectorAll(".wall-photo[data-idx]").forEach((cell) => {
      cell.addEventListener("click", () => {
        const idx = Number(cell.dataset.idx);
        if (photoIndex[idx] && photoIndex[idx].src) openLightbox(idx);
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const idx = Number(cell.dataset.idx);
          if (photoIndex[idx] && photoIndex[idx].src) openLightbox(idx);
        }
      });
    });

    if (window.__reobserve) window.__reobserve();

    // 画线（等布局稳定后）
    setTimeout(drawRouteLine, 350);
    window.addEventListener("load", drawRouteLine);
    window.addEventListener("resize", () => setTimeout(drawRouteLine, 200));
    setTimeout(drawRouteLine, 1500);
  });
})();
