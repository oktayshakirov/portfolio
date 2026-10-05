/**
 * Navigation Module
 * Handles page navigation, active state management and shareable URLs
 * (e.g. oktayshakirov.com/#resume opens the Resume page directly)
 */

const DEFAULT_SECTION = "about";

/**
 * Get the section a navigation link points to
 * @param {HTMLElement} link - Navigation link
 * @returns {string} Section identifier
 */
const getLinkTarget = (link) =>
  link.getAttribute("data-target-section") ||
  link.textContent.trim().toLowerCase();

/**
 * Check whether a section with this identifier exists
 * @param {string} section - Section identifier
 * @returns {boolean}
 */
const isSection = (section) =>
  Boolean(section) && Boolean(document.querySelector(`[data-page="${section}"]`));

/**
 * Read the section from the URL hash, falling back to the default section
 * @returns {string} Section identifier
 */
const getSectionFromHash = () => {
  const section = window.location.hash.slice(1).toLowerCase();
  return isSection(section) ? section : DEFAULT_SECTION;
};

/**
 * Update active states for pages and navigation links
 * @param {string} targetSection - Target section identifier
 */
const updateActiveState = (targetSection) => {
  const pages = document.querySelectorAll("[data-page]");
  const navigationLinks = document.querySelectorAll("[data-nav-link]");

  // Update page visibility
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === targetSection);
  });

  // Update navigation link states
  navigationLinks.forEach((link) => {
    const isActive = getLinkTarget(link) === targetSection;
    link.classList.toggle("active", isActive);
    if (link.classList.contains("navbar-link")) {
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  });

  // Scroll to top instantly on page switch. A smooth scroll here runs while
  // the article swap changes the document height, which makes in-app browsers
  // (Instagram/Facebook WKWebView) mispaint the fixed bottom navbar mid-screen.
  window.scrollTo(0, 0);
};

/**
 * Initialize navigation functionality
 */
export const initNavigation = () => {
  const navigationLinks = document.querySelectorAll("[data-nav-link]");

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetSection = getLinkTarget(link);
      if (targetSection === getSectionFromHash()) {
        updateActiveState(targetSection);
        return;
      }

      // The About page keeps the clean root URL, other pages get a hash
      const url =
        targetSection === DEFAULT_SECTION
          ? window.location.pathname + window.location.search
          : `#${targetSection}`;
      history.pushState({ section: targetSection }, "", url);
      updateActiveState(targetSection);
    });
  });

  // Back and forward buttons, and hashes typed into the address bar
  window.addEventListener("popstate", () => {
    updateActiveState(getSectionFromHash());
  });

  // Open the page from a shared link
  if (window.location.hash) {
    updateActiveState(getSectionFromHash());
  }
};
