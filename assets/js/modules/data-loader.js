/**
 * Data Loader Module
 * Handles loading and rendering data from JSON files
 */

import {
  generateProjectHTML,
  generateTechnologyHTML,
  generateCertificateHTML,
  generateSideworkHTML,
  generateSocialHTML,
  generateFilterButtonsHTML,
  generateFilterSelectHTML,
} from "./render.js";

/**
 * Show loading skeleton
 * @param {HTMLElement} container - Container element
 * @param {string} type - Type of skeleton (projects, technologies, etc.)
 */
const showLoadingState = (container, type = "projects") => {
  const skeletons = {
    projects: Array(6)
      .fill(0)
      .map(
        () => `
      <li class="project-item skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </li>
    `
      )
      .join(""),
    technologies: Array(17)
      .fill(0)
      .map(
        () => `
      <li class="technologies-item skeleton">
        <div class="skeleton-image small"></div>
      </li>
    `
      )
      .join(""),
    sideworks: Array(4)
      .fill(0)
      .map(
        () => `
      <li class="blog-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      </li>
    `
      )
      .join(""),
  };

  container.innerHTML = skeletons[type] || skeletons.projects;
};

/**
 * Show error state
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 * @param {Function} retryFn - Retry function
 */
const showErrorState = (container, message = "Failed to load content", retryFn = null) => {
  container.innerHTML = `
    <div class="error-state">
      <ion-icon name="alert-circle-outline"></ion-icon>
      <p>${message}</p>
      ${retryFn ? '<button class="retry-button" aria-label="Retry loading" type="button">Retry</button>' : ''}
    </div>
  `;

  if (retryFn) {
    const retryButton = container.querySelector(".retry-button");
    if (retryButton) {
      retryButton.addEventListener("click", retryFn);
    }
  }
};

/**
 * Load and render filter categories
 */
export const loadFilters = async () => {
  const filterCategories = ["All", "Websites", "Applications", "Games", "Designs"];
  
  // Desktop filter buttons
  const filterList = document.querySelector(".filter-list");
  if (filterList) {
    filterList.innerHTML = generateFilterButtonsHTML(filterCategories);
  }
  
  // Mobile filter select
  const selectList = document.querySelector(".select-list");
  if (selectList) {
    selectList.innerHTML = generateFilterSelectHTML(filterCategories);
  }
  
  // Re-initialize project filter after rendering
  const { initProjectFilter } = await import("./projects.js");
  initProjectFilter();
};

/**
 * Load and render projects
 */
export const loadProjects = async () => {
  const container = document.querySelector(".project-list");
  if (!container) return;

  showLoadingState(container, "projects");

  try {
    const response = await fetch("./data/projects.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const projects = await response.json();
    container.innerHTML = projects.map(generateProjectHTML).join("");

    // Re-initialize lazy loading for new content
    const { initLazyLoading } = await import("./animations.js");
    initLazyLoading();
  } catch (error) {
    console.error("Error loading projects:", error);
    showErrorState(container, "Failed to load projects. Please refresh the page.", loadProjects);
  }
};

/**
 * Load and render technologies
 */
export const loadTechnologies = async () => {
  const container = document.querySelector(".technologies-list");
  if (!container) return;

  showLoadingState(container, "technologies");

  try {
    const response = await fetch("./data/technologies.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const technologies = await response.json();
    container.innerHTML = technologies.map(generateTechnologyHTML).join("");

    // Re-initialize technologies module
    const { initTechnologies } = await import("./technologies.js");
    initTechnologies();
    
    // Re-initialize tech scrolling after content is loaded
    const { initTechScrolling } = await import("./animations.js");
    // Wait a bit for DOM to update and images to load
    setTimeout(() => {
      initTechScrolling();
    }, 100);
  } catch (error) {
    console.error("Error loading technologies:", error);
    showErrorState(container, "Failed to load technologies.", loadTechnologies);
  }
};

/**
 * Load and render certificates
 */
export const loadCertificates = async () => {
  const container = document.querySelector(".certificates");
  if (!container) return;

  try {
    const response = await fetch("./data/certificates.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const certificateGroups = await response.json();

    let html = "";
    certificateGroups.forEach((group) => {
      html += `
        <section class="timeline">
          <div class="title-wrapper">
            <div class="icon-box">
              <ion-icon name="${group.icon}"></ion-icon>
            </div>
            <h3 class="h3">${group.group}</h3>
          </div>
          <ol class="timeline-list">
            ${group.items.map(generateCertificateHTML).join("")}
          </ol>
        </section>
      `;
    });

    // Find the certificates article and replace content
    const certificatesArticle = document.querySelector('[data-page="certificates"]');
    if (certificatesArticle) {
      const header = certificatesArticle.querySelector("header");
      const existingContent = certificatesArticle.querySelector(".timeline")?.parentElement;
      
      if (existingContent) {
        existingContent.innerHTML = html;
      } else {
        const contentDiv = document.createElement("div");
        contentDiv.innerHTML = html;
        certificatesArticle.insertBefore(contentDiv, certificatesArticle.querySelector(".pagination-box"));
      }
    }

    // Re-initialize certificates module
    const { initCertificates } = await import("./certificates.js");
    initCertificates();
  } catch (error) {
    console.error("Error loading certificates:", error);
  }
};

/**
 * Load and render sideworks
 */
export const loadSideworks = async () => {
  const container = document.querySelector(".blog-posts-list");
  if (!container) return;

  showLoadingState(container, "sideworks");

  try {
    const response = await fetch("./data/sideworks.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sideworks = await response.json();
    container.innerHTML = sideworks.map(generateSideworkHTML).join("");
  } catch (error) {
    console.error("Error loading sideworks:", error);
    showErrorState(container, "Failed to load side projects.", loadSideworks);
  }
};

/**
 * Load and render social links
 * @param {string} containerSelector - CSS selector for the container
 * @param {string} className - CSS class for the social links (default: "social-link")
 */
export const loadSocials = async (containerSelector, className = "social-link") => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    const response = await fetch("./data/socials.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const socials = await response.json();
    container.innerHTML = socials.map(social => generateSocialHTML(social, className)).join("");
  } catch (error) {
    console.error("Error loading socials:", error);
  }
};
