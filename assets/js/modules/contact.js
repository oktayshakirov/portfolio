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
 * Calendly booking modal
 *
 * We embed Calendly's booking page as a plain iframe inside our own modal
 * instead of using Calendly's popup widget (widget.js / widget.css). Their
 * popup CSS gives the dialog a 900px min-width, which on phones made the
 * whole page zoom out to desktop width with a lot of empty space. Owning the
 * modal keeps the layout under our control and skips the third-party
 * script entirely.
 */
const CALENDLY_URL = "https://calendly.com/oktayshakirov/30min";

const buildCalendlySrc = () => {
  const params = new URLSearchParams({
    embed_domain: window.location.hostname || "oktayshakirov.com",
    embed_type: "Inline",
    hide_landing_page_details: "1",
    hide_gdpr_banner: "1",
    // Dark colors matching the site. Calendly only applies these on paid
    // plans; on the free plan they are ignored and the page stays white.
    background_color: "1e1e1f",
    text_color: "fafafa",
    primary_color: "ffdb70",
  });
  return `${CALENDLY_URL}?${params.toString()}`;
};

let calendlyModal = null;
let calendlyLastFocus = null;
let calendlyBooked = false;

const createCalendlyModal = () => {
  const modal = document.createElement("div");
  modal.className = "calendly-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Book a video call");
  modal.innerHTML = `
    <div class="calendly-modal__backdrop" data-calendly-close></div>
    <button class="calendly-modal__close" type="button" data-calendly-close aria-label="Close booking window">
      <ion-icon name="close" aria-hidden="true"></ion-icon>
    </button>
    <div class="calendly-modal__panel">
      <div class="calendly-modal__spinner" aria-hidden="true"></div>
    </div>
  `;

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-calendly-close]")) closeCalendlyModal();
  });

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCalendlyModal();
  });

  document.body.appendChild(modal);
  return modal;
};

const ensureCalendlyFrame = (modal) => {
  const panel = modal.querySelector(".calendly-modal__panel");
  if (panel.querySelector("iframe")) return;

  const frame = document.createElement("iframe");
  frame.src = buildCalendlySrc();
  frame.title = "Book a video call with Oktay Shakirov";
  frame.setAttribute("frameborder", "0");
  // Calendly shows its own loader at the top of the frame while the booking
  // page boots. The frame stays hidden behind our centered spinner until
  // Calendly posts that the page is ready (see initCalendly); this timeout
  // is a fallback in case that message never arrives.
  frame.addEventListener(
    "load",
    () => window.setTimeout(() => panel.classList.add("is-loaded"), 4000),
    { once: true }
  );
  panel.appendChild(frame);
};

const openCalendlyModal = () => {
  if (!calendlyModal) calendlyModal = createCalendlyModal();

  calendlyLastFocus = document.activeElement;
  ensureCalendlyFrame(calendlyModal);
  calendlyModal.hidden = false;
  document.documentElement.classList.add("calendly-modal-open");
  calendlyModal.querySelector(".calendly-modal__close").focus();
};

const closeCalendlyModal = () => {
  if (!calendlyModal || calendlyModal.hidden) return;

  calendlyModal.hidden = true;
  document.documentElement.classList.remove("calendly-modal-open");

  // Keep the iframe between opens so an accidental close doesn't lose
  // progress, but start fresh once a booking has been made.
  if (calendlyBooked) {
    const panel = calendlyModal.querySelector(".calendly-modal__panel");
    panel.querySelector("iframe")?.remove();
    panel.classList.remove("is-loaded");
    calendlyBooked = false;
  }

  if (calendlyLastFocus && typeof calendlyLastFocus.focus === "function") {
    calendlyLastFocus.focus();
  }
};

/**
 * Initialize Calendly links (every element with data-calendly-link)
 */
export const initCalendly = () => {
  const calendlyLinks = document.querySelectorAll("[data-calendly-link]");

  calendlyLinks.forEach((calendlyLink) => {
    calendlyLink.addEventListener("click", (e) => {
      e.preventDefault();
      openCalendlyModal();
    });
  });

  window.addEventListener("message", (e) => {
    if (e.origin !== "https://calendly.com") return;
    const event = e.data && e.data.event;
    if (event === "calendly.event_type_viewed" || event === "calendly.page_height") {
      calendlyModal?.querySelector(".calendly-modal__panel").classList.add("is-loaded");
    }
    if (event === "calendly.event_scheduled") {
      calendlyBooked = true;
    }
  });
};
