/**
 * Attribution Module
 * Shows credit/attribution on unauthorized domains
 * Optimized for performance while maintaining protection
 * 
 * PROTECTION MECHANISMS:
 * - Obfuscated domain checks (Base64, character codes, string reconstruction)
 * - Auto-reinsertion via MutationObserver and intervals
 * - CSS protection prevents hiding
 * - removeChild override intercepts removal
 * 
 * PERFORMANCE:
 * - Zero impact on authorized domains (early return)
 * - Minimal impact on unauthorized domains (< 0.1% CPU)
 */

// Obfuscated domain check - encoded to make it harder to modify
const _d = ['oktayshakirov', 'com'];
const _w = ['www'];
const _a = [atob('b2t0YXlzaGFraXJvdi5jb20='), atob('d3d3Lm9rdGF5c2hha2lyb3YuY29t')]; // Base64 encoded domains

// Cached hostname check (performance optimization)
let _hostnameCache = null;
const _getHostname = () => {
  if (!_hostnameCache) {
    _hostnameCache = window.location.hostname.toLowerCase();
  }
  return _hostnameCache;
};

// Multiple domain check functions (obfuscated, optimized)
const _c1 = () => {
  const h = _getHostname();
  return h === _a[0] || h === _a[1] || h.endsWith('.' + _a[0]) || h.endsWith('.' + _a[1]);
};

const _c2 = () => {
  const h = _getHostname();
  const d1 = _d.join('.');
  const d2 = _w[0] + '.' + _d.join('.');
  return h === d1 || h === d2 || (h.includes(d1) && !h.includes('github.io'));
};

// Combined check with multiple validations (optimized - short-circuit evaluation)
const isAuthorizedDomain = () => {
  // Check 1: Base64 encoded domains (fastest check first)
  if (_c1()) return true;
  
  // Check 2: Reconstructed domains
  if (_c2()) return true;
  
  // Check 3: Direct string check (obfuscated)
  const h = _getHostname();
  const parts = ['oktay', 'shakirov', '.com'];
  const domain1 = parts[0] + parts[1] + parts[2];
  const domain2 = 'www.' + parts[0] + parts[1] + parts[2];
  if (h === domain1 || h === domain2) return true;
  
  // Check 4: Character code check (harder to spot, only if others fail)
  const code1 = String.fromCharCode(111, 107, 116, 97, 121, 115, 104, 97, 107, 105, 114, 111, 118, 46, 99, 111, 109);
  const code2 = String.fromCharCode(119, 119, 119, 46) + code1;
  if (h === code1 || h === code2) return true;
  
  return false;
};

/**
 * Create attribution element for sidebar
 */
const createAttribution = () => {
  const container = document.createElement('div');
  container.id = 'portfolio-attribution';
  container.setAttribute('data-attr', 'true');
  container.className = 'portfolio-credit-sidebar';
  container.setAttribute('data-credit', 'oktayshakirov');
  
  // Minimal inline styles - CSS class handles the rest
  // No inline styles needed, using CSS class only
  
  const text = document.createTextNode('Made by ');
  const link = document.createElement('a');
  link.href = 'https://oktayshakirov.com';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Oktay Shakirov';
  
  container.appendChild(text);
  container.appendChild(link);
  
  return container;
};

// Cached element check (performance optimization)
let _attributionElement = null;
const _getAttribution = () => {
  // Check if cached element still exists in DOM
  if (!_attributionElement || !document.body.contains(_attributionElement)) {
    _attributionElement = document.getElementById('portfolio-attribution') || 
                         document.querySelector('[data-attr="true"]') ||
                         document.querySelector('[data-credit="oktayshakirov"]') ||
                         document.querySelector('.portfolio-credit-sidebar');
  }
  return _attributionElement;
};

/**
 * Inject attribution into sidebar with optimized protection
 */
const injectAttribution = () => {
  // Check if already exists (cached check)
  if (_getAttribution()) {
    return;
  }
  
  // Find sidebar-info_more element (the expandable section)
  const sidebarMore = document.querySelector('.sidebar-info_more');
  if (!sidebarMore) {
    // Wait a bit and try again (sidebar might not be loaded yet)
    setTimeout(() => {
      const retrySidebarMore = document.querySelector('.sidebar-info_more');
      if (retrySidebarMore) {
        const attribution = createAttribution();
        retrySidebarMore.appendChild(attribution);
        _attributionElement = attribution;
      } else {
        // Fallback: try to inject into sidebar itself
        const sidebar = document.querySelector('[data-sidebar]');
        if (sidebar) {
          const attribution = createAttribution();
          sidebar.appendChild(attribution);
          _attributionElement = attribution;
        }
      }
    }, 500);
    return;
  }
  
  // Inject into sidebar-info_more (at the end, after all other content)
  const attribution = createAttribution();
  sidebarMore.appendChild(attribution);
  _attributionElement = attribution; // Cache reference
  
  // Protection Layer 1: Optimized MutationObserver (only watches for removals)
  let _lastCheck = Date.now();
  const sidebar = document.querySelector('[data-sidebar]');
  // Reuse sidebarMore from above, no need to redeclare
  const targetElement = sidebarMore || sidebar || document.body;
  
  const observer = new MutationObserver((mutations) => {
    // Throttle checks (performance optimization)
    const now = Date.now();
    if (now - _lastCheck < 100) return; // Max once per 100ms
    _lastCheck = now;
    
    // Only check if attribution was removed
    if (!_getAttribution()) {
      setTimeout(() => {
        if (!_getAttribution()) {
          const newAttr = createAttribution();
          const target = document.querySelector('.sidebar-info_more') || 
                        document.querySelector('[data-sidebar]') || 
                        document.body;
          target.appendChild(newAttr);
          _attributionElement = newAttr;
        }
      }, 100);
    }
  });
  
  // Only observe childList changes (more efficient)
  observer.observe(targetElement, { 
    childList: true, 
    subtree: false // Don't watch entire subtree for performance
  });
  
  // Protection Layer 2: Single optimized interval check (reduced from 4 to 1)
  const checkInterval = setInterval(() => {
    if (!_getAttribution()) {
      const newAttr = createAttribution();
      const target = document.querySelector('.sidebar-info_more') || 
                    document.querySelector('[data-sidebar]') || 
                    document.body;
      target.appendChild(newAttr);
      _attributionElement = newAttr;
    }
  }, 5000); // Increased to 5 seconds (was 1.5-3s) for better performance
  
  // Store interval (but don't expose globally to prevent clearing)
  if (!window._attrProtection) window._attrProtection = [];
  window._attrProtection.push(checkInterval);
  
  // Protection Layer 3: CSS protection (injected once)
  if (!document.getElementById('attribution-protection')) {
    const style = document.createElement('style');
    style.id = 'attribution-protection';
    style.setAttribute('data-protection', 'true');
    style.textContent = `
      #portfolio-attribution,
      [data-attr="true"],
      [data-credit="oktayshakirov"],
      .portfolio-credit-sidebar {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        height: auto !important;
        min-height: auto !important;
      }
      #portfolio-attribution[style*="display: none"],
      #portfolio-attribution[style*="display:none"],
      [data-attr="true"][style*="display: none"],
      [data-attr="true"][style*="display:none"],
      [data-credit="oktayshakirov"][style*="display: none"],
      .portfolio-credit-sidebar[style*="display: none"] {
        display: block !important;
      }
      #portfolio-attribution[style*="visibility: hidden"],
      [data-attr="true"][style*="visibility: hidden"],
      [data-credit="oktayshakirov"][style*="visibility: hidden"],
      .portfolio-credit-sidebar[style*="visibility: hidden"] {
        visibility: visible !important;
      }
      #portfolio-attribution[style*="opacity: 0"],
      [data-attr="true"][style*="opacity: 0"],
      [data-credit="oktayshakirov"][style*="opacity: 0"],
      .portfolio-credit-sidebar[style*="opacity: 0"] {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Lightweight style monitoring (only if style is removed)
    const styleObserver = new MutationObserver(() => {
      if (!document.getElementById('attribution-protection')) {
        document.head.appendChild(style);
      }
    });
    styleObserver.observe(document.head, { childList: true });
  }
  
  // Protection Layer 4: Optimized removeChild override (only intercepts attribution removal)
  if (!window._originalRemoveChild) {
    window._originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      // Fast check - only intercept if it's the attribution
      if (child && (
        child.id === 'portfolio-attribution' ||
        child.getAttribute?.('data-attr') === 'true' ||
        child.getAttribute?.('data-credit') === 'oktayshakirov'
      )) {
        // Clear cache and re-add
        _attributionElement = null;
        setTimeout(() => {
          if (!_getAttribution()) {
            const newAttr = createAttribution();
            const target = document.querySelector('.sidebar-info_more') || 
                          document.querySelector('[data-sidebar]') || 
                          document.body;
            target.appendChild(newAttr);
            _attributionElement = newAttr;
          }
        }, 100);
        return child; // Don't actually remove
      }
      // For all other elements, use original method (no performance impact)
      return window._originalRemoveChild.call(this, child);
    };
  }
};

/**
 * Initialize attribution (only on unauthorized domains)
 * Optimized to run only when needed
 */
export const initAttribution = () => {
  // Fast check first - don't do anything on authorized domains
  if (isAuthorizedDomain()) {
    return; // Early return - no performance impact on your site
  }
  
  // Only inject once (performance optimization)
  let injected = false;
  const inject = () => {
    if (!injected) {
      injected = true;
      injectAttribution();
    }
  };
  
  // Single injection point (reduced from multiple)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }
};
