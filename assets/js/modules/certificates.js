/**
 * Certificates Module
 * Handles certificate image click events
 */

/**
 * Initialize certificate image click handlers
 */
export const initCertificates = () => {
  const certificateImages = document.querySelectorAll(
    ".certificate-container img"
  );

  certificateImages.forEach((img) => {
    img.addEventListener("click", () => {
      window.open(img.src, "_blank");
    });
    img.style.cursor = "pointer";
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", "Open certificate in new window");

    // Keyboard support
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.open(img.src, "_blank");
      }
    });
  });
};
