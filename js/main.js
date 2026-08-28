/* Сайт-визитка Анжелы Воропиновой — интерактив без зависимостей */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Строки интерфейса по языку страницы / מחרוזות ממשק לפי שפת הדף */
  var LANG = (document.documentElement.lang || 'ru').toLowerCase() === 'he' ? 'he' : 'ru';
  var T = {
    ru: {
      fill: 'Пожалуйста, заполните все поля.',
      sending: 'Спасибо! Открываю почтовый клиент…',
      subject: 'Заявка на экскурсию с сайта',
      name: 'Имя', contact: 'Контакт'
    },
    he: {
      fill: 'נא למלא את כל השדות.',
      sending: 'תודה! פותח את תוכנת הדוא״ל…',
      subject: 'פנייה לסיור מהאתר',
      name: 'שם', contact: 'פרטי קשר'
    }
  }[LANG];

  /* Год в подвале */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Мобильное меню */
  var burger = $('#burger');
  var links = $('#navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () { links.classList.toggle('open'); });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  /* Тень у шапки и кнопка «наверх/написать» */
  var nav = $('#nav');
  var fab = $('.fab');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (fab) fab.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Появление блоков при прокрутке */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = $$('.section, .cta, .card, .feat, .quote, .stats');
  if ('IntersectionObserver' in window && !reduced) {
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Счётчики в первом экране */
  var counters = $$('.stats b');
  function runCounters() {
    counters.forEach(function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduced) { el.textContent = to; return; }
      var start = null;
      var dur = 1100;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step); else el.textContent = to;
      }
      requestAnimationFrame(step);
    });
  }
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { runCounters(); obs.disconnect(); }
    }, { threshold: 0.4 });
    co.observe($('.stats'));
  } else {
    runCounters();
  }

  /* FAQ: открыт только один пункт */
  var items = $$('.acc details');
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Форма заявки — клиентская валидация + подготовка письма */
  var form = $('#form');
  var note = $('#formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('input, textarea', form);
      var ok = true;
      fields.forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle('err', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        note.textContent = T.fill;
        return;
      }
      var data = new FormData(form);
      var body =
        T.name + ': ' + data.get('name') + '\n' +
        T.contact + ': ' + data.get('contact') + '\n\n' +
        data.get('msg');
      note.textContent = T.sending;
      window.location.href =
        'mailto:angelavoropin@gmail.com' +
        '?subject=' + encodeURIComponent(T.subject) +
        '&body=' + encodeURIComponent(body);
      form.reset();
    });
    $$('input, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('err'); note.textContent = ''; });
    });
  }
})();
