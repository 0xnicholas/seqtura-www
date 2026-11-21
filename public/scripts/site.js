(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  var mobileSections = document.querySelectorAll('[data-mobile-section-trigger]');

  var section = document.querySelector('[data-nav-section]');
  var sectionTrigger = section && section.querySelector('[data-nav-section-trigger]');
  var sectionMenu = section && section.querySelector('[data-nav-section-menu]');
  var hoverIntent = 150;
  var hoverTimer = null;
  var openedByHover = false;

  function collapseMobileSections() {
    mobileSections.forEach(function (trigger) {
      var target = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', 'false');
      if (target) target.hidden = true;
    });
  }

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (!open) collapseMobileSections();
  }

  function menuIsOpen() {
    return toggle?.getAttribute('aria-expanded') === 'true';
  }

  function setSection(open, byHover) {
    if (!sectionTrigger || !sectionMenu) return;
    sectionMenu.hidden = !open;
    sectionTrigger.setAttribute('aria-expanded', String(open));
    openedByHover = Boolean(open && byHover);
  }

  function sectionIsOpen() {
    return sectionTrigger?.getAttribute('aria-expanded') === 'true';
  }

  mobileSections.forEach(function (trigger) {
    var target = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!target) return;
    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      target.hidden = !open;
    });
  });

  // 悬停先开；点一下把关闭权接管过来，再点才收。
  sectionTrigger?.addEventListener('click', function () {
    if (!sectionIsOpen()) {
      setSection(true, false);
      return;
    }
    if (openedByHover) {
      openedByHover = false;
      return;
    }
    setSection(false, false);
  });

  section?.addEventListener('pointerenter', function () {
    window.clearTimeout(hoverTimer);
    if (sectionIsOpen()) return;
    hoverTimer = window.setTimeout(function () {
      setSection(true, true);
    }, hoverIntent);
  });

  section?.addEventListener('pointerleave', function () {
    window.clearTimeout(hoverTimer);
    if (openedByHover) setSection(false, false);
  });

  section?.addEventListener('focusout', function (event) {
    if (!section.contains(event.relatedTarget)) setSection(false, false);
  });

  document.addEventListener('pointerdown', function (event) {
    if (sectionIsOpen() && !section.contains(event.target)) setSection(false, false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (sectionIsOpen()) {
      setSection(false, false);
      sectionTrigger?.focus();
      return;
    }
    if (menuIsOpen()) {
      setMenu(false);
      toggle?.focus();
    }
  });

  toggle?.addEventListener('click', function () {
    setMenu(!menuIsOpen());
  });

  menu?.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
    if (event.matches) setMenu(false);
    else setSection(false, false);
  });

  function syncHeaderBorder() {
    header?.classList.toggle('is-scrolled', window.scrollY > 0);
  }

  syncHeaderBorder();
  window.addEventListener('scroll', syncHeaderBorder, { passive: true });
})();
