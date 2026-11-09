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
    { selector: '.marquee' },
    { selector: 'section.block .wrap > h2' },
    { selector: 'section.block .wrap > .intro' },
    { selector: '.why .card', stagger: true },
    { selector: '.services .svc', stagger: true },
    { selector: '.faq-head, .faq-list details', stagger: true },
    { selector: '.work > *', stagger: true },
    { selector: '.quotes figure', stagger: true },
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
      var scene = hero && hero.querySelector('.fx-3d-scene');
      if (scene) {
        scene.style.setProperty('--scene-y', Math.max(-18, y * -0.035).toFixed(1) + 'px');
      }
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
    '@media (max-width:760px){.fx-top{right:1rem;bottom:calc(1rem + env(safe-area-inset-bottom,0px));width:48px;height:48px}}' +
    '.fx-tilting{transition:transform .12s ease-out,box-shadow .2s !important;will-change:transform}' +
    '.fx-tilting{box-shadow:0 18px 40px -18px rgba(0,0,0,.55)}' +
    '.fx-shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .25s;background:radial-gradient(260px circle at var(--sx,50%) var(--sy,50%),rgba(255,255,255,.10),transparent 60%)}' +
    '.fx-tilting>.fx-shine{opacity:1}' +
    '.fx-particles{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}' +
    '.fx-particle{position:absolute;left:var(--left);top:var(--top);width:var(--size);height:var(--size);border-radius:50%;background:var(--color);opacity:var(--opacity);animation:fx-float var(--duration) ease-in-out var(--delay) infinite alternate;will-change:transform,opacity}' +
    '@keyframes fx-float{0%{transform:translate3d(0,0,0) scale(.8)}100%{transform:translate3d(var(--drift-x),var(--drift-y),0) scale(1.25);opacity:.85}}' +
    '.fx-3d-scene{position:absolute;right:11%;top:18%;width:11rem;height:11rem;perspective:700px;pointer-events:none;transform:translateY(var(--scene-y,0px)) rotateX(var(--cube-tilt-x,0deg)) rotateY(var(--cube-tilt-y,0deg));transition:transform .35s ease;z-index:0;opacity:.72}' +
    '.fx-cube{position:absolute;inset:1.75rem;transform-style:preserve-3d;animation:fx-cube-spin 20s linear infinite}' +
    '.fx-cube-face{position:absolute;inset:0;border:1px solid rgba(20,33,61,.38);background:linear-gradient(135deg,rgba(242,182,50,.18),rgba(247,249,251,.04));backface-visibility:visible;box-shadow:inset 0 0 1.5rem rgba(242,182,50,.08)}' +
    '.fx-cube-face:nth-child(1){transform:translateZ(4.75rem)}.fx-cube-face:nth-child(2){transform:rotateY(180deg) translateZ(4.75rem)}' +
    '.fx-cube-face:nth-child(3){transform:rotateY(90deg) translateZ(4.75rem)}.fx-cube-face:nth-child(4){transform:rotateY(-90deg) translateZ(4.75rem)}' +
    '.fx-cube-face:nth-child(5){transform:rotateX(90deg) translateZ(4.75rem)}.fx-cube-face:nth-child(6){transform:rotateX(-90deg) translateZ(4.75rem)}' +
    '@keyframes fx-cube-spin{to{transform:rotateX(360deg) rotateY(360deg)}}' +
    '.fx-orbit{position:absolute;left:50%;top:50%;width:13rem;height:4.5rem;margin:-2.25rem 0 0 -6.5rem;border:1px solid rgba(242,182,50,.48);border-radius:50%;transform-style:preserve-3d;box-shadow:0 0 1.5rem rgba(242,182,50,.09)}' +
    '.fx-orbit::after{content:"";position:absolute;left:50%;top:-.28rem;width:.55rem;height:.55rem;margin-left:-.28rem;border-radius:50%;background:#F2B632;box-shadow:0 0 .8rem rgba(242,182,50,.8)}' +
    '.fx-orbit-a{animation:fx-orbit-a 11s linear infinite}' +
    '.fx-orbit-b{border-color:rgba(59,90,163,.42);transform:rotateX(68deg) rotateY(25deg);animation:fx-orbit-b 14s linear infinite reverse}' +
    '.fx-orbit-b::after{background:#3B5AA3;box-shadow:0 0 .8rem rgba(59,90,163,.8)}' +
    '.fx-orbit-c{border-color:rgba(20,33,61,.28);transform:rotateY(72deg) rotateZ(18deg);animation:fx-orbit-c 17s linear infinite}' +
    '.fx-orbit-c::after{background:#14213D;box-shadow:0 0 .8rem rgba(20,33,61,.5)}' +
    '@keyframes fx-orbit-a{to{transform:rotateX(68deg) rotateY(360deg)}}' +
    '@keyframes fx-orbit-b{to{transform:rotateX(428deg) rotateY(25deg)}}' +
    '@keyframes fx-orbit-c{to{transform:rotateY(432deg) rotateZ(18deg)}}' +
    '.fx-grid-plane{position:absolute;left:-4rem;bottom:-4rem;width:19rem;height:9rem;transform:rotateX(67deg) rotateZ(-8deg) translateZ(-2rem);background:linear-gradient(rgba(59,90,163,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(59,90,163,.22) 1px,transparent 1px);background-size:1.25rem 1.25rem;mask-image:linear-gradient(to bottom,transparent,black 35%,transparent);opacity:.7;animation:fx-grid-drift 8s ease-in-out infinite alternate}' +
    '@keyframes fx-grid-drift{to{transform:rotateX(67deg) rotateZ(-8deg) translate3d(1rem,-.75rem,-2rem)}}' +
    '.fx-hud{position:absolute;right:-4.5rem;top:-1.25rem;width:8.5rem;padding:.7rem;border:1px solid rgba(20,33,61,.28);border-radius:.7rem;background:rgba(247,249,251,.72);backdrop-filter:blur(8px);box-shadow:0 .8rem 2rem rgba(20,33,61,.12);font:700 .56rem/1.35 var(--display);letter-spacing:.08em;text-transform:uppercase;transform:rotateY(-14deg) rotateX(8deg);animation:fx-hud-float 5s ease-in-out infinite alternate}' +
    '.fx-hud strong{display:flex;align-items:center;gap:.35rem;color:#14213D;font-size:.62rem}.fx-hud strong::before{content:"";width:.4rem;height:.4rem;border-radius:50%;background:#2FBF71;box-shadow:0 0 0 .18rem rgba(47,191,113,.18)}' +
    '.fx-hud em{display:block;margin-top:.6rem;color:#5B6B7F;font-style:normal}.fx-hud-bar{height:.24rem;margin-top:.28rem;border-radius:99px;background:rgba(20,33,61,.12);overflow:hidden}.fx-hud-bar::after{content:"";display:block;width:82%;height:100%;border-radius:inherit;background:#F2B632;animation:fx-hud-scan 2.8s ease-in-out infinite alternate}' +
    '@keyframes fx-hud-float{to{transform:rotateY(-14deg) rotateX(8deg) translateY(-.45rem)}}' +
    '@keyframes fx-hud-scan{to{width:96%}}' +
    '@media (max-width:700px){.fx-3d-scene{display:none}}' +
    '.fx-scroll-cue{position:absolute;left:50%;bottom:1.25rem;display:flex;align-items:center;gap:.55rem;transform:translateX(-50%);color:var(--slate);font:700 .72rem/1 var(--display);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;opacity:.8;animation:fx-cue 2.4s ease-in-out infinite}' +
    '.fx-scroll-cue::after{content:"";width:.45rem;height:.45rem;border-right:2px solid var(--marigold);border-bottom:2px solid var(--marigold);transform:rotate(45deg) translateY(-2px)}' +
    '@keyframes fx-cue{50%{transform:translate(-50%,.35rem);opacity:.45}}' +
    '.fx-cursor{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(255,255,255,.45);border-radius:50%;pointer-events:none;z-index:9999;opacity:0;transition:opacity .25s,width .2s,height .2s,margin .2s,background .2s;mix-blend-mode:difference}' +
    '.fx-cursor.on{opacity:1}' +
    '.fx-cursor.hot{width:56px;height:56px;margin:-28px 0 0 -28px;background:rgba(255,255,255,.12)}';
  document.head.appendChild(style);

  // ---------- Ambient hero visuals ----------
  if (hero) {
    var particles = document.createElement('div');
    particles.className = 'fx-particles';
    particles.setAttribute('aria-hidden', 'true');
    var colors = ['#F2B632', '#3B5AA3', '#FFFFFF'];
    for (var particleIndex = 0; particleIndex < 18; particleIndex += 1) {
      var particle = document.createElement('span');
      particle.className = 'fx-particle';
      particle.style.setProperty('--left', ((particleIndex * 37) % 97) + '%');
      particle.style.setProperty('--top', ((particleIndex * 61) % 92) + '%');
      particle.style.setProperty('--size', (3 + (particleIndex % 4) * 2) + 'px');
      particle.style.setProperty('--color', colors[particleIndex % colors.length]);
      particle.style.setProperty('--opacity', (0.18 + (particleIndex % 4) * 0.08).toFixed(2));
      particle.style.setProperty('--duration', (4.5 + (particleIndex % 5) * 1.1) + 's');
      particle.style.setProperty('--delay', (-particleIndex * 0.35) + 's');
      particle.style.setProperty('--drift-x', ((particleIndex % 2 ? 1 : -1) * (8 + particleIndex % 5 * 5)) + 'px');
      particle.style.setProperty('--drift-y', (-10 - particleIndex % 4 * 8) + 'px');
      particles.appendChild(particle);
    }
    hero.insertBefore(particles, hero.firstChild);
    var scene = document.createElement('div');
    scene.className = 'fx-3d-scene';
    scene.setAttribute('aria-hidden', 'true');
    var cube = document.createElement('div');
    cube.className = 'fx-cube';
    for (var faceIndex = 0; faceIndex < 6; faceIndex += 1) {
      var face = document.createElement('span');
      face.className = 'fx-cube-face';
      cube.appendChild(face);
    }
    for (var orbitIndex = 0; orbitIndex < 3; orbitIndex += 1) {
      var orbit = document.createElement('span');
      orbit.className = 'fx-orbit fx-orbit-' + String.fromCharCode(97 + orbitIndex);
      orbit.setAttribute('aria-hidden', 'true');
      scene.appendChild(orbit);
    }
    var gridPlane = document.createElement('div');
    gridPlane.className = 'fx-grid-plane';
    gridPlane.setAttribute('aria-hidden', 'true');
    scene.appendChild(gridPlane);
    var hud = document.createElement('div');
    hud.className = 'fx-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<strong>System online</strong><em>Performance</em><span class="fx-hud-bar"></span><em>Signal stable</em><span class="fx-hud-bar"></span>';
    scene.appendChild(hud);
    scene.appendChild(cube);
    hero.insertBefore(scene, hero.firstChild);
    var scrollCue = document.createElement('div');
    scrollCue.className = 'fx-scroll-cue';
    scrollCue.textContent = 'Scroll to explore';
    scrollCue.setAttribute('aria-hidden', 'true');
    hero.appendChild(scrollCue);
  }

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
      var scene = hero.querySelector('.fx-3d-scene');
      if (scene) {
        scene.style.setProperty('--cube-tilt-x', ((e.clientY - box.top) / box.height * -8 + 4).toFixed(1) + 'deg');
        scene.style.setProperty('--cube-tilt-y', ((e.clientX - box.left) / box.width * 10 - 5).toFixed(1) + 'deg');
      }
    });
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--glow', 0);
      if (portrait) {
        portrait.style.setProperty('--tx', '0px');
        portrait.style.setProperty('--ty', '0px');
      }
      var scene = hero.querySelector('.fx-3d-scene');
      if (scene) {
        scene.style.setProperty('--cube-tilt-x', '0deg');
        scene.style.setProperty('--cube-tilt-y', '0deg');
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
