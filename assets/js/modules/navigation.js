/**
 * Navigation Module
 * Handles page navigation and active state management
 */

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
    const linkTarget =
      link.getAttribute("data-target-section") ||
      link.textContent.trim().toLowerCase();
    link.classList.toggle("active", linkTarget === targetSection);
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
      const targetSection =
        link.getAttribute("data-target-section") ||
        link.textContent.trim().toLowerCase();
      updateActiveState(targetSection);
    });
  });
};
