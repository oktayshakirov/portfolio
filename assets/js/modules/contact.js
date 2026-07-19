/**
 * Contact Module
 * Handles contact form and email copying
 */

import { copyToClipboard } from "./utils.js";

/**
 * Initialize email copy functionality
 */
export const initEmailCopy = () => {
  const copyButton = document.querySelector(".copy-button");
  const emailText = document.querySelector(".email-text");

  if (!copyButton || !emailText) {
    console.warn("Email copy elements not found");
    return;
  }

  copyButton.addEventListener("click", async (e) => {
    const email = emailText.textContent.trim();
    const success = await copyToClipboard(email);

    if (success) {
      const originalText = e.target.textContent;
      e.target.textContent = "Copied!";
      e.target.style.color = "#4ade80"; // Green color

      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.style.color = "";
      }, 2000);
    } else {
      e.target.textContent = "Failed";
      setTimeout(() => {
        e.target.textContent = "Copy";
      }, 2000);
    }
  });
};

/**
 * Initialize about text toggle
 */
export const initAboutTextToggle = () => {
  const toggleButton = document.getElementById("toggle-button");
  const moreText = document.getElementById("more");

  if (!toggleButton || !moreText) return;

  toggleButton.addEventListener("click", () => {
    const isHidden = moreText.style.display === "none" || !moreText.style.display;

    if (isHidden) {
      moreText.style.display = "block";
      toggleButton.innerHTML = "&uarr; &nbsp; &nbsp; Hide text &nbsp; &nbsp; &uarr;";
      toggleButton.setAttribute("aria-expanded", "true");
    } else {
      moreText.style.display = "none";
      toggleButton.innerHTML = "&darr; &nbsp; &nbsp; Show more &nbsp; &nbsp; &darr;";
      toggleButton.setAttribute("aria-expanded", "false");
    }
  });
};

/**
 * Load the Calendly widget assets on demand (first click) instead of on page load
 * @returns {Promise<void>}
 */
let calendlyLoader = null;
const loadCalendlyAssets = () => {
  if (calendlyLoader) return calendlyLoader;

  calendlyLoader = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return calendlyLoader;
};

/**
 * Initialize Calendly link
 */
export const initCalendly = () => {
  const calendlyLink = document.getElementById("calendly-link");
  if (!calendlyLink) return;

  calendlyLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await loadCalendlyAssets();
      if (typeof Calendly !== "undefined") {
        Calendly.initPopupWidget({
          url: "https://calendly.com/oktayshakirov/30min?hide_landing_page_details=1&hide_gdpr_banner=1"
        });
      }
    } catch (error) {
      console.error("Failed to load Calendly widget:", error);
    }
  });
};
