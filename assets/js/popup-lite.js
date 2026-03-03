// popups-data-rich.js – rich popup system with title bar, metadata line, and embedded media
(() => {
  'use strict';

  const CONFIG = {
    delay: 750,
    fadeDelay: 150,
    fadeDuration: 250,
    breathingX: 12,
    breathingY: 8,
    zIndex: 10000,
    titleBarHeight: 28,
    imageMaxWidth: 240,
    imageMaxHeight: 160,
  };

  let container = null;
  let activePopup = null;
  let timers = new Map();

  function setup() {
    if (container) return;
    container = document.createElement('div');
    container.id = 'popup-container';
    container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: ${CONFIG.zIndex};
    `;
    document.body.appendChild(container);
  }

  function buildPopupHTML(target) {
    const title = target.dataset.popupTitle || "Untitled";
    const author = target.dataset.popupAuthor || "";
    const date = target.dataset.popupDate || "";
    const tags = target.dataset.popupTags || "";
    const abstract = target.dataset.popupAbstract || "";
    const image = target.dataset.popupImage || "";
    const backlinks = target.dataset.popupBacklinks || "";
    const similar = target.dataset.popupSimilar || "";
    const bibliography = target.dataset.popupBibliography || "";

    // Build metadata line
    let metaLine = `<strong>${title}</strong>`;
    if (author || date) {
      metaLine += `<br><span class="meta-author">${author} © ${date}</span>`;
    }
    if (tags) {
      const tagList = tags.split(',').map(t => `<a href="/tags/${t.trim()}">${t.trim()}</a>`).join(', ');
      metaLine += ` (${tagList})`;
    }
    if (backlinks || similar || bibliography) {
      metaLine += `<br>`;
      if (backlinks) metaLine += `<a href="${backlinks}" class="meta-link">backlinks ↕</a>; `;
      if (similar) metaLine += `<a href="${similar}" class="meta-link">similar ≈</a>; `;
      if (bibliography) metaLine += `<a href="${bibliography}" class="meta-link">bibliography ≡</a>`;
    }

    // Build content with optional image on right
    let content = '';
    if (image) {
      content = `
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="flex: 1;">${abstract}</div>
          <img src="${image}" alt="Preview" style="max-width: ${CONFIG.imageMaxWidth}px; max-height: ${CONFIG.imageMaxHeight}px; border: 1px solid #ddd; border-radius: 4px;" />
        </div>
      `;
    } else {
      content = `<div>${abstract}</div>`;
    }

    // Title bar with close button
    const titleBar = `
      <div class="popup-title-bar">
        <span class="popup-title">${title}</span>
        <button class="popup-close" onclick="Popups.despawnActivePopup()">×</button>
      </div>
    `;

    return `${titleBar}<div class="popup-content">${metaLine}<br><br>${content}</div>`;
  }

  function spawnPopup(target, x, y) {
    despawnPopup();
    activePopup = document.createElement('div');
    activePopup.className = 'popup';
    activePopup.style.cssText = `
      position: fixed; pointer-events: auto;
      background: white; border: 1px solid #ddd; border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 12px;
      max-width: 600px; font-size: 0.95em; opacity: 0;
      transition: opacity ${CONFIG.fadeDuration}ms;
      z-index: ${CONFIG.zIndex + 1};
      display: flex; flex-direction: column;
    `;
    activePopup.innerHTML = buildPopupHTML(target);
    container.appendChild(activePopup);

    // Position
    const rect = activePopup.getBoundingClientRect();
    let left = x + CONFIG.breathingX;
    let top = y - rect.height - CONFIG.breathingY;

    // Clamp to viewport
    if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 10;
    if (top < 0) top = y + CONFIG.breathingY;

    activePopup.style.left = `${Math.max(0, left)}px`;
    activePopup.style.top = `${Math.max(0, top)}px`;

    // Fade in
    setTimeout(() => { activePopup.style.opacity = '1'; }, 0);
  }

  function despawnPopup() {
    if (!activePopup) return;
    activePopup.style.opacity = '0';
    setTimeout(() => {
      if (activePopup.parentNode) activePopup.remove();
      activePopup = null;
    }, CONFIG.fadeDuration);
  }

  // Global function for closing popup from title bar
  window.Popups = {
    despawnActivePopup: () => {
      despawnPopup();
    }
  };

  function onMouseEnter(e) {
    const t = e.currentTarget;
    clearTimers(t);
    const timer = setTimeout(() => {
      despawnPopup();
      spawnPopup(t, e.clientX, e.clientY);
    }, CONFIG.delay);
    timers.set(t, timer);
  }

  function onMouseLeave(e) {
    const t = e.currentTarget;
    clearTimers(t);
    setTimeout(despawnPopup, CONFIG.fadeDelay);
  }

  function clearTimers(target) {
    const t = timers.get(target) || {};
    clearTimeout(t.spawn);
    clearTimeout(t.fade);
    clearTimeout(t.despawn);
    timers.delete(target);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setup();
      document.querySelectorAll('a[data-popup-title]').forEach(link => {
        link.addEventListener('mouseenter', onMouseEnter);
        link.addEventListener('mouseleave', onMouseLeave);
      });
    });
  } else {
    setup();
    document.querySelectorAll('a[data-popup-title]').forEach(link => {
      link.addEventListener('mouseenter', onMouseEnter);
      link.addEventListener('mouseleave', onMouseLeave);
    });
  }
})();