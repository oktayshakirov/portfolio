/**
 * SEO Module
 * Handles SEO improvements and structured data
 */

/**
 * Add structured data (JSON-LD) for better SEO
 */
export const initStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Oktay Shakirov",
    "jobTitle": "Full-Stack Software Developer",
    "url": "https://oktayshakirov.com",
    "sameAs": [
      "https://github.com/oktayshakirov",
      "https://www.linkedin.com/in/oktayshakirov",
      "https://www.instagram.com/oktay.shakirov/",
      "https://twitter.com/oktayshakirov"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Berlin",
      "addressCountry": "Germany"
    },
    "email": "info@oktayshakirov.com",
    "knowsAbout": [
      "Web Development",
      "Mobile App Development",
      "Full-Stack Development",
      "JavaScript",
      "TypeScript",
      "React",
      "React Native",
      "Node.js",
      "PHP",
      "MySQL"
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * Initialize SEO enhancements
 */
export const initSEO = () => {
  initStructuredData();
};
