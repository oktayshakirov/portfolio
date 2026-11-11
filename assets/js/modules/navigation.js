/**
 * Navigation Module
 * All pages are stacked into one continuous scroll. The navbar follows the
 * page you are reading, clicking a navbar link scrolls to that page, and the
 * URL keeps a shareable hash (e.g. oktayshakirov.com/#resume opens the Resume
 * page directly). Back and forward move between the pages you clicked.
 */

const DEFAULT_SECTION = "about";

// A page counts as the one being read once its top passes this line
// (a share of the viewport height, measured from the top).
const ACTIVE_LINE = 0.35;

// A smooth scroll is done when the browser fires "scrollend". Browsers
// without that event (older Safari) count it as done once the page has
// stayed still this long.
const SCROLL_SETTLE_MS = 200;
// Never wait longer than this for a smooth scroll to finish
const SCROLL_MAX_MS = 3000;
const supportsScrollEnd = "onscrollend" in window;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let pages = [];
let navbar = null;
let navbarLinks = [];
let navbarStickyTop = NaN;
let activeSection = null;

// The page a navbar click (or shared link) scrolled to. While set, the
// navbar stays on it and the page is kept aligned when content above it
// grows (data loaded from JSON, images), until the visitor scrolls on their own.
let pinnedSection = null;
let pinnedScrollY = null;
let smoothScrolling = false;
let settleTimer = null;
let maxScrollTimer = null;
let frameRequested = false;

/**
 * Get the section a navigation link points to
 * @param {HTMLElement} link - Navigation link
 * @returns {string} Section identifier
 */
const getLinkTarget = (link) =>
  link.getAttribute("data-target-section") ||
  link.textContent.trim().toLowerCase();

/**
 * Find the page element for a section
 * @param {string} section - Section identifier
 * @returns {HTMLElement|undefined}
 */
const getPage = (section) => pages.find((page) => page.dataset.page === section);

/**
 * Read the section from the URL hash, falling back to the default section
 * @returns {string} Section identifier
 */
const getSectionFromHash = () => {
  const section = window.location.hash.slice(1).toLowerCase();
  return getPage(section) ? section : DEFAULT_SECTION;
};

/**
 * The About page keeps the clean root URL, other pages get a hash
 * @param {string} section - Section identifier
 * @returns {string} URL
 */
const getSectionUrl = (section) =>
  section === DEFAULT_SECTION
    ? window.location.pathname + window.location.search
    : `#${section}`;

/**
 * Highlight the navbar link of the page being read
 * @param {string} section - Section identifier
 */
const setActiveLink = (section) => {
  if (section === activeSection) return;
  activeSection = section;

  navbarLinks.forEach((link) => {
    const isActive = getLinkTarget(link) === section;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

/**
 * Keep the URL on the page being read, without adding history entries
 * @param {string} section - Section identifier
 */
const replaceUrl = (section) => {
  if (getSectionFromHash() === section) return;
  try {
    history.replaceState({ section }, "", getSectionUrl(section));
  } catch {
    // Safari throttles history updates; a stale hash is harmless
  }
};

/**
 * Where the window has to scroll to put a page at the top of the screen
 * (minus its scroll-margin-top, so it lines up with the sidebar)
 * @param {HTMLElement} page - Page element
 * @returns {number} Scroll position in pixels
 */
const getPageScrollY = (page) => {
  const margin = parseFloat(getComputedStyle(page).scrollMarginTop) || 0;
  const maxScrollY =
    document.documentElement.scrollHeight - window.innerHeight;
  const target = page.getBoundingClientRect().top + window.scrollY - margin;
  return Math.max(0, Math.min(Math.round(target), maxScrollY));
};

/**
 * Snap the pinned page back into place, e.g. after content above it loaded
 */
const alignPinnedPage = () => {
  if (!pinnedSection || smoothScrolling) return;
  const targetY = getPageScrollY(getPage(pinnedSection));
  pinnedScrollY = targetY;
  if (Math.abs(window.scrollY - targetY) > 1) {
    window.scrollTo({ top: targetY, behavior: "auto" });
  }
};

/**
 * Hand control back to the visitor: the navbar follows the scroll again
 */
const unpin = () => {
  if (!pinnedSection) return;
  pinnedSection = null;
  pinnedScrollY = null;
  stopSmoothScroll();
  requestUpdate();
};

/**
 * Forget about a smooth scroll in progress
 */
function stopSmoothScroll() {
  smoothScrolling = false;
  window.clearTimeout(settleTimer);
  window.clearTimeout(maxScrollTimer);
}

/**
 * A smooth scroll has finished: fix the position if content moved under it.
 * Only safe once it has really stopped, because Chrome adds an instant
 * scroll made during a smooth one on top of the smooth scroll's target.
 */
const settleSmoothScroll = () => {
  if (!smoothScrolling) return;
  stopSmoothScroll();
  alignPinnedPage();
};

/**
 * (Re)start the wait for a smooth scroll to finish
 */
const armSettleTimer = () => {
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(settleSmoothScroll, SCROLL_SETTLE_MS);
};

/**
 * Work out which page is being read and update the navbar and URL
 */
const updateFromScroll = () => {
  frameRequested = false;
  if (pages.length === 0) return;

  // On desktop the navbar sticks to the top; it is restyled once the pages
  // scroll under it. (The mobile navbar is fixed to the bottom instead.)
  if (navbar) {
    const stuck =
      !Number.isNaN(navbarStickyTop) &&
      pages[0].getBoundingClientRect().top < navbarStickyTop - 0.5;
    navbar.classList.toggle("is-stuck", stuck);
  }

  if (pinnedSection) return;

  const line = window.innerHeight * ACTIVE_LINE;
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  // The last page may be too short to reach the line, so it wins at the bottom
  let current = pages[0];
  if (atBottom && window.scrollY > 0) {
    current = pages[pages.length - 1];
  } else {
    for (const page of pages) {
      if (page.getBoundingClientRect().top > line) break;
      current = page;
    }
  }

  setActiveLink(current.dataset.page);
  replaceUrl(current.dataset.page);
};

/**
 * Run updateFromScroll at most once per frame
 */
function requestUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(updateFromScroll);
}

/**
 * Scroll to a page and keep the navbar on it while the scroll runs
 * @param {string} section - Section identifier
 * @param {boolean} smooth - Animate the scroll
 */
const goToSection = (section, smooth) => {
  const page = getPage(section);
  if (!page) return;

  pinnedSection = section;
  setActiveLink(section);

  const targetY = getPageScrollY(page);
  pinnedScrollY = targetY;
  const animate = smooth && !reduceMotion.matches;
  smoothScrolling = animate;
  window.scrollTo({ top: targetY, behavior: animate ? "smooth" : "auto" });

  // A scroll that is already in place fires no scroll events (and no
  // "scrollend"), so start the timer here. Scroll events then push it back,
  // or hand over to "scrollend" where the browser has it.
  if (animate) {
    armSettleTimer();
    window.clearTimeout(maxScrollTimer);
    maxScrollTimer = window.setTimeout(settleSmoothScroll, SCROLL_MAX_MS);
  }
};

/**
 * Initialize navigation functionality
 */
export const initNavigation = () => {
  pages = Array.from(document.querySelectorAll("[data-page]"));
  navbar = document.querySelector(".navbar");
  navbarLinks = Array.from(document.querySelectorAll(".navbar-link[data-nav-link]"));
  if (pages.length === 0) return;

  // We restore the page from the hash ourselves, after content has loaded
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const targetSection = getLinkTarget(link);
      if (!getPage(targetSection)) return;

      if (targetSection !== getSectionFromHash()) {
        history.pushState({ section: targetSection }, "", getSectionUrl(targetSection));
      }
      goToSection(targetSection, true);
    });
  });

  // Back and forward buttons, and hashes typed into the address bar
  window.addEventListener("popstate", () => {
    goToSection(getSectionFromHash(), true);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (pinnedSection) {
        if (smoothScrolling) {
          if (supportsScrollEnd) window.clearTimeout(settleTimer);
          else armSettleTimer();
        } else if (
          pinnedScrollY !== null &&
          Math.abs(window.scrollY - pinnedScrollY) > 2
        ) {
          // Moved without wheel, touch or keys (e.g. dragging the scrollbar)
          unpin();
        }
      }
      requestUpdate();
    },
    { passive: true }
  );

  if (supportsScrollEnd) {
    window.addEventListener("scrollend", settleSmoothScroll);
  }

  // The visitor taking over ends any pinned scroll right away
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) => {
    window.addEventListener(type, unpin, { passive: true });
  });

  const readNavbarStickyTop = () => {
    const style = navbar ? getComputedStyle(navbar) : null;
    navbarStickyTop =
      style && style.position === "sticky" ? parseFloat(style.top) : NaN;
  };
  readNavbarStickyTop();
  window.addEventListener(
    "resize",
    () => {
      readNavbarStickyTop();
      requestUpdate();
    },
    { passive: true }
  );

  // Pages fill in from JSON and lazy images after the first paint; keep a
  // pinned page in place while that happens instead of letting it drift.
  if ("ResizeObserver" in window) {
    const main = document.querySelector("main") || document.body;
    new ResizeObserver(() => {
      if (pinnedSection) alignPinnedPage();
      requestUpdate();
    }).observe(main);
  }

  // Open the page from a shared link
  if (window.location.hash) goToSection(getSectionFromHash(), false);
  requestUpdate();
};
