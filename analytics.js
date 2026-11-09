(function () {
  'use strict';

  var domain = window.MWS_ANALYTICS_DOMAIN;
  if (!domain || document.querySelector('script[data-mws-analytics]')) { return; }

  var script = document.createElement('script');
  script.defer = true;
  script.src = 'https://plausible.io/js/script.js';
  script.dataset.domain = domain;
  script.dataset.mwsAnalytics = 'true';
  document.head.appendChild(script);
})();
