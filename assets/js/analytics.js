// Shared GA4 bootstrap + click/engagement event tracking for all cybersolar.earth pages.
// Wrapped in an IIFE (no top-level let/const) so it's safe to load as a plain script
// alongside each page's own inline script block — see menubar.js dead-code gotcha.
(function () {
  var GA_ID = 'G-VE6JTYYWV0';

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { page_title: document.title });

  // First-touch campaign params, persisted so later custom events this session still carry them.
  (function captureUtm() {
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    utmKeys.forEach(function (key) {
      if (params.has(key)) utm[key] = params.get(key);
    });
    if (Object.keys(utm).length) {
      try { sessionStorage.setItem('cs_utm', JSON.stringify(utm)); } catch (e) { /* storage unavailable */ }
    }
  })();

  function getStoredUtm() {
    try {
      var raw = sessionStorage.getItem('cs_utm');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // Exposed for page-specific instrumentation (audio player, modals, forms, etc.).
  function trackEvent(name, params) {
    gtag('event', name, Object.assign({}, getStoredUtm(), params || {}));
  }
  window.csTrackEvent = trackEvent;

  // Visible text, then image alt, then raw href — whichever identifies the link best.
  function getLinkLabel(link) {
    var text = (link.textContent || '').trim().replace(/\s+/g, ' ');
    if (text) return text.slice(0, 100);
    var img = link.querySelector('img[alt]');
    if (img && img.alt) return img.alt;
    return link.getAttribute('href') || '';
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return; // in-page anchors (lightboxes, etc.)

    var isMail = href.indexOf('mailto:') === 0;
    var isTel = href.indexOf('tel:') === 0;
    var isExternal = /^https?:\/\//i.test(href) && link.hostname !== window.location.hostname;

    trackEvent(isExternal || isMail || isTel ? 'outbound_click' : 'internal_nav_click', {
      link_text: getLinkLabel(link),
      link_url: href,
      source_page: window.location.pathname
    });
  }, true);

  // Win98 dropdown menu items (File/Edit/View/Help) use data-action, not <a href>.
  document.addEventListener('click', function (e) {
    var item = e.target.closest && e.target.closest('.dropdown-item[data-action]');
    if (!item) return;
    trackEvent('menu_action_click', {
      action: item.getAttribute('data-action'),
      source_page: window.location.pathname
    });
  }, true);

  // Menubar "about" title — navigates home or opens the About modal in place.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('#about-trigger');
    if (!trigger) return;
    trackEvent('menu_action_click', {
      action: 'about-trigger',
      source_page: window.location.pathname
    });
  }, true);
})();
