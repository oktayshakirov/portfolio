/**
 * Render Module
 * Handles dynamic content rendering from JSON data
 */

/**
 * Generate project HTML from project data
 * @param {Object} project - Project data object
 * @returns {string} HTML string
 */
export const generateProjectHTML = (project) => {
  const { id, title, category, status, type, technologies, image, links } =
    project;

  const categoryString = category.join(" ");
  const hasLink =
    links?.preview || links?.ios || links?.android || links?.github;

  let buttonsHTML = "";
  if (links) {
    const buttonLinks = [];

    if (links.preview) {
      buttonLinks.push(`
        <a href="${links.preview}" aria-label="Preview ${title}" target="_blank" rel="noopener noreferrer">
          <ion-icon name="eye-outline"></ion-icon> Preview
        </a>
      `);
    }
    if (links.ios) {
      buttonLinks.push(`
        <a href="${links.ios}" aria-label="Download ${title} on iOS" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-apple"></ion-icon> iPhone
        </a>
      `);
    }
    if (links.android) {
      buttonLinks.push(`
        <a href="${links.android}" aria-label="Download ${title} on Android" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-android"></ion-icon> Android
        </a>
      `);
    }
    if (links.github) {
      buttonLinks.push(`
        <a href="${links.github}" aria-label="View ${title} on GitHub" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-github"></ion-icon> GitHub
        </a>
      `);
    }
    if (links.figma) {
      buttonLinks.push(`
        <a href="${links.figma}" aria-label="View ${title} design on Figma" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-figma"></ion-icon> Figma
        </a>
      `);
    }

    if (buttonLinks.length > 0) {
      buttonsHTML = `<div class="project-buttons">${buttonLinks.join(
        "",
      )}</div>`;
    }
  }

  const imageHTML = hasLink
    ? `<a href="${
        links.preview || links.ios || links.android || links.github || "#"
      }">
         <figure class="project-img loading">
           <img data-src="${image}" loading="lazy" alt="${title} project screenshot">
         </figure>
       </a>`
    : `<figure class="project-img loading">
         <img data-src="${image}" loading="lazy" alt="${title} project screenshot">
       </figure>`;

  return `
    <li class="project-item active" data-filter-item data-category="${categoryString}">
      ${imageHTML}
      <h3 class="project-title">${title}</h3>
      <p class="project-category">${status}</p>
      <p class="project-category">${type}</p>
      <p class="project-development">${technologies}</p>
      ${buttonsHTML}
    </li>
  `;
};

/**
 * Generate filter buttons HTML (desktop)
 * @param {Array<string>} categories - Array of category names
 * @returns {string} HTML string
 */
export const generateFilterButtonsHTML = (categories) => {
  return categories
    .map((category, index) => {
      const activeClass = index === 0 ? ' class="active"' : "";
      return `
      <li class="filter-item">
        <button${activeClass} data-filter-btn>${category}</button>
      </li>
    `;
    })
    .join("");
};

/**
 * Generate filter select items HTML (mobile)
 * @param {Array<string>} categories - Array of category names
 * @returns {string} HTML string
 */
export const generateFilterSelectHTML = (categories) => {
  return categories
    .map(
      (category) => `
    <li class="select-item">
      <button data-select-item>${category}</button>
    </li>
  `,
    )
    .join("");
};

/**
 * Generate technology HTML from technology data
 * @param {Object} tech - Technology data object
 * @returns {string} HTML string
 */
export const generateTechnologyHTML = (tech) => {
  return `
    <li class="technologies-item">
      <img src="${tech.image}" alt="${tech.alt}" id="${tech.id}">
    </li>
  `;
};

/**
 * Generate certificate HTML from certificate data
 * @param {Object} cert - Certificate data object
 * @returns {string} HTML string
 */
export const generateCertificateHTML = (cert) => {
  return `
    <li class="timeline-item">
      <h4 class="h4 timeline-item-title">${cert.title}</h4>
      <p class="timeline-text">${cert.issuer}</p>
      <div class="certificate-container">
        <img src="${cert.image}" alt="${cert.title} Certificate">
      </div>
    </li>
  `;
};

/**
 * Generate social link HTML from social data
 * @param {Object} social - Social data object
 * @param {string} className - CSS class for the link (default: "social-link")
 * @returns {string} HTML string
 */
export const generateSocialHTML = (social, className = "social-link") => {
  return `
    <li class="social-item">
      <a href="${social.url}" class="${className}" aria-label="Visit ${social.name}" target="_blank" rel="noopener noreferrer">
        <ion-icon name="${social.icon}"></ion-icon>
      </a>
    </li>
  `;
};

/**
 * Generate sidework HTML from sidework data
 * @param {Object} sidework - Sidework data object
 * @returns {string} HTML string
 */
export const generateSideworkHTML = (sidework) => {
  const { id, title, categories, description, image, alt, links } = sidework;

  let buttonsHTML = "";
  if (links) {
    const buttonLinks = [];

    if (links.website) {
      buttonLinks.push(`
        <a href="${links.website}" aria-label="Visit ${title}" target="_blank" rel="noopener noreferrer">
          <ion-icon name="globe-outline"></ion-icon> Website
        </a>
      `);
    }
    if (links.github) {
      buttonLinks.push(`
        <a href="${links.github}" aria-label="View ${title} on GitHub" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-github"></ion-icon> GitHub
        </a>
      `);
    }
    if (links.instagram) {
      buttonLinks.push(`
        <a href="${links.instagram}" aria-label="View ${title} on Instagram" target="_blank" rel="noopener noreferrer">
          <ion-icon name="camera-outline"></ion-icon> Instagram
        </a>
      `);
    }
    if (links.youtube) {
      buttonLinks.push(`
        <a href="${links.youtube}" aria-label="View ${title} on YouTube" target="_blank" rel="noopener noreferrer">
          <ion-icon name="videocam"></ion-icon> YouTube
        </a>
      `);
    }
    if (links.spotify) {
      buttonLinks.push(`
        <a href="${links.spotify}" aria-label="Listen to ${title} on Spotify" target="_blank" rel="noopener noreferrer">
          <ion-icon name="musical-notes"></ion-icon> Spotify
        </a>
      `);
    }
    if (links.adobeStock) {
      buttonLinks.push(`
        <a href="${links.adobeStock}" aria-label="View ${title} on Adobe Stock" target="_blank" rel="noopener noreferrer">
          <ion-icon name="image-outline"></ion-icon> Adobe Stock
        </a>
      `);
    }
    if (links.shutterstock) {
      buttonLinks.push(`
        <a href="${links.shutterstock}" aria-label="View ${title} on Shutterstock" target="_blank" rel="noopener noreferrer">
          <ion-icon name="images-outline"></ion-icon> Shutterstock
        </a>
      `);
    }

    if (buttonLinks.length > 0) {
      buttonsHTML = `<div class="project-buttons">${buttonLinks.join(
        "",
      )}</div>`;
    }
  }

  const categoriesHTML = categories
    .map((cat) => `<p class="blog-category">${cat}</p>`)
    .join('<span class="dot"></span>');

  return `
    <li class="blog-card">
      <figure class="blog-banner-box">
        <img src="${image}" alt="${alt}" loading="lazy">
      </figure>
      <div class="blog-content">
        <div class="blog-meta">
          ${categoriesHTML}
        </div>
        <h3 class="h3 blog-item-title">${title}</h3>
        <p class="blog-text">${description}</p>
      </div>
      ${buttonsHTML}
    </li>
  `;
};
