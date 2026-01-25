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

  // Scroll to top when navigation occurs
  window.scrollTo({ top: 0, behavior: "smooth" });
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
