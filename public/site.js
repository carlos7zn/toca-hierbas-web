/* Shared public-site behavior. No account or community code runs here. */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const readTheme = () => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  };
  function applyTheme(theme, save = false) {
    root.dataset.theme = theme;
    themeButton?.setAttribute("aria-pressed", String(theme === "dark"));
    themeButton?.setAttribute(
      "aria-label",
      theme === "dark" ? "Activar tema claro" : "Activar tema oscuro",
    );
    if (save) {
      try {
        localStorage.setItem("theme", theme);
      } catch {}
    }
  }
  applyTheme(readTheme() || (systemTheme.matches ? "dark" : "light"));
  themeButton?.addEventListener("click", () =>
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true),
  );
  systemTheme.addEventListener("change", () => {
    if (!readTheme()) applyTheme(systemTheme.matches ? "dark" : "light");
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const menu = document.getElementById("site-links");
  const menuButton = document.getElementById("menu-toggle");
  function closeMenu() {
    menu?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menu?.classList.toggle("is-open", open);
  });
  menu
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);

  // Elements remain readable if animation or JavaScript is unavailable.
  const observed = new WeakSet();
  function enter(element) {
    element.classList.add("is-visible");
    if (reducedMotion.matches || !element.animate) return;
    const group = element.matches("section, article, .story-item")
      ? [...element.children].filter((child) => !child.matches("script,style"))
      : [element];
    group.forEach((part, index) => {
      if (part.matches("canvas,.game-area,.game-wrap")) return;
      part.animate(
        [
          {
            opacity: 0,
            transform: `translateY(${element.classList.contains("scale") ? 12 : 22}px)`,
          },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 680,
          delay: Math.min(index, 4) * 65,
          easing: "cubic-bezier(.22,1,.36,1)",
          fill: "backwards",
        },
      );
    });
  }
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                enter(entry.target);
              }
            });
          },
          { threshold: 0.08 },
        )
      : null;
  window.observeReveals = (scope = document) =>
    scope.querySelectorAll(".reveal").forEach((element) => {
      if (observed.has(element) || element.parentElement.closest(".reveal"))
        return;
      observed.add(element);
      if (observer) observer.observe(element);
      else enter(element);
    });
  window.observeReveals();

  const progress = document.getElementById("scroll-progress");
  const leaf = document.querySelector(".hero-leaf");
  let scheduled = false;
  const updateScroll = () => {
    scheduled = false;
    const distance = root.scrollHeight - innerHeight;
    if (progress)
      progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
    if (leaf && !reducedMotion.matches)
      leaf.style.transform = `translateY(${Math.min(scrollY, 650) * 0.055}px) rotate(${Math.min(scrollY, 650) * -0.012}deg)`;
  };
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateScroll);
      }
    },
    { passive: true },
  );
  updateScroll();

  document.querySelectorAll(".faq-item").forEach((item, index) => {
    const button = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");
    if (!button || !answer) return;
    answer.id ||= `faq-answer-${index}`;
    answer.hidden = true;
    button.setAttribute("aria-controls", answer.id);
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      answer.hidden = !open;
      item.classList.toggle("open", open);
      if (open && !reducedMotion.matches)
        answer.animate(
          [
            { opacity: 0, transform: "translateY(-6px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 220, easing: "ease-out" },
        );
    });
  });

  const search = document.getElementById("game-search");
  search?.addEventListener("input", () => {
    const term = search.value.trim().toLocaleLowerCase("es");
    let count = 0;
    document.querySelectorAll(".game-card").forEach((card) => {
      card.hidden = !card.textContent.toLocaleLowerCase("es").includes(term);
      if (!card.hidden) count++;
    });
    const empty = document.getElementById("games-empty");
    if (empty) empty.hidden = count > 0;
  });

  async function loadDiscord() {
    const numbers = document.querySelectorAll(
      "[data-online], #stat-online, #stat-online-hero",
    );
    if (!numbers.length) return;
    try {
      const response = await fetch(
        "https://discord.com/api/guilds/1307129882215579749/widget.json",
        { signal: AbortSignal.timeout(7000) },
      );
      if (!response.ok) throw new Error("Discord unavailable");
      const data = await response.json();
      numbers.forEach((element) => {
        element.textContent =
          typeof data.presence_count === "number" ? data.presence_count : "—";
      });
      const channels = document.getElementById("live-channels");
      if (channels) {
        channels.replaceChildren();
        (data.channels || []).slice(0, 3).forEach((channel) => {
          const label = document.createElement("span");
          label.textContent = channel.name;
          channels.append(label);
        });
      }
      const status = document.getElementById("discord-status");
      if (status) status.textContent = "Conectados ahora en Discord";
    } catch {
      numbers.forEach((element) => {
        element.textContent = "—";
      });
      const status = document.getElementById("discord-status");
      if (status) status.textContent = "Consulta quién está dentro en Discord";
    }
  }
  loadDiscord();

  const gameArea = document.getElementById("game-area");
  const startButton = document.getElementById("game-start");
  if (gameArea && startButton) {
    const scoreElement = document.getElementById("game-score");
    const timeElement = document.getElementById("game-time");
    let score = 0,
      remaining = 20,
      spawnTimer,
      clockTimer;
    function stop() {
      clearInterval(spawnTimer);
      clearInterval(clockTimer);
    }
    function spawn() {
      const target = document.createElement("button");
      target.type = "button";
      target.className = "grass-target";
      target.setAttribute("aria-label", "Atrapar hoja");
      target.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21C12 11 3 15 3 4c8 0 9 8 9 13C12 7 15 2 22 2c0 12-10 10-10 19Z"/></svg>';
      target.style.left =
        Math.random() * Math.max(gameArea.clientWidth - 44, 0) + "px";
      target.style.top =
        Math.random() * Math.max(gameArea.clientHeight - 44, 0) + "px";
      target.addEventListener("click", () => {
        scoreElement.textContent = ++score;
        target.remove();
      });
      gameArea.append(target);
      setTimeout(() => target.remove(), 1000);
    }
    startButton.addEventListener("click", () => {
      stop();
      score = 0;
      remaining = 20;
      scoreElement.textContent = "0";
      timeElement.textContent = "20";
      gameArea.replaceChildren();
      startButton.disabled = true;
      startButton.textContent = "Jugando…";
      spawnTimer = setInterval(spawn, 550);
      spawn();
      clockTimer = setInterval(() => {
        timeElement.textContent = --remaining;
        if (remaining <= 0) {
          stop();
          const message = document.createElement("div");
          message.className = "game-empty";
          message.textContent = `${score} hojas. ¿Otra ronda?`;
          gameArea.replaceChildren(message);
          startButton.disabled = false;
          startButton.textContent = "Jugar de nuevo";
        }
      }, 1000);
    });
    addEventListener("pagehide", stop);
  }
})();
