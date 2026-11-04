/**
 * Animations Module
 * Handles various animations and progress bars
 */

/**
 * Animate progress bar from 0 to target width
 * @param {HTMLElement} element - Progress bar element
 * @param {number} targetWidth - Target width percentage
 */
const increaseProgress = (element, targetWidth) => {
  let currentWidth = 0;
  const increment = 1;
  const interval = 10;

  const timer = setInterval(() => {
    currentWidth += increment;
    element.style.width = `${currentWidth}%`;
    if (currentWidth >= targetWidth) {
      clearInterval(timer);
    }
  }, interval);
};

/**
 * Pause all CSS animations while the tab is hidden or the window is unfocused,
 * so a portfolio left open behind other windows doesn't keep the GPU busy
 */
export const initMotionPause = () => {
  // Only an actual blur counts. Don't read document.hasFocus() on load:
  // Instagram/Facebook in-app browsers report false until the first tap.
  let blurred = false;

  const update = () => {
    const paused = document.hidden || blurred;
    document.body.classList.toggle("motion-paused", paused);
  };

  const setBlurred = (value) => () => {
    blurred = value;
    update();
  };

  document.addEventListener("visibilitychange", update);
  window.addEventListener("blur", setBlurred(true));
  window.addEventListener("focus", setBlurred(false));
  window.addEventListener("pointerdown", setBlurred(false));
  update();
};

/**
 * Initialize progress bar animations on scroll
 */
export const initProgressBars = () => {
  const progressFillElements = document.querySelectorAll(
    ".languages-progress-fill"
  );

  if (progressFillElements.length === 0) return;

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetWidth = parseInt(entry.target.style.width) || 0;
        if (targetWidth > 0) {
          entry.target.style.width = "0%";
          increaseProgress(entry.target, targetWidth);
        }
        observer.unobserve(entry.target);
      }
    });
  }, options);

  progressFillElements.forEach((element) => {
    observer.observe(element);
  });
};

/**
 * Initialize auto-scrolling for technologies list
 * (called by loadTechnologies once the list is rendered)
 */
export const initTechScrolling = () => {
  const list = document.querySelector(".technologies-list");
  if (!list) return;

  const scrollSpeed = 0.7;
  const intervalDuration = 10;
  let scrollPosition = 0;
  let scrolling = false;
  let scrollInterval = null;

  const getTotalWidth = () => {
    return list.scrollWidth - list.clientWidth;
  };

  const startScrolling = () => {
    if (!scrolling && scrollInterval === null) {
      scrolling = true;
      scrollInterval = setInterval(() => {
        if (document.body.classList.contains("motion-paused")) return;

        const totalWidth = getTotalWidth();
        
        // Recalculate if content might have changed
        if (totalWidth <= 0) {
          return; // Wait for content to load
        }

        scrollPosition += scrollSpeed;

        if (scrollPosition >= totalWidth) {
          scrollPosition = 0;
        }

        list.scrollLeft = scrollPosition;
      }, intervalDuration);
    }
  };

  const stopScrolling = () => {
    scrolling = false;
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startScrolling();
        } else {
          stopScrolling();
        }
      });
    },
    { threshold: 0 }
  );

  observer.observe(list);

  list.addEventListener("mouseenter", stopScrolling);
  list.addEventListener("mouseleave", startScrolling);
};
