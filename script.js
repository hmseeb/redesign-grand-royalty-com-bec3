/* ==========================================================================
   GRANDROYALTYLLC — site interactions
   Progressive enhancement only: every feature degrades gracefully and the
   contact form submits normally (full page POST) when JS is unavailable.
   ========================================================================== */
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://vision.leadrai.com/api/forms/d6f8fe64d2c4ef9b7cee19921cd5ef80';

  /* ---------------------------------------------------------------- year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------- _page hidden */
  var pageField = document.getElementById('pageField');
  if (pageField) pageField.value = window.location.href;

  /* ------------------------------------------------------- mobile nav */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ------------------------------------------------- sticky header state */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------ reveal on scroll */
  var revealTargets = document.querySelectorAll(
    '.card, .step, .why-list li, .quote, .faq details, .stat, .services-cta, .review-invite'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add('reveal');
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    Array.prototype.forEach.call(revealTargets, function (el) {
      io.observe(el);
    });
  }

  /* ================================================================ form */
  var form = document.getElementById('quote-form');
  var successBox = document.getElementById('formSuccess');
  var errorBox = document.getElementById('formError');
  var submitBtn = document.getElementById('submitBtn');

  function showSuccess(scroll) {
    if (!successBox) return;
    successBox.hidden = false;
    if (form) form.hidden = true;
    if (scroll) {
      try {
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        successBox.scrollIntoView();
      }
    }
  }

  /* Confirmation after a plain (non-JS) HTML submission: ?submitted=1 */
  (function handleSubmittedParam() {
    var search = window.location.search || '';
    if (search.indexOf('submitted=1') === -1) return;
    showSuccess(true);
  })();

  function setError(message) {
    if (!errorBox) return;
    if (!message) {
      errorBox.hidden = true;
      errorBox.textContent = '';
      return;
    }
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearFieldError(field) {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    var msg = field.parentNode.querySelector('.field-msg');
    if (msg) msg.parentNode.removeChild(msg);
  }

  function markFieldError(field, message) {
    field.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');
    if (field.parentNode.querySelector('.field-msg')) return;
    var p = document.createElement('p');
    p.className = 'field-msg';
    p.textContent = message;
    field.parentNode.appendChild(p);
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function validate() {
    if (!form) return true;
    var ok = true;
    var firstBad = null;
    var required = form.querySelectorAll('[required]');

    Array.prototype.forEach.call(required, function (field) {
      clearFieldError(field);
      var value = (field.value || '').trim();

      if (!value) {
        markFieldError(field, 'This field is required.');
        ok = false;
        if (!firstBad) firstBad = field;
        return;
      }

      if (field.type === 'email' && !EMAIL_RE.test(value)) {
        markFieldError(field, 'Please enter a valid email address.');
        ok = false;
        if (!firstBad) firstBad = field;
        return;
      }

      if (field.type === 'tel') {
        var digits = value.replace(/[^0-9]/g, '');
        if (digits.length < 10) {
          markFieldError(field, 'Please enter a complete phone number.');
          ok = false;
          if (!firstBad) firstBad = field;
        }
      }
    });

    if (!ok) {
      setError('Please correct the highlighted fields and try again.');
      if (firstBad) firstBad.focus();
    } else {
      setError('');
    }

    return ok;
  }

  if (form) {
    /* live clearing of errors as the visitor types */
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('invalid')) clearFieldError(t);
    });

    form.addEventListener('submit', function (e) {
      /* keep _page current at submit time too */
      if (pageField) pageField.value = window.location.href;

      if (!validate()) {
        e.preventDefault();
        return;
      }

      /* honeypot: silently drop bot submissions */
      var gotcha = form.querySelector('[name="_gotcha"]');
      if (gotcha && (gotcha.value || '').trim() !== '') {
        e.preventDefault();
        showSuccess(false);
        return;
      }

      /* No fetch support? let the browser do a normal POST. */
      if (typeof window.fetch !== 'function' || typeof window.FormData !== 'function') {
        return;
      }

      e.preventDefault();

      var data = {};
      var fd = new FormData(form);
      fd.forEach(function (value, key) {
        data[key] = typeof value === 'string' ? value : String(value);
      });
      data._page = window.location.href;

      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      setError('');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return { ok: res.ok };
            })
            .then(function (body) {
              if (res.ok && (!body || body.ok !== false)) return true;
              throw new Error('Submission failed');
            });
        })
        .then(function () {
          showSuccess(true);
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel || 'Send my request';
          }
          setError(
            'Sorry, something went wrong sending your request. Please try again, or email us at info@grandroyaltyllc.com.'
          );
        });
    });
  }

  /* ----------------------------------- prevent past dates in date picker */
  var dateField = document.getElementById('f-date');
  if (dateField) {
    var now = new Date();
    var m = String(now.getMonth() + 1);
    var d = String(now.getDate());
    if (m.length < 2) m = '0' + m;
    if (d.length < 2) d = '0' + d;
    dateField.min = now.getFullYear() + '-' + m + '-' + d;
  }
})();
