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
 * Initialize lazy loading for project images
 */
export const initLazyLoading = () => {
  const projectItems = document.querySelectorAll(".project-item");

  if (projectItems.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector("img[data-src]");
          if (img) {
            img.src = img.getAttribute("data-src");
            img.removeAttribute("data-src");
            entry.target
              .querySelector(".project-img")
              ?.classList.remove("loading");
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  projectItems.forEach((item) => {
    observer.observe(item);
  });
};

/**
 * Initialize auto-scrolling for technologies list
 */
export const initTechScrolling = () => {
  const list = document.querySelector(".technologies-list");
  if (!list) return;

  const scrollSpeed = 0.7;
  const intervalDuration = 10;
  const totalWidth = list.scrollWidth - list.clientWidth;
  let scrollPosition = 0;
  let scrolling = false;

  const startScrolling = () => {
    if (!scrolling) {
      scrolling = true;
      const interval = setInterval(() => {
        scrollPosition += scrollSpeed;

        if (scrollPosition >= totalWidth) {
          scrollPosition = 0;
        }

        if (!scrolling) {
          clearInterval(interval);
        }

        list.scrollLeft = scrollPosition;
      }, intervalDuration);
    }
  };

  const stopScrolling = () => {
    scrolling = false;
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

/**
 * Initialize motto animation
 */
export const initMottoAnimation = () => {
  const mottoElement = document.getElementById("motto");
  if (!mottoElement) return;

  const text = Array.from({ length: 20 }, () =>
    Array.from({ length: 16 }, () => Math.round(Math.random())).join("")
  );
  text.push("Hello, World !");

  let index = 0;

  const flipMotto = () => {
    mottoElement.textContent = text[index];

    if (text[index] === "Hello, World !") {
      clearInterval(intervalId);
    }

    index = (index + 1) % text.length;
  };

  const intervalId = setInterval(flipMotto, 100);
};

/**
 * Initialize age counter
 */
export const initAgeCounter = async () => {
  const ageElement = document.getElementById("age");
  if (!ageElement) return;

  const { calculateAge } = await import("./utils.js");
  const age = calculateAge("1994-07-01");
  ageElement.textContent = `${age} years old`;
};
