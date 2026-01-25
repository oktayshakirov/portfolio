/**
 * Sidebar Module
 * Handles sidebar toggle functionality
 */

import { elementToggle } from "./utils.js";

/**
 * Initialize sidebar functionality
 */
export const initSidebar = () => {
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  if (!sidebar || !sidebarBtn) {
    console.warn("Sidebar elements not found");
    return;
  }

  // Toggle sidebar on button click
  sidebarBtn.addEventListener("click", () => {
    elementToggle(sidebar);
  });

  // Auto-expand sidebar on mobile by default
  if (window.innerWidth < 768) {
    sidebarBtn.click();
  }
};
