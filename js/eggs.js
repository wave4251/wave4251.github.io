/* ============================================
   彩蛋逻辑 — PRACTICE 做事锦囊抽签 / CONTACT 相逢盖章
   计数写入 localStorage，尊重用户，不上传任何数据。
   ============================================ */

(function () {
  "use strict";

  // 提炼自《与我同行 · 怎样一起做事》，语气温柔、意识流
  const FORTUNES = [
    "方向可以慢慢长出来，但开始前，想先看清它的轮廓。",
    "给我一片能自由生长的空间，也请替我画好边界。",
    "背景、受众、参照和时间，是我走进一件事的门口。",
    "先对齐方向，再拆成一小步一小步；中途停一停，最后一起收尾。",
    "有不同的声音是好事。把理由说出来，我们就更容易听见彼此。",
    "方向若要变，早一点告诉我——比临近交付时推翻，要温柔得多。",
    "请具体地说哪里需要调整，也告诉我，哪些必须改、哪些可以慢慢磨。",
    "卡住的时候，把问题缩小一点，给我一个可以参照的样例就好。",
    "不必等到完全想清楚才开始。答案常常，是在路上才慢慢出现的。",
  ];

  const LEVELS = [
    { min: 0, label: "初来乍到" },
    { min: 1, label: "有缘一面" },
    { min: 5, label: "常常惦记" },
    { min: 12, label: "老朋友了" },
    { min: 30, label: "莫逆之交" },
  ];

  function safeGet(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v === null ? fallback : parseInt(v, 10) || fallback;
    } catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, String(value)); } catch (e) { /* 隐私模式忽略 */ }
  }

  /* ---------- 做事锦囊抽签 ---------- */
  const fortuneBtn = document.getElementById("fortune-btn");
  const fortuneCard = document.getElementById("fortune-card");
  const fortuneText = document.getElementById("fortune-text");
  const fortuneCount = document.getElementById("fortune-count");
  if (fortuneBtn && fortuneCard && fortuneText) {
    let count = safeGet("wc_fortune_count", 0);
    let last = -1;
    const renderCount = () => {
      if (fortuneCount) fortuneCount.textContent = `这台设备上，你已抽 ${count} 次`;
    };
    renderCount();
    fortuneBtn.addEventListener("click", () => {
      let idx = Math.floor(Math.random() * FORTUNES.length);
      if (idx === last) idx = (idx + 1 + Math.floor(Math.random() * (FORTUNES.length - 1))) % FORTUNES.length;
      last = idx;
      fortuneText.textContent = FORTUNES[idx];
      fortuneCard.classList.remove("flip");
      void fortuneCard.offsetWidth; // 触发重排以重播动画
      fortuneCard.classList.add("flip");
      count += 1;
      safeSet("wc_fortune_count", count);
      renderCount();
    });
  }

  /* ---------- 相逢盖章 ---------- */
  const sealBtn = document.getElementById("stamp-seal-btn");
  const stampCountEl = document.getElementById("stamp-count");
  const stampLevelEl = document.getElementById("stamp-level");
  const stampNote = document.getElementById("stamp-note");
  const plane = document.querySelector(".contact-plane");
  if (sealBtn && stampCountEl) {
    let count = safeGet("wc_stamp_count", 0);
    const levelOf = (n) => {
      let label = LEVELS[0].label;
      for (const lv of LEVELS) if (n >= lv.min) label = lv.label;
      return label;
    };
    const render = () => {
      stampCountEl.textContent = count;
      if (stampLevelEl) stampLevelEl.textContent = levelOf(count);
    };
    render();
    sealBtn.addEventListener("click", () => {
      count += 1;
      safeSet("wc_stamp_count", count);
      render();
      sealBtn.classList.remove("stamped");
      void sealBtn.offsetWidth;
      sealBtn.classList.add("stamped");
      if (stampNote) {
        if (count === 1) stampNote.textContent = "第一枚章。谢谢你翻到了这里。";
        else if (count === 5) stampNote.textContent = "第五枚了——你来得真勤。";
        else if (count === 12) stampNote.textContent = "十二枚。我们算是老朋友了。";
        else if (count >= 30) stampNote.textContent = "三十枚以上。真的很高兴你还在。";
        else stampNote.textContent = "又盖一枚，记下这次相逢。";
      }
      if (plane) {
        plane.classList.remove("fly");
        void plane.offsetWidth;
        plane.classList.add("fly");
      }
    });
  }
})();
