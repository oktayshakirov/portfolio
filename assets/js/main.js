/**
 * Main Entry Point
 * Initializes all modules when DOM is ready
 */

import { initSidebar } from "./modules/sidebar.js";
import { initNavigation } from "./modules/navigation.js";
import { initProjectFilter } from "./modules/projects.js";
import {
  initProgressBars,
  initLazyLoading,
  initTechScrolling,
  initAgeCounter,
} from "./modules/animations.js";
import { initGitHubCalendar } from "./modules/github-calendar.js";
import { initEmailCopy, initAboutTextToggle, initCalendly } from "./modules/contact.js";
import { initTechnologies } from "./modules/technologies.js";
import { initCertificates } from "./modules/certificates.js";
import { initSEO } from "./modules/seo.js";
import { initAnalytics } from "./modules/analytics.js";
import { initAttribution } from "./modules/attribution.js";
import {
  loadProjects,
  loadTechnologies,
  loadCertificates,
  loadSideworks,
  loadSocials,
  loadFilters,
} from "./modules/data-loader.js";

/**
 * Hide the initial page preloader
 */
const PRELOADER_MIN_VISIBLE_MS = 900;
const preloaderShownAt = performance.now();

const hidePreloader = () => {
  const preloader = document.getElementById("site-preloader");
  if (!preloader) return;

  preloader.classList.add("hidden");
  document.body.classList.remove("preloader-active");

  // Remove from DOM after fade-out to avoid unnecessary overlay node.
  window.setTimeout(() => {
    preloader.remove();
  }, 400);
};

/**
 * Ensure preloader remains visible long enough for at least one spin.
 */
const hidePreloaderWithMinimumDelay = () => {
  const elapsed = performance.now() - preloaderShownAt;
  const remaining = Math.max(0, PRELOADER_MIN_VISIBLE_MS - elapsed);
  window.setTimeout(hidePreloader, remaining);
};

/**
 * Initialize all modules when DOM is ready
 */
const init = () => {
  // Core functionality
  initSidebar();
  initNavigation();
  
  // Load filter categories first, then initialize filter functionality
  loadFilters().catch(console.error);

  // Animations and effects
  initProgressBars();
  initLazyLoading();
  // initTechScrolling() is called after technologies are loaded in loadTechnologies()
  initAgeCounter().catch(console.error);

  // Load dynamic content from JSON
  loadProjects().catch(console.error);
  loadTechnologies().catch(console.error);
  loadCertificates().catch(console.error);
  loadSideworks().catch(console.error);
  
  // Load social links (sidebar and contact page)
  loadSocials(".sidebar .social-list", "social-link").catch(console.error);
  loadSocials('[data-page="contact"] .social-list', "social-link").catch(console.error);

  // Content modules
  initTechnologies();
  initGitHubCalendar();
  initCertificates();

  // Contact and interactions
  initEmailCopy();
  initAboutTextToggle();
  initCalendly();

  // SEO enhancements
  initSEO();

  // Analytics (only loads on authorized domains)
  initAnalytics();

  // Attribution (only shows on unauthorized domains)
  initAttribution();

  // Handle image loading
  window.addEventListener("DOMContentLoaded", () => {
    const imageContainers = document.querySelectorAll(".project-img");
    imageContainers.forEach((container) => {
      const image = container.querySelector("img");
      if (image) {
        image.addEventListener("load", () => {
          container.classList.remove("loading");
        });
      }
    });
  });
};

// Hide preloader when all critical page resources are loaded.
window.addEventListener("load", hidePreloaderWithMinimumDelay);

// Fallback in case load is delayed by third-party resources.
window.setTimeout(hidePreloaderWithMinimumDelay, 2500);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
