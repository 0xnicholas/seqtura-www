// PROTOTYPE graphic-language (#29): applies ?variant= client-side and drives
// the dev-only floating switcher (arrow keys included). Round 2: hero stays
// untouched; variants re-skin the methodology stages section. Throwaway —
// drop with the prototype.
(function () {
  var VARIANTS = [
    ['', '现状'],
    ['iso', 'A · 等距栈延展'],
    ['bp', 'B · 蓝图线稿'],
    ['mix', 'C · 混合'],
  ];

  var params = new URLSearchParams(window.location.search);
  var variant = params.get('variant') || '';
  var index = -1;
  for (var i = 0; i < VARIANTS.length; i++) {
    if (VARIANTS[i][0] === variant) index = i;
  }
  if (index < 0) {
    variant = '';
    index = 0;
  }

  function hrefFor(key) {
    return key === '' ? '?' : '?variant=' + key;
  }

  // Apply the variant: reveal its blocks, hide the rest.
  if (variant) {
    var blocks = document.querySelectorAll('[data-gl-glyph]');
    for (var j = 0; j < blocks.length; j++) {
      blocks[j].hidden = blocks[j].getAttribute('data-gl-glyph') !== variant;
    }
    var headingGlyph = document.querySelector('.proto-heading-glyph');
    if (headingGlyph) headingGlyph.hidden = false;
  }

  // Switcher label + prev/next hrefs.
  var bar = document.querySelector('[data-gl-switcher]');
  if (bar) {
    var label = bar.querySelector('[data-gl-label]');
    if (label) label.textContent = VARIANTS[index][1];
    var prevKey = VARIANTS[(index - 1 + VARIANTS.length) % VARIANTS.length][0];
    var nextKey = VARIANTS[(index + 1) % VARIANTS.length][0];
    bar.setAttribute('data-prev', hrefFor(prevKey));
    bar.setAttribute('data-next', hrefFor(nextKey));
    var prevLink = bar.querySelector('[data-gl-prev]');
    var nextLink = bar.querySelector('[data-gl-next]');
    if (prevLink) prevLink.setAttribute('href', hrefFor(prevKey));
    if (nextLink) nextLink.setAttribute('href', hrefFor(nextKey));

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('input, textarea, [contenteditable="true"]')) {
        return;
      }
      var href = null;
      if (event.key === 'ArrowLeft') href = bar.getAttribute('data-prev');
      if (event.key === 'ArrowRight') href = bar.getAttribute('data-next');
      if (href) window.location.href = href;
    });
  }
})();
