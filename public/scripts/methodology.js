(function () {
  var cards = Array.from(document.querySelectorAll('[data-stage-card]'));
  var desktop = window.matchMedia('(min-width: 1024px)');

  function sync() {
    var target = window.location.hash.slice(1);
    for (var i = 0; i < cards.length; i += 1) {
      cards[i].open = desktop.matches || cards[i].id === target;
    }

    var anchor = target ? document.getElementById(target) : null;
    if (!desktop.matches && anchor) {
      requestAnimationFrame(function () {
        anchor.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    }
  }

  sync();
  desktop.addEventListener('change', sync);
  window.addEventListener('hashchange', sync);
})();
