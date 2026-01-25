/**
 * Projects Module
 * Handles project filtering and rendering
 */

/**
 * Filter projects based on selected category
 * @param {string} selectedValue - Selected filter value
 */
const filterProjects = (selectedValue) => {
  const filterItems = document.querySelectorAll("[data-filter-item]");

  filterItems.forEach((item) => {
    const categories = item.dataset.category?.split(" ") || [];
    if (selectedValue === "all" || categories.includes(selectedValue)) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

/**
 * Initialize project filtering
 */
export const initProjectFilter = () => {
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtns = document.querySelectorAll("[data-filter-btn]");

  if (!select || !selectValue) {
    console.warn("Project filter elements not found");
    return;
  }

  // Mobile select dropdown
  if (select) {
    select.addEventListener("click", () => {
      select.classList.toggle("active");
    });

    selectItems.forEach((item) => {
      item.addEventListener("click", () => {
        const selectedValue = item.textContent.trim().toLowerCase();
        selectValue.textContent = item.textContent.trim();
        select.classList.remove("active");
        filterProjects(selectedValue);
      });
    });
  }

  // Desktop filter buttons
  let lastClickedBtn = filterBtns[0];
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedValue = btn.textContent.trim().toLowerCase();
      selectValue.textContent = btn.textContent.trim();
      filterProjects(selectedValue);

      lastClickedBtn.classList.remove("active");
      btn.classList.add("active");
      lastClickedBtn = btn;
    });
  });
};
