document.addEventListener("DOMContentLoaded", () => {
  // Se o JS carregou, remove o fallback "sem JavaScript" do CSS
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

  // ANIMAÇÃO ESCALONADA DE ENTRADA DOS CARDS
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      let order = 0; // conta só quem entrou na tela, para o escalonamento ficar uniforme
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

  // EXIBIÇÃO DOS CARDS (usada pelos filtros e pela busca)
  // Usa classes e o atributo hidden (sem style inline), para o hover do card continuar funcionando.
  const HIDE_DELAY = 300;

  function showCards(predicate) {
    let order = 0;
    cards.forEach((card) => {
      clearTimeout(card.hideTimer);

      if (predicate(card)) {
        revealObserver.unobserve(card); // aqui a exibição é controlada manualmente
        if (card.hidden) {
          card.hidden = false;
          void card.offsetWidth; // força o layout antes da transição
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

  // BUSCA RÁPIDA DO HERO
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

  // Mostra apenas o destino escolhido e leva o usuário até ele
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

    setActiveFilter(null); // nenhum filtro de categoria fica marcado durante a busca
    showCards((card) => card === target);

    searchResultText.textContent = target.querySelector("h3").textContent;
    searchResult.hidden = false;

    document
      .getElementById("destinos")
      .scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  // "Ver todos os destinos" desfaz a busca
  searchClear.addEventListener("click", () => applyFilter("all"));

  // HEADER NO SCROLL (estilo definido na classe .scrolled do CSS)
  const updateHeader = () =>
    header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // MENU MOBILE
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

  // LINK ATIVO NO MENU CONFORME A SEÇÃO VISÍVEL
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
