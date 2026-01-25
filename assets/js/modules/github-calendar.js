/**
 * GitHub Calendar Module
 * Fetches and displays GitHub contribution calendar
 */

import { formatDate } from "./utils.js";

/**
 * Initialize GitHub contributions calendar
 */
export const initGitHubCalendar = async () => {
  const calendarContainer = document.querySelector(
    ".activity-calendar-container"
  );
  const grid = document.querySelector(".calendar-grid");
  const tooltip = document.querySelector(".activity-tooltip");

  if (!calendarContainer || !grid || !tooltip) {
    console.warn("GitHub calendar elements not found");
    return;
  }

  const username = "oktayshakirov";
  const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;

  // Create months container
  const monthsContainer = document.createElement("div");
  monthsContainer.className = "months-container";
  calendarContainer.insertBefore(monthsContainer, grid);

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const contributions = data.contributions;

    if (!contributions || contributions.length === 0) {
      console.warn("No contribution data found");
      return;
    }

    const firstDate = new Date(contributions[0].date);
    const dayOfWeek = firstDate.getUTCDay();
    const startDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Add empty cells for alignment
    for (let i = 0; i < startDay; i++) {
      grid.appendChild(document.createElement("div"));
    }

    // Populate grid with contribution data
    contributions.forEach((contribution) => {
      const dayCell = document.createElement("div");
      dayCell.classList.add("calendar-day");
      if (contribution.level > 0) {
        dayCell.classList.add(`level-${contribution.level}`);
      }

      dayCell.dataset.count = contribution.count;
      dayCell.dataset.date = contribution.date;
      grid.appendChild(dayCell);
    });

    // Populate month labels
    const monthLabels = new Set();
    let lastMonth = -1;
    contributions.forEach((c) => {
      const date = new Date(c.date);
      const month = date.getUTCMonth();
      if (month !== lastMonth) {
        monthLabels.add({
          index: month,
          name: date.toLocaleString("default", {
            month: "short",
            timeZone: "UTC",
          }),
        });
        lastMonth = month;
      }
    });
    monthsContainer.innerHTML = Array.from(monthLabels)
      .map((m) => `<div>${m.name}</div>`)
      .join("");

    // Tooltip logic
    calendarContainer.addEventListener("mouseover", (event) => {
      if (event.target.classList.contains("calendar-day")) {
        const count = event.target.dataset.count;
        const date = formatDate(event.target.dataset.date);
        if (count) {
          tooltip.innerHTML = `<strong>${count} contributions</strong> on ${date}`;
          tooltip.style.display = "block";
        }
      }
    });

    calendarContainer.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
    });

    calendarContainer.addEventListener("mousemove", (event) => {
      tooltip.style.left = `${event.pageX + 15}px`;
      tooltip.style.top = `${event.pageY - 30}px`;
    });
  } catch (error) {
    console.error("Error fetching GitHub contribution data:", error);
    // Show fallback message
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--light-gray-70);">Unable to load contribution data</div>';
  }
};
