(function () {
  "use strict";

  var S = window.SITE || {};
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- Header & footer ---------- */

  var NAV = [
    { href: "index.html", label: "Početna", key: "home" },
    { href: "kupi-biznis.html", label: "Kupi biznis", key: "kupi" },
    { href: "prodaj-biznis.html", label: "Prodaj biznis", key: "prodaj" },
    { href: "o-nama.html", label: "O nama", key: "onama" },
    { href: "kontakt.html", label: "Kontakt", key: "kontakt" }
  ];

  var header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML =
      '<div class="wrap">' +
        '<a class="logo" href="index.html" aria-label="Prodaj biznis — početna"><img src="assets/img/logo.svg" alt="Prodaj biznis" width="258" height="66"></a>' +
        '<button class="nav-toggle" aria-label="Meni" aria-expanded="false" aria-controls="nav"><span></span></button>' +
        '<nav class="nav" id="nav" aria-label="Glavni meni">' +
          NAV.slice(0, 4).map(function (n) {
            return '<a href="' + n.href + '"' + (n.key === page ? ' aria-current="page"' : "") + ">" + n.label + "</a>";
          }).join("") +
          '<a class="btn" href="kontakt.html"' + (page === "kontakt" ? ' aria-current="page"' : "") + '>Kontakt <span class="arrow">→</span></a>' +
        "</nav>" +
      "</div>";

    var toggle = header.querySelector(".nav-toggle");
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div><p class="h3" style="max-width:14ch;margin:0">Pravi biznis. Pravi kupac. Bez buke.</p></div>' +
          '<div><h4>Stranice</h4><ul>' + NAV.map(function (n) { return '<li><a href="' + n.href + '">' + n.label + "</a></li>"; }).join("") + "</ul></div>" +
          '<div><h4>Kontakt</h4><ul>' +
            '<li><a href="tel:' + S.phoneHref + '">' + S.phone + "</a></li>" +
            '<li><a href="mailto:' + S.email + '">' + S.email + "</a></li>" +
            "<li>" + S.city + "</li>" +
          "</ul></div>" +
          '<div><h4>Pratite nas</h4><ul>' +
            '<li><a href="' + S.instagram + '" target="_blank" rel="noopener">Instagram ' + S.instagramHandle + "</a></li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="footer-logo"><img src="assets/img/logo-white.svg" alt="" width="258" height="66"></div>' +
        '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + " Prodaj biznis. Sva prava zadržana.</span><span>Diskretno posredovanje u kupoprodaji biznisa</span></div>" +
      "</div>";
  }

  /* ---------- Reveal on scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Pomoćne ---------- */

  var fmt = new Intl.NumberFormat("sr-RS");
  function eur(n) { return fmt.format(n) + " €"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var LISTINGS = window.LISTINGS || [];

  function cardHTML(l) {
    var reserved = l.status === "rezervisano";
    return (
      '<button type="button" class="card' + (reserved ? " is-reserved" : "") + '" data-id="' + l.id + '" aria-label="' + esc(l.title) + ', detalji">' +
        '<div class="card__top"><span class="card__id">' + l.id + "</span>" +
          '<span class="tag' + (reserved ? " tag--solid" : "") + '">' + (reserved ? "Rezervisano" : esc(l.category)) + "</span></div>" +
        '<h3 class="card__title">' + esc(l.title) + "</h3>" +
        '<div class="card__meta"><span>' + esc(l.city) + "</span><span>od " + l.founded + ".</span><span>" + l.employees + " zaposl.</span></div>" +
        '<p class="card__desc">' + esc(l.desc) + "</p>" +
        '<div class="card__stats"><div><small>Godišnji promet</small><strong>' + eur(l.revenue) + "</strong></div>" +
          "<div><small>Neto dobit</small><strong>" + eur(l.profit) + "</strong></div></div>" +
        '<div class="card__price"><strong>' + eur(l.price) + '</strong><span class="go" aria-hidden="true">→</span></div>' +
      "</button>"
    );
  }

  /* ---------- Modal sa detaljima ---------- */

  var modal = null;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("dialog");
    modal.className = "modal";
    modal.setAttribute("aria-labelledby", "modal-title");
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) {
      var r = modal.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
    });
    return modal;
  }

  function openListing(id) {
    var l = LISTINGS.filter(function (x) { return x.id === id; })[0];
    if (!l) return;
    var m = ensureModal();
    var reserved = l.status === "rezervisano";
    var margin = Math.round((l.profit / l.revenue) * 100);
    m.innerHTML =
      '<button class="modal__close" aria-label="Zatvori">×</button>' +
      '<div class="modal__inner">' +
        '<div class="modal__main">' +
          '<div class="card__top" style="justify-content:flex-start;gap:12px"><span class="tag tag--solid">' + l.id + '</span><span class="tag">' + esc(l.category) + "</span>" + (reserved ? '<span class="tag">Rezervisano</span>' : "") + "</div>" +
          '<h2 id="modal-title">' + esc(l.title) + "</h2>" +
          '<p class="lead" style="max-width:none">' + esc(l.desc) + "</p>" +
          '<p class="eyebrow mt-m">Ulazi u prodaju</p>' +
          '<div class="includes">' + l.includes.map(function (i) { return '<span class="tag">' + esc(i) + "</span>"; }).join("") + "</div>" +
          '<p class="muted mt-m" style="font-size:14px">Naziv firme i tačna lokacija otkrivaju se ozbiljnim kupcima nakon potpisivanja izjave o poverljivosti.</p>' +
        "</div>" +
        '<div class="modal__side">' +
          '<div><small class="eyebrow" style="color:var(--grey-2)">Tražena cena</small><div class="modal__price mt-s">' + eur(l.price) + "</div></div>" +
          '<ul class="spec">' +
            "<li><span>Grad</span><strong>" + esc(l.city) + "</strong></li>" +
            "<li><span>Osnovan</span><strong>" + l.founded + ".</strong></li>" +
            "<li><span>Zaposleni</span><strong>" + l.employees + "</strong></li>" +
            "<li><span>Godišnji promet</span><strong>" + eur(l.revenue) + "</strong></li>" +
            "<li><span>Neto dobit</span><strong>" + eur(l.profit) + "</strong></li>" +
            "<li><span>Marža</span><strong>" + margin + "%</strong></li>" +
          "</ul>" +
          '<a class="btn btn--white" href="kontakt.html?oglas=' + l.id + '">Pošalji upit <span class="arrow">→</span></a>' +
        "</div>" +
      "</div>";
    m.querySelector(".modal__close").addEventListener("click", function () { m.close(); });
    if (typeof m.showModal === "function") m.showModal(); else m.setAttribute("open", "");
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest(".card[data-id]");
    if (card) openListing(card.getAttribute("data-id"));
  });

  /* ---------- Istaknuti oglasi (početna) ---------- */

  var featured = document.getElementById("featured-listings");
  if (featured) {
    featured.innerHTML = LISTINGS.filter(function (l) { return l.featured; }).slice(0, 6).map(cardHTML).join("");
  }
  var countEl = document.querySelectorAll("[data-listing-count]");
  countEl.forEach(function (el) { el.textContent = LISTINGS.filter(function (l) { return l.status === "aktivno"; }).length; });

  /* ---------- Svi oglasi + filteri ---------- */

  var all = document.getElementById("all-listings");
  if (all) {
    var q = document.getElementById("f-q");
    var cat = document.getElementById("f-cat");
    var city = document.getElementById("f-city");
    var price = document.getElementById("f-price");
    var sort = document.getElementById("f-sort");
    var count = document.getElementById("results-count");
    var chips = document.getElementById("chips");

    function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }).sort(function (a, b) { return a.localeCompare(b, "sr"); }); }
    uniq(LISTINGS.map(function (l) { return l.category; })).forEach(function (c) { cat.insertAdjacentHTML("beforeend", "<option>" + esc(c) + "</option>"); });
    uniq(LISTINGS.map(function (l) { return l.city; })).forEach(function (c) { city.insertAdjacentHTML("beforeend", "<option>" + esc(c) + "</option>"); });

    var activeOnly = false;
    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      if (b.dataset.reset !== undefined) {
        q.value = ""; cat.value = ""; city.value = ""; price.value = ""; sort.value = "new";
        activeOnly = false;
        chips.querySelector('[data-active]').setAttribute("aria-pressed", "false");
      } else {
        activeOnly = !activeOnly;
        b.setAttribute("aria-pressed", activeOnly ? "true" : "false");
      }
      render();
    });

    function render() {
      var term = q.value.trim().toLowerCase();
      var max = parseInt(price.value, 10) || Infinity;
      var list = LISTINGS.filter(function (l) {
        if (cat.value && l.category !== cat.value) return false;
        if (city.value && l.city !== city.value) return false;
        if (l.price > max) return false;
        if (activeOnly && l.status !== "aktivno") return false;
        if (term && (l.title + " " + l.desc + " " + l.category + " " + l.city + " " + l.id).toLowerCase().indexOf(term) === -1) return false;
        return true;
      });
      var s = sort.value;
      list = list.slice().sort(function (a, b) {
        if (s === "price-asc") return a.price - b.price;
        if (s === "price-desc") return b.price - a.price;
        if (s === "profit") return b.profit - a.profit;
        return b.id.localeCompare(a.id);
      });
      count.textContent = list.length + (list.length === 1 ? " biznis" : " biznisa");
      all.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : "";
      document.getElementById("empty").hidden = list.length > 0;
      all.hidden = list.length === 0;
    }

    [q, cat, city, price, sort].forEach(function (el) { el.addEventListener("input", render); });
    render();

    var params = new URLSearchParams(location.search);
    if (params.get("oglas")) openListing(params.get("oglas"));
  }

  /* ---------- Rilsovi ---------- */

  var reelsTrack = document.getElementById("reels-track");
  if (reelsTrack) {
    var REELS = window.REELS || [];
    if (REELS.length) {
      reelsTrack.innerHTML = REELS.map(function (url, i) {
        var m = String(url).match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
        if (!m) return "";
        return '<div class="reel"><iframe src="https://www.instagram.com/reel/' + m[1] + '/embed" loading="lazy" title="Instagram rils ' + (i + 1) + '" allowfullscreen></iframe></div>';
      }).join("");
    } else {
      var titles = ["Kako se procenjuje vrednost biznisa", "5 grešaka pre prodaje", "Šta kupac prvo pita", "Kako izgleda primopredaja", "Kupiti ili otvoriti novo?", "Zašto diskrecija znači sve"];
      reelsTrack.innerHTML = titles.map(function (t, i) {
        return '<a class="reel reel--placeholder" href="' + S.instagram + '" target="_blank" rel="noopener">' +
          '<span class="reel__handle">' + S.instagramHandle + " · 0" + (i + 1) + "</span>" +
          '<span class="reel__play" aria-hidden="true"></span>' +
          '<span class="reel__title">' + t + "</span>" +
        "</a>";
      }).join("");
    }

    var step = function () {
      var first = reelsTrack.querySelector(".reel");
      return first ? first.getBoundingClientRect().width + 20 : 300;
    };
    var prev = document.getElementById("reels-prev");
    var next = document.getElementById("reels-next");
    function go(dir) {
      var atEnd = reelsTrack.scrollLeft + reelsTrack.clientWidth >= reelsTrack.scrollWidth - 4;
      if (dir > 0 && atEnd) reelsTrack.scrollTo({ left: 0, behavior: "smooth" });
      else reelsTrack.scrollBy({ left: dir * step(), behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    // Lagano automatsko pomeranje; pauza kad je kursor iznad ili kartica nije vidljiva
    var paused = false;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reelsTrack.addEventListener("mouseenter", function () { paused = true; });
    reelsTrack.addEventListener("mouseleave", function () { paused = false; });
    reelsTrack.addEventListener("touchstart", function () { paused = true; }, { passive: true });
    if (!reduce) setInterval(function () { if (!paused && !document.hidden) go(1); }, 4200);
  }

  /* ---------- Forme ---------- */

  function serialize(form) {
    var data = new FormData(form);
    var lines = [];
    var seen = {};
    data.forEach(function (v, k) {
      if (seen[k]) return;
      var all = data.getAll(k).filter(Boolean);
      seen[k] = true;
      if (!all.length) return;
      var label = form.querySelector('[name="' + k + '"]');
      var name = label && label.getAttribute("data-label") ? label.getAttribute("data-label") : k;
      lines.push(name + ": " + all.join(", "));
    });
    return { data: data, text: lines.join("\n") };
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var subject = form.getAttribute("data-subject") || "Upit sa sajta";
      var out = serialize(form);
      var success = document.getElementById(form.getAttribute("data-success"));
      var btn = form.querySelector('[type="submit"]');

      function done() {
        form.hidden = true;
        if (success) { success.classList.add("is-visible"); success.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }

      if (S.formEndpoint) {
        btn.disabled = true;
        btn.textContent = "Šalje se…";
        out.data.append("_subject", subject);
        fetch(S.formEndpoint, { method: "POST", body: out.data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(); done(); })
          .catch(function () {
            btn.disabled = false;
            btn.innerHTML = 'Pošalji <span class="arrow">→</span>';
            alert("Slanje nije uspelo. Pokušajte ponovo ili nam pišite na " + S.email);
          });
      } else {
        window.location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(out.text);
        done();
      }
    });
  });

  // Popuni šifru oglasa u kontakt formi
  var oglasField = document.getElementById("c-oglas");
  if (oglasField) {
    var o = new URLSearchParams(location.search).get("oglas");
    if (o) {
      oglasField.value = o;
      var l = LISTINGS.filter(function (x) { return x.id === o; })[0];
      var msg = document.getElementById("c-msg");
      if (l && msg && !msg.value) msg.value = "Zainteresovan/a sam za oglas " + l.id + " — " + l.title + ". Molim vas za više informacija.";
      var tip = document.getElementById("c-tip");
      if (tip) tip.value = "Želim da kupim biznis";
    }
  }

  // Kontakt podaci na stranici
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var k = el.getAttribute("data-site");
    if (k === "email") { el.textContent = S.email; el.href = "mailto:" + S.email; }
    if (k === "phone") { el.textContent = S.phone; el.href = "tel:" + S.phoneHref; }
    if (k === "instagram") { el.textContent = S.instagramHandle; el.href = S.instagram; }
    if (k === "city") { el.textContent = S.city; }
  });
})();
