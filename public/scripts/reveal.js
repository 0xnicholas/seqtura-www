// Scroll reveal for .reveal blocks (spec §3.3): without JS, or under
// prefers-reduced-motion, content renders fully visible and static. With JS,
// the html.js gate hides .reveal blocks and IntersectionObserver adds
// .is-revealed once per block (unobserved after firing; scrolling back must
// not replay), running one var(--duration-enter) section-in per block.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll('.reveal').forEach(function (element) {
    observer.observe(element);
  });
})();
