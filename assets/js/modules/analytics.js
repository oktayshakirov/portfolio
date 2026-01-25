/**
 * Analytics Module
 * Handles Google Analytics initialization with domain protection
 * Only loads analytics on authorized domains to prevent traffic from copied portfolios
 */

/**
 * Authorized domains where analytics should be active
 * Add your production domain(s) here
 */
const AUTHORIZED_DOMAINS = [
  'oktayshakirov.com',
  'www.oktayshakirov.com',
  // Add localhost for development (optional)
  // 'localhost',
  // '127.0.0.1'
];

/**
 * Your Google Analytics Tracking ID
 * Replace with your own tracking ID
 */
const GA_TRACKING_ID = 'G-G1H2WJ7XH4';

/**
 * Check if current domain is authorized
 * @returns {boolean} True if domain is authorized
 */
const isAuthorizedDomain = () => {
  const hostname = window.location.hostname.toLowerCase();
  return AUTHORIZED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
};

/**
 * Initialize Google Analytics only on authorized domains
 */
export const initAnalytics = () => {
  // Only load analytics on authorized domains
  if (!isAuthorizedDomain()) {
    console.log('Google Analytics disabled: Unauthorized domain');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);

  // Make gtag available globally
  window.gtag = gtag;
};
