(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var topBar = document.querySelector('.top');
  var progress = document.querySelector('.progress');
  var hero = document.querySelector('.hero');
  var orbs = Array.prototype.slice.call(document.querySelectorAll('.orb'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  var navTargets = navLinks.map(function (link) { return document.querySelector(link.getAttribute('href')); });

  // ---------- Reveal setup (motion only) ----------
  var revealGroups = [
    { selector: '.hero-copy, .hero-portrait' },
    { selector: '.stat', stagger: true },
    { selector: '.readout' },
    { selector: 'section.block .wrap > h2' },
    { selector: '.why .card', stagger: true },
    { selector: '.services .svc', stagger: true },
    { selector: '.faq-head, .faq-list details', stagger: true },
    { selector: '.work > *', stagger: true },
    { selector: '.steps > li', stagger: true },
    { selector: '.about > *', stagger: true }
  ];

  function splitHeadline() {
    var h1 = document.querySelector('.hero h1');
    if (!h1) { return; }
    var nodes = Array.prototype.slice.call(h1.childNodes);
    var fragment = document.createDocumentFragment();
    var index = 0;
    function addWord(content) {
      var outer = document.createElement('span');
      outer.className = 'w';
      outer.style.setProperty('--i', index++);
      outer.appendChild(content);
      fragment.appendChild(outer);
      fragment.appendChild(document.createTextNode(' '));
    }
    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/\s+/).filter(Boolean).forEach(function (word) {
          var inner = document.createElement('span');
          inner.textContent = word;
          addWord(inner);
        });
      } else {
        addWord(node);
      }
    });
    h1.textContent = '';
    h1.appendChild(fragment);
  }

  function setupMarquee() {
    var track = document.querySelector('.marquee-track');
    if (!track) { return; }
    Array.prototype.slice.call(track.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  function prepareCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
    });
  }

  if (!reduce) {
    revealGroups.forEach(function (group) {
      document.querySelectorAll(group.selector).forEach(function (element, index) {
        element.setAttribute('data-reveal', 'up');
        if (group.stagger) {
          element.style.setProperty('--reveal-delay', Math.min(index * 90, 270) + 'ms');
        }
      });
    });
    splitHeadline();
    setupMarquee();
    prepareCounters();
    root.classList.add('motion-ready');
  }

  // ---------- Count-up numbers ----------
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = Date.now();
    var timer = window.setInterval(function () {
      var t = Math.min(1, (Date.now() - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t >= 1) { window.clearInterval(timer); }
    }, 30);
  }

  // ---------- Scroll-driven updates ----------
  var queued = false;

  function revealVisible() {
    if (reduce) { return; }
    var line = window.innerHeight * 0.94;
    document.querySelectorAll('[data-reveal="up"]:not(.is-visible)').forEach(function (element) {
      var bounds = element.getBoundingClientRect();
      if (bounds.top < line && bounds.bottom > 0) {
        element.classList.add('is-visible');
        element.querySelectorAll('[data-count]').forEach(countUp);
      }
    });
  }

  function update() {
    queued = false;
    var y = window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) { progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0); }
    if (topBar) { topBar.classList.toggle('scrolled', y > 8); }

    var activeIndex = -1;
    navTargets.forEach(function (target, i) {
      if (target && target.getBoundingClientRect().top <= window.innerHeight * 0.35) { activeIndex = i; }
    });
    navLinks.forEach(function (link, i) { link.classList.toggle('active', i === activeIndex); });

    if (!reduce) {
      orbs.forEach(function (orb) {
        var speed = parseFloat(orb.getAttribute('data-speed')) || 0;
        orb.style.setProperty('--py', (y * speed).toFixed(1) + 'px');
      });
      revealVisible();
    }
  }

  // rAF is paused in background tabs, so a timer backs it up.
  function schedule() {
    if (queued) { return; }
    queued = true;
    window.requestAnimationFrame(function () { if (queued) { update(); } });
    window.setTimeout(function () { if (queued) { update(); } }, 80);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  if (reduce) { return; }

  // ---------- Rotating audience word ----------
  var rot = document.getElementById('rot');
  if (rot) {
    var words = (rot.getAttribute('data-words') || '').split('|').filter(Boolean);
    var current = 0;
    if (words.length > 1) {
      window.setInterval(function () {
        if (document.hidden) { return; }
        rot.classList.add('swap');
        window.setTimeout(function () {
          current = (current + 1) % words.length;
          rot.textContent = words[current];
          rot.classList.remove('swap');
        }, 350);
      }, 2600);
    }
  }

  // ---------- Injected styles for the extra effects ----------
  var style = document.createElement('style');
  style.textContent =
    '.fx-ripple{position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.35);transform:scale(0);animation:fx-ripple .6s ease-out forwards}' +
    '@keyframes fx-ripple{to{transform:scale(1);opacity:0}}' +
    '.fx-top{position:fixed;right:20px;bottom:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(20,22,28,.85);color:#fff;font-size:18px;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s,transform .3s;z-index:50;backdrop-filter:blur(6px)}' +
    '.fx-top.show{opacity:1;transform:none;pointer-events:auto}' +
    '.fx-top:hover{border-color:rgba(255,255,255,.5)}' +
    '.fx-tilting{transition:transform .12s ease-out,box-shadow .2s !important;will-change:transform}' +
    '.fx-tilting{box-shadow:0 18px 40px -18px rgba(0,0,0,.55)}' +
    '.fx-shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .25s;background:radial-gradient(260px circle at var(--sx,50%) var(--sy,50%),rgba(255,255,255,.10),transparent 60%)}' +
    '.fx-tilting>.fx-shine{opacity:1}' +
    '.fx-cursor{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(255,255,255,.45);border-radius:50%;pointer-events:none;z-index:9999;opacity:0;transition:opacity .25s,width .2s,height .2s,margin .2s,background .2s;mix-blend-mode:difference}' +
    '.fx-cursor.on{opacity:1}' +
    '.fx-cursor.hot{width:56px;height:56px;margin:-28px 0 0 -28px;background:rgba(255,255,255,.12)}';
  document.head.appendChild(style);

  // ---------- Button ripple ----------
  document.querySelectorAll('.btn').forEach(function (btn) {
    if (window.getComputedStyle(btn).position === 'static') { btn.style.position = 'relative'; }
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', function (e) {
      var box = btn.getBoundingClientRect();
      var size = Math.max(box.width, box.height) * 2;
      var dot = document.createElement('span');
      dot.className = 'fx-ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - box.left - size / 2) + 'px';
      dot.style.top = (e.clientY - box.top - size / 2) + 'px';
      btn.appendChild(dot);
      window.setTimeout(function () { dot.remove(); }, 650);
    });
  });

  // ---------- Back-to-top button ----------
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'fx-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.textContent = '\u2191';
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('show', window.pageYOffset > window.innerHeight * 0.8);
  }, { passive: true });

  // ---------- Pointer effects (mouse devices only) ----------
  if (!finePointer) { return; }

  // 3D tilt with a soft light sheen on cards
  document.querySelectorAll('.card, .svc, .work > *').forEach(function (card) {
    if (window.getComputedStyle(card).position === 'static') { card.style.position = 'relative'; }
    var shine = document.createElement('span');
    shine.className = 'fx-shine';
    shine.setAttribute('aria-hidden', 'true');
    card.appendChild(shine);
    card.addEventListener('mouseenter', function () { card.classList.add('fx-tilting'); });
    card.addEventListener('mousemove', function (e) {
      var box = card.getBoundingClientRect();
      var px = (e.clientX - box.left) / box.width;
      var py = (e.clientY - box.top) / box.height;
      card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 6).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 8).toFixed(2) + 'deg) translateY(-3px)';
      shine.style.setProperty('--sx', (px * 100).toFixed(1) + '%');
      shine.style.setProperty('--sy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', function () {
      card.classList.remove('fx-tilting');
      card.style.transform = '';
    });
  });

  // Trailing cursor ring that grows over interactive elements
  var ring = document.createElement('div');
  ring.className = 'fx-cursor';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  var rx = 0, ry = 0, tx = 0, ty = 0, ringRunning = false;
  function moveRing() {
    rx += (tx - rx) * 0.2;
    ry += (ty - ry) * 0.2;
    ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
    if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
      window.requestAnimationFrame(moveRing);
    } else {
      ringRunning = false;
    }
  }
  document.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    ring.classList.add('on');
    ring.classList.toggle('hot', !!e.target.closest('a, button, summary, input, textarea, select'));
    if (!ringRunning) { ringRunning = true; window.requestAnimationFrame(moveRing); }
  });
  document.documentElement.addEventListener('mouseleave', function () { ring.classList.remove('on'); });

  var portrait = document.querySelector('.hero-portrait');
  if (hero) {
    hero.addEventListener('mousemove', function (e) {
      var box = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - box.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - box.top) + 'px');
      hero.style.setProperty('--glow', 1);
      if (portrait) {
        var nx = (e.clientX / window.innerWidth - 0.5) * 2;
        var ny = (e.clientY / window.innerHeight - 0.5) * 2;
        portrait.style.setProperty('--tx', (nx * -10).toFixed(1) + 'px');
        portrait.style.setProperty('--ty', (ny * -8).toFixed(1) + 'px');
      }
    });
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--glow', 0);
      if (portrait) {
        portrait.style.setProperty('--tx', '0px');
        portrait.style.setProperty('--ty', '0px');
      }
    });
  }

  document.querySelectorAll('.svc').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var box = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - box.left) + 'px');
      card.style.setProperty('--my', (e.clientY - box.top) + 'px');
    });
  });

  document.querySelectorAll('.hero .actions .btn, .about .btn, .contact .btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var box = btn.getBoundingClientRect();
      var dx = e.clientX - (box.left + box.width / 2);
      var dy = e.clientY - (box.top + box.height / 2);
      btn.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
})();
