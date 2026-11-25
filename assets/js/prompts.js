// The /prompts pages: copy buttons, the expandable prompt box, the click-to-load
// video, and redirects from the old #id links to each prompt's own page.

import { initAnalytics } from "./modules/analytics.js";

initAnalytics();

// Old links pointed at /prompts/#<id>; every prompt has its own page now.
const list = document.querySelector("[data-aliases]");
if (list && location.hash) {
  const id = decodeURIComponent(location.hash.slice(1));
  let aliases = {};
  try { aliases = JSON.parse(list.dataset.aliases); } catch { /* none */ }
  const target = aliases[id] || (document.querySelector(`a[href="${CSS.escape(id)}/"]`) ? `${id}/` : null);
  if (target) location.replace(target);
}

function fallbackCopy(text) {
  const t = document.createElement("textarea");
  t.value = text;
  t.setAttribute("readonly", "");
  t.style.position = "fixed";
  t.style.opacity = "0";
  document.body.appendChild(t);
  t.select();
  try { document.execCommand("copy"); } catch { /* nothing else to try */ }
  document.body.removeChild(t);
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  const label = btn.textContent;
  btn.addEventListener("click", () => {
    const text = document.querySelector(btn.dataset.copy)?.textContent || "";
    const done = () => {
      btn.textContent = "Copied";
      btn.classList.add("is-done");
      setTimeout(() => { btn.textContent = label; btn.classList.remove("is-done"); }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });
});

document.querySelectorAll(".prompt-toggle").forEach((btn) => {
  const box = btn.closest(".prompt-card")?.querySelector(".prompt-box");
  if (!box) return;
  btn.addEventListener("click", () => {
    const open = box.classList.toggle("is-open");
    btn.textContent = open ? "Show less" : "Show all";
  });
});

// The YouTube player loads only when someone asks for it.
document.querySelectorAll(".yt-lite").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.id)}?autoplay=1&rel=0`;
    f.title = btn.getAttribute("aria-label") || "YouTube video";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    f.className = "yt-frame";
    btn.replaceWith(f);
  }, { once: true });
});
