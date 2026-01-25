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
 * Initialize Calendly link
 */
export const initCalendly = () => {
  const calendlyLink = document.getElementById("calendly-link");
  if (!calendlyLink) return;

  calendlyLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof Calendly !== "undefined") {
      Calendly.initPopupWidget({
        url: "https://calendly.com/oktayshakirov/30min?hide_landing_page_details=1&hide_gdpr_banner=1"
      });
    }
  });
};
