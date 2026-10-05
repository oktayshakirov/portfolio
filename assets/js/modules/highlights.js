/**
 * Highlights Module
 * Keeps the "Highlights" numbers up to date from projects.json and GitHub,
 * so they never need to be edited by hand. The values in index.html are
 * only fallbacks for when JavaScript or the GitHub API is unavailable.
 */

const CAREER_START_YEAR = 2022;
const GITHUB_USERNAME = "oktayshakirov";

/**
 * Set the text of a highlight value
 * @param {string} key - data-highlight attribute value
 * @param {string|number} value - Value to display
 */
const setHighlight = (key, value) => {
  const element = document.querySelector(`[data-highlight="${key}"]`);
  if (element) element.textContent = value;
};

/**
 * Count apps in the stores and projects live on the web
 * @param {Array<Object>} projects - Projects from data/projects.json
 */
export const updateProjectHighlights = (projects) => {
  const storeApps = projects.filter(
    ({ links }) => links?.ios || links?.android,
  ).length;
  // Every project with a working preview link, except this portfolio itself
  const liveOnline = projects.filter(
    ({ links }) => links?.preview && links.preview !== "/",
  ).length;

  setHighlight("apps", storeApps);
  setHighlight("websites", liveOnline);
};

/**
 * Initialize years of experience and the public GitHub repository count
 */
export const initHighlights = async () => {
  setHighlight("years", `${new Date().getFullYear() - CAREER_START_YEAR}+`);

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { public_repos: publicRepos } = await response.json();
    if (publicRepos) setHighlight("repos", publicRepos);
  } catch (error) {
    console.error("Error loading GitHub repository count:", error);
  }
};
