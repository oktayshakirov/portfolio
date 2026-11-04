/**
 * Main Entry Point
 * Initializes all modules when DOM is ready
 */

import { initSidebar } from "./modules/sidebar.js";
import { initNavigation } from "./modules/navigation.js";
import { initProgressBars, initMotionPause } from "./modules/animations.js";
import { initGitHubCalendar } from "./modules/github-calendar.js";
import { initEmailCopy, initCalendly } from "./modules/contact.js";
import { initHighlights } from "./modules/highlights.js";
import { initSEO } from "./modules/seo.js";
import { initAnalytics } from "./modules/analytics.js";
import { initAttribution } from "./modules/attribution.js";
import {
  loadProjects,
  loadTechnologies,
  loadExperience,
  loadCertificates,
  loadSideworks,
  loadSocials,
  loadFilters,
} from "./modules/data-loader.js";

/**
 * Hide the initial page preloader
 */
const PRELOADER_MAX_VISIBLE_MS = 1000;

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
 * Initialize all modules when DOM is ready
 */
const init = () => {
  // Core functionality
  initSidebar();
  initNavigation();
  
  // Render the project filter buttons and wire up filtering
  loadFilters();

  // Animations and effects
  initMotionPause();
  initProgressBars();

  // Load dynamic content from JSON. Each loader also sets up the behavior of
  // its content (filtering, tech scrolling, certificate links) once rendered.
  loadProjects().catch(console.error);
  loadTechnologies().catch(console.error);
  loadExperience().catch(console.error);
  loadCertificates().catch(console.error);
  loadSideworks().catch(console.error);
  
  // Load social links (sidebar and contact page)
  loadSocials(".sidebar .social-list", "social-link").catch(console.error);
  loadSocials('[data-page="contact"] .social-list', "social-link").catch(console.error);

  // Content modules
  initGitHubCalendar();
  initHighlights();

  // Contact and interactions
  initEmailCopy();
  initCalendly();

  // SEO enhancements
  initSEO();

  // Analytics (only loads on authorized domains)
  initAnalytics();

  // Attribution (only shows on unauthorized domains)
  initAttribution();
};

// Hide preloader as soon as the page has loaded.
window.addEventListener("load", hidePreloader);

// Never keep visitors waiting longer than this, even on slow connections.
window.setTimeout(hidePreloader, PRELOADER_MAX_VISIBLE_MS);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
