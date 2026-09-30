document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.remove("no-js");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const header = document.querySelector(".header");
  const navMenu = document.querySelector(".nav-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".destination-card");
  const searchBtn = document.getElementById("search-btn");
  const destinationSelect = document.getElementById("destination-select");
  const searchError = document.getElementById("search-error");
  const searchResult = document.getElementById("search-result");
  const searchResultText = document.getElementById("search-result-text");
  const searchClear = document.getElementById("search-clear");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        setTimeout(() => card.classList.add("visible"), order * 100);
        order++;
        observer.unobserve(card);
      });
    },
    { root: null, rootMargin: "0px", threshold: 0.1 },
  );

  cards.forEach((card) => revealObserver.observe(card));

  const HIDE_DELAY = 300;

  function showCards(predicate) {
    let order = 0;
    cards.forEach((card) => {
      clearTimeout(card.hideTimer);

      if (predicate(card)) {
        revealObserver.unobserve(card);
        if (card.hidden) {
          card.hidden = false;
          void card.offsetWidth;
        }
        setTimeout(() => card.classList.add("visible"), order * 80);
        order++;
      } else {
        card.classList.remove("visible");
        card.hideTimer = setTimeout(() => {
          card.hidden = true;
        }, HIDE_DELAY);
      }
    });
  }

  function setActiveFilter(filterValue) {
    filterButtons.forEach((btn) => {
      const isActive = btn.getAttribute("data-filter") === filterValue;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyFilter(filterValue) {
    setActiveFilter(filterValue);
    searchResult.hidden = true;
    showCards(
      (card) =>
        filterValue === "all" ||
        card.getAttribute("data-category") === filterValue,
    );
  }

  filterButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active")),
    );
    button.addEventListener("click", () =>
      applyFilter(button.getAttribute("data-filter")),
    );
  });

  let errorTimer;

  function showSearchError() {
    destinationSelect.classList.add("error");
    destinationSelect.setAttribute("aria-invalid", "true");
    searchError.hidden = false;
    destinationSelect.focus();

    clearTimeout(errorTimer);
    errorTimer = setTimeout(clearSearchError, 3000);
  }

  function clearSearchError() {
    destinationSelect.classList.remove("error");
    destinationSelect.removeAttribute("aria-invalid");
    searchError.hidden = true;
  }

  destinationSelect.addEventListener("change", clearSearchError);

  searchBtn.addEventListener("click", () => {
    const selectedValue = destinationSelect.value;
    if (!selectedValue) {
      showSearchError();
      return;
    }

    clearSearchError();

    const target = document.querySelector(
      `.destination-card[data-destination="${selectedValue}"]`,
    );
    if (!target) return;

    setActiveFilter(null);
    showCards((card) => card === target);

    searchResultText.textContent = target.querySelector("h3").textContent;
    searchResult.hidden = false;

    document
      .getElementById("destinos")
      .scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  searchClear.addEventListener("click", () => applyFilter("all"));

  const updateHeader = () =>
    header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  menuToggle.addEventListener("click", () =>
    setMenu(!navMenu.classList.contains("open")),
  );
  navMenu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 769px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  const navLinks = document.querySelectorAll(".nav-link:not(.btn-cta)");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`,
          );
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
});
