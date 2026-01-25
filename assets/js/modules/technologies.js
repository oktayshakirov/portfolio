/**
 * Technologies Module
 * Handles technology icons and titles
 */

/**
 * Initialize technology item titles from alt text
 */
export const initTechnologies = () => {
  const items = document.querySelectorAll(".technologies-item");

  items.forEach((item) => {
    const image = item.querySelector("img");
    if (!image) return;

    const titleText = image.alt;
    const existingTitle = item.querySelector(".image-title");

    // Only add title if it doesn't exist
    if (!existingTitle && titleText) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "image-title";
      titleDiv.textContent = titleText;
      item.appendChild(titleDiv);
    }
  });
};
