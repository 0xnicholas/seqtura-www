(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }

  function menuIsOpen() {
    return toggle?.getAttribute('aria-expanded') === 'true';
  }

  toggle?.addEventListener('click', function () {
    setMenu(!menuIsOpen());
  });

  menu?.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuIsOpen()) {
      setMenu(false);
      toggle?.focus();
    }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
    if (event.matches) setMenu(false);
  });

  function syncHeaderBorder() {
    header?.classList.toggle('is-scrolled', window.scrollY > 0);
  }

  syncHeaderBorder();
  window.addEventListener('scroll', syncHeaderBorder, { passive: true });
})();
