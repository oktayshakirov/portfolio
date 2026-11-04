/**
 * Data Loader Module
 * Handles loading and rendering data from JSON files
 */

import {
  generateProjectHTML,
  generateCurrentlyBuildingHTML,
  generateTechnologyHTML,
  generateCertificateHTML,
  generateExperienceHTML,
  generateTimelineGroupHTML,
  generateSideworkHTML,
  generateSideworkColumnsHTML,
  generateSocialHTML,
  generateFilterButtonsHTML,
  generateFilterSelectHTML,
} from "./render.js";
import { updateProjectHighlights } from "./highlights.js";
import { initProjectFilter } from "./projects.js";
import { initTechnologies } from "./technologies.js";
import { initTechScrolling } from "./animations.js";
import { initCertificates } from "./certificates.js";

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
    `,
      )
      .join(""),
    technologies: Array(20)
      .fill(0)
      .map(
        () => `
      <li class="technologies-item skeleton">
        <div class="skeleton-image small"></div>
      </li>
    `,
      )
      .join(""),
    sideworks: Array(4)
      .fill(0)
      .map(
        () => `
      <li class="sidework-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      </li>
    `,
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
const showErrorState = (
  container,
  message = "Failed to load content",
  retryFn = null,
) => {
  container.innerHTML = `
    <div class="error-state">
      <ion-icon name="alert-circle-outline"></ion-icon>
      <p>${message}</p>
      ${retryFn ? '<button class="retry-button" aria-label="Retry loading" type="button">Retry</button>' : ""}
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
 * Render filter categories and initialize filtering
 */
export const loadFilters = () => {
  const filterCategories = [
    "All",
    "AI",
    "Websites",
    "Applications",
    "Games",
    "Designs",
  ];

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

  initProjectFilter();
};

/**
 * Hide the loading bar of a project image once it has loaded (or failed to)
 * @param {Event} event - load or error event
 */
const handleProjectImageLoad = (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.closest(".project-img")?.classList.remove("loading");
};

/**
 * Load and render projects
 */
export const loadProjects = async () => {
  const container = document.querySelector(".project-list");
  if (!container) return;

  showLoadingState(container, "projects");

  // Image load events don't bubble, so listen in the capture phase. The
  // browser lazy-loads the images itself (loading="lazy"). Adding the same
  // listener again on a retry is a no-op.
  container.addEventListener("load", handleProjectImageLoad, true);
  container.addEventListener("error", handleProjectImageLoad, true);

  try {
    const response = await fetch("./data/projects.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const projects = await response.json();

    // Projects in development get the "Currently Building" card instead of a grid slot
    const buildingContainer = document.querySelector(".currently-building");
    if (buildingContainer) {
      buildingContainer.innerHTML = projects
        .filter((project) => project.currentlyBuilding)
        .map(generateCurrentlyBuildingHTML)
        .join("");
    }

    container.innerHTML = projects
      .filter((project) => !project.currentlyBuilding)
      .map(generateProjectHTML)
      .join("");
    updateProjectHighlights(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
    showErrorState(
      container,
      "Failed to load projects. Please refresh the page.",
      loadProjects,
    );
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

    initTechnologies();
    initTechScrolling();
  } catch (error) {
    console.error("Error loading technologies:", error);
    showErrorState(container, "Failed to load technologies.", loadTechnologies);
  }
};

/**
 * Load and render experience and education
 */
export const loadExperience = async () => {
  const container = document.querySelector(".experience-list");
  if (!container) return;

  try {
    const response = await fetch("./data/experience.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const experienceGroups = await response.json();
    container.innerHTML = experienceGroups
      .map((group) => generateTimelineGroupHTML(group, generateExperienceHTML))
      .join("");
  } catch (error) {
    console.error("Error loading experience:", error);
  }
};

/**
 * Load and render certificates
 */
export const loadCertificates = async () => {
  const container = document.querySelector(".certificates-list");
  if (!container) return;

  try {
    const response = await fetch("./data/certificates.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const certificateGroups = await response.json();
    container.innerHTML = certificateGroups
      .map((group) => generateTimelineGroupHTML(group, generateCertificateHTML))
      .join("");

    initCertificates();
  } catch (error) {
    console.error("Error loading certificates:", error);
  }
};

// Matches the breakpoint where .sidework-posts-list switches to two columns
const sideworkColumnsQuery = window.matchMedia("(min-width: 768px)");

/**
 * Render sideworks as a single list on mobile, or as two masonry columns
 * @param {HTMLElement} container - Container element
 * @param {Array<Object>} sideworks - Sidework data objects
 */
const renderSideworks = (container, sideworks) => {
  container.innerHTML = sideworkColumnsQuery.matches
    ? generateSideworkColumnsHTML(sideworks, 2)
    : sideworks.map(generateSideworkHTML).join("");
};

/**
 * Load and render sideworks
 */
export const loadSideworks = async () => {
  const container = document.querySelector(".sidework-posts-list");
  if (!container) return;

  showLoadingState(container, "sideworks");

  try {
    const response = await fetch("./data/sideworks.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sideworks = await response.json();
    renderSideworks(container, sideworks);
    sideworkColumnsQuery.addEventListener("change", () =>
      renderSideworks(container, sideworks),
    );
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
export const loadSocials = async (
  containerSelector,
  className = "social-link",
) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    const response = await fetch("./data/socials.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const socials = await response.json();
    container.innerHTML = socials
      .map((social) => generateSocialHTML(social, className))
      .join("");
  } catch (error) {
    console.error("Error loading socials:", error);
  }
};
