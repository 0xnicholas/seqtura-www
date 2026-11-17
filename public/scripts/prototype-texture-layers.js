// PROTOTYPE texture-layers (#31): drives the dev-only texture panel on the
// homepage. Applies toggle state as body classes (layers are pure CSS),
// keeps the URL ?tex= param shareable, no reloads. Throwaway — drop with
// the prototype.
(function () {
  // key → body class. Glows are subtractive: their tex-off-* class removes
  // an existing production glow, so it goes on when the toggle is off
  // (detected by the tex-off- prefix in apply()).
  var TOGGLES = [
    ['grid-hero', 'tex-grid-hero'],
    ['glow-hero', 'tex-off-glow-hero'],
    ['grid-methodology', 'tex-grid-methodology'],
    ['glow-methodology', 'tex-off-glow-methodology'],
    ['glow-arch', 'tex-off-glow-arch'],
    ['grid-cta', 'tex-grid-cta'],
    ['glow-cta', 'tex-off-glow-cta'],
    ['grain', 'tex-grain'],
  ];
  var KEYS = TOGGLES.map(function (t) {
    return t[0];
  });

  var state = {};
  var previous = null; // for the "b" bare/restore flip

  function setAll(value) {
    for (var i = 0; i < KEYS.length; i++) state[KEYS[i]] = value;
  }

  function parseParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('capture') === '1') document.body.classList.add('tex-capture');
    var raw = params.get('tex');
    if (raw === null) {
      setAll(true); // no param: the full proposal
      return;
    }
    if (raw === 'none' || raw === '') {
      setAll(false);
      return;
    }
    setAll(false);
    raw.split(',').forEach(function (key) {
      if (KEYS.indexOf(key) !== -1) state[key] = true;
    });
  }

  function apply() {
    for (var i = 0; i < TOGGLES.length; i++) {
      var key = TOGGLES[i][0];
      var cls = TOGGLES[i][1];
      var on = state[key];
      // subtractive toggles (glow-*) carry tex-off-* classes when off
      var classOn = cls.indexOf('tex-off-') === 0 ? !on : on;
      document.body.classList.toggle(cls, classOn);
      var chip = document.querySelector('[data-tex-key="' + key + '"]');
      if (chip) chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    syncUrl();
  }

  function syncUrl() {
    var onKeys = KEYS.filter(function (key) {
      return state[key];
    });
    var params = new URLSearchParams(window.location.search);
    if (onKeys.length === KEYS.length) {
      params.delete('tex'); // default: all on
    } else if (onKeys.length === 0) {
      params.set('tex', 'none');
    } else {
      params.set('tex', onKeys.join(','));
    }
    var query = params.toString();
    var url = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
    window.history.replaceState(null, '', url);
  }

  function isBare() {
    return KEYS.every(function (key) {
      return !state[key];
    });
  }

  parseParams();
  apply();

  var bar = document.querySelector('[data-tex-panel]');
  if (!bar) return;

  bar.addEventListener('click', function (event) {
    var chip = event.target.closest('[data-tex-key]');
    if (chip) {
      var key = chip.getAttribute('data-tex-key');
      state[key] = !state[key];
      apply();
      return;
    }
    if (event.target.closest('[data-tex-all]')) {
      setAll(true);
      apply();
      return;
    }
    if (event.target.closest('[data-tex-none]')) {
      setAll(false);
      apply();
      return;
    }
    var perfToggle = event.target.closest('[data-tex-perf-toggle]');
    if (perfToggle) {
      var panel = bar.querySelector('[data-tex-perf]');
      var willShow = panel.hidden;
      panel.hidden = !willShow;
      perfToggle.setAttribute('aria-expanded', willShow ? 'true' : 'false');
    }
  });

  document.addEventListener('keydown', function (event) {
    var target = event.target;
    if (target && target.closest && target.closest('input, textarea, [contenteditable="true"]')) {
      return;
    }
    if (event.key !== 'b' && event.key !== 'B') return;
    if (isBare()) {
      if (previous) {
        state = previous;
        previous = null;
        apply();
      }
    } else {
      previous = Object.assign({}, state);
      setAll(false);
      apply();
    }
  });
})();
