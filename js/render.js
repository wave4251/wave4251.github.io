/* ============================================
   渲染逻辑 V6 — 设计年鉴式作品 + 实践折叠
   依赖 data/projects.js、data/practice.js
   作品封面用柔和雾面色块 + orb 球体，点击跳真实链接。
   ============================================ */

(function () {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  // 空值不显示"待补充"，直接省略
  const text = (v) => (v && String(v).trim() ? esc(v) : "");

  /* ---------- WORKS：设计年鉴式展览 ---------- */
  function renderGallery() {
    const wrap = document.getElementById("gallery");
    if (!wrap || typeof PROJECTS === "undefined") return;

    wrap.innerHTML = PROJECTS.map((p, i) => {
      const cover = p.cover
        ? `<img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.name)}" loading="lazy">`
        : `<div class="cover-orb"></div>`;
      return `
      <article class="work-entry reveal">
        <a class="work-cover" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.name)}（新窗口打开）">
          <div class="cover-art c${(i % 3) + 1}">
            ${cover}
            <span class="cover-no">${esc(p.no)}</span>
            <span class="grain"></span>
          </div>
          <div class="cover-note">${esc(p.coverNote || "推门进去看看")}</div>
        </a>
        <div class="work-info">
          <span class="work-meta">${esc(p.no)} · ${esc(p.tagline)}</span>
          <h3 class="work-title">${esc(p.name)}</h3>
          <p class="work-desc">${esc(p.note)}</p>
          <div class="work-goto">
            <a class="btn-pill" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">${esc(p.linkLabel)} ↗</a>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- PRACTICE：折叠 ---------- */
  function renderPractice() {
    const wrap = document.getElementById("practice-list");
    if (!wrap || typeof PRACTICES === "undefined") return;

    wrap.innerHTML = PRACTICES.map((pr) => {
      const rules = (pr.rules || []).map((r) => `<span class="practice-rule-tag">${esc(r)}</span>`).join("");
      const deliverable = pr.deliverable
        ? `<a class="btn-pill" href="${esc(pr.deliverable)}" target="_blank" rel="noopener noreferrer">${esc(pr.deliverableLabel)} ↗</a>`
        : "";

      const rows = [
        ["任务是什么", pr.task],
        ["我具体负责", pr.myWork],
        ["AI 如何参与", pr.aiRole],
        ["判断与验证", pr.judgment],
        ["回头看改进", pr.review],
      ]
        .filter(([, v]) => text(v))
        .map(([label, v]) => `<div class="practice-row"><dt>${label}</dt><dd>${text(v)}</dd></div>`)
        .join("");

      return `
      <div class="practice-item reveal" id="practice-${esc(pr.id)}">
        <button class="practice-head" aria-expanded="false" aria-controls="pb-${esc(pr.id)}">
          <span class="practice-order">${esc(pr.order)}</span>
          ${pr.emoji ? `<span class="practice-emoji">${esc(pr.emoji)}</span>` : ""}
          <span class="practice-head-text">
            <span class="practice-title">${esc(pr.title)}</span>
            <span class="practice-subtitle" style="display:block">${esc(pr.subtitle)}</span>
          </span>
          <svg class="practice-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="practice-body" id="pb-${esc(pr.id)}" role="region">
          <div class="practice-body-inner">
            <dl class="practice-rows">${rows}</dl>
            ${rules ? `<div class="practice-rules">${rules}</div>` : ""}
            ${deliverable ? `<div class="practice-deliverable">${deliverable}</div>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");

    wrap.querySelectorAll(".practice-head").forEach((head) => {
      head.addEventListener("click", () => {
        const item = head.closest(".practice-item");
        const open = item.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderGallery();
    renderPractice();
    if (window.__reobserve) window.__reobserve();
  });
})();
