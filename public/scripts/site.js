(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  var mobileSections = document.querySelectorAll('[data-mobile-section-trigger]');

  var hoverIntent = 150;
  // 桌面下拉从单分组泛化为 N 组（#62）：每组持有自己的开关状态与 hover 计时器，
  // 打开一组即收起其余组，保证同一时刻只有一个面板可操作。
  var sections = Array.prototype.slice
    .call(document.querySelectorAll('[data-nav-section]'))
    .map(function (root) {
      return {
        root: root,
        trigger: root.querySelector('[data-nav-section-trigger]'),
        menu: root.querySelector('[data-nav-section-menu]'),
        timer: null,
        openedByHover: false,
      };
    })
    .filter(function (state) {
      return state.trigger && state.menu;
    });

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

  function sectionIsOpen(state) {
    return state.trigger.getAttribute('aria-expanded') === 'true';
  }

  function setSection(state, open, byHover) {
    window.clearTimeout(state.timer);
    state.menu.hidden = !open;
    state.trigger.setAttribute('aria-expanded', String(open));
    state.openedByHover = Boolean(open && byHover);
  }

  function closeOtherSections(except) {
    sections.forEach(function (state) {
      if (state !== except && sectionIsOpen(state)) setSection(state, false, false);
    });
  }

  function closeAllSections() {
    sections.forEach(function (state) {
      if (sectionIsOpen(state)) setSection(state, false, false);
    });
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

  sections.forEach(function (state) {
    // 悬停先开；点一下把关闭权接管过来，再点才收。
    state.trigger.addEventListener('click', function () {
      if (!sectionIsOpen(state)) {
        closeOtherSections(state);
        setSection(state, true, false);
        return;
      }
      if (state.openedByHover) {
        state.openedByHover = false;
        return;
      }
      setSection(state, false, false);
    });

    state.root.addEventListener('pointerenter', function () {
      window.clearTimeout(state.timer);
      if (sectionIsOpen(state)) return;
      state.timer = window.setTimeout(function () {
        closeOtherSections(state);
        setSection(state, true, true);
      }, hoverIntent);
    });

    state.root.addEventListener('pointerleave', function () {
      window.clearTimeout(state.timer);
      if (state.openedByHover) setSection(state, false, false);
    });

    state.root.addEventListener('focusout', function (event) {
      if (!state.root.contains(event.relatedTarget)) setSection(state, false, false);
    });
  });

  document.addEventListener('pointerdown', function (event) {
    sections.forEach(function (state) {
      if (sectionIsOpen(state) && !state.root.contains(event.target)) {
        setSection(state, false, false);
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = sections.filter(sectionIsOpen);
    if (open.length > 0) {
      open.forEach(function (state) {
        setSection(state, false, false);
      });
      open[0].trigger.focus();
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
    else closeAllSections();
  });

  function syncHeaderBorder() {
    header?.classList.toggle('is-scrolled', window.scrollY > 0);
  }

  syncHeaderBorder();
  window.addEventListener('scroll', syncHeaderBorder, { passive: true });
})();
