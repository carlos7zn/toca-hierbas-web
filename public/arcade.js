(() => {
  const $ = (id) => document.getElementById(id);
  const shuffle = (values) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Memory: each round owns its timer and pending comparison.
  const board = $("game-area-adivina");
  if (board) {
    const names = [
      "Valorant",
      "League of Legends",
      "Minecraft",
      "Overwatch",
      "Fortnite",
      "Apex Legends",
      "CS2",
      "Rocket League",
      "Among Us",
      "Dead by Daylight",
      "Rainbow Six",
      "Destiny 2",
    ];
    let first = null,
      locked = false,
      pairs = 0,
      remaining = 30,
      clock = null,
      comparison = null;
    const restart = $("restart-adivina");
    const status = document.createElement("p");
    status.className = "arcade-status";
    status.setAttribute("role", "status");
    board.after(status);
    function end(won = false) {
      clearInterval(clock);
      clock = null;
      locked = true;
      status.textContent = won
        ? "Todas las parejas. Bien jugado."
        : `Tiempo terminado: ${pairs} de 12 parejas.`;
      restart.style.display = "inline-flex";
    }
    function reset() {
      clearInterval(clock);
      clearTimeout(comparison);
      clock = null;
      first = null;
      locked = false;
      pairs = 0;
      remaining = 30;
      $("pairs-found").textContent = "0";
      $("timer-adivina").textContent = "30";
      status.textContent = "El tiempo empieza al girar la primera carta.";
      restart.style.display = "none";
      board.replaceChildren();
      shuffle([...names, ...names]).forEach((name, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "memory-card";
        card.textContent = "✳";
        card.setAttribute("aria-label", `Girar carta ${index + 1}`);
        card.addEventListener("click", () => {
          if (locked || card.classList.contains("flipped") || card.disabled)
            return;
          if (!clock)
            clock = setInterval(() => {
              $("timer-adivina").textContent = --remaining;
              if (remaining <= 0) end();
            }, 1000);
          card.classList.add("flipped");
          card.textContent = name;
          card.setAttribute("aria-label", name);
          if (!first) {
            first = { card, name };
            return;
          }
          const previous = first;
          first = null;
          if (previous.name === name) {
            previous.card.disabled = true;
            card.disabled = true;
            $("pairs-found").textContent = ++pairs;
            if (pairs === names.length) end(true);
          } else {
            locked = true;
            comparison = setTimeout(() => {
              [previous.card, card].forEach((element) => {
                element.classList.remove("flipped");
                element.textContent = "✳";
                element.setAttribute("aria-label", "Girar carta");
              });
              if (remaining > 0) locked = false;
            }, 850);
          }
        });
        board.append(card);
      });
    }
    restart.addEventListener("click", reset);
    reset();
    addEventListener("pagehide", () => {
      clearInterval(clock);
      clearTimeout(comparison);
    });
  }

  const reaction = $("game-area-reaction");
  if (reaction) {
    let state = "idle",
      start = 0,
      delay,
      attempts = 0,
      best = null;
    try {
      best = Number(localStorage.getItem("bestReactionTime")) || null;
    } catch {}
    if (best) $("best-reaction").textContent = best.toFixed(2) + " s";
    reaction.setAttribute("role", "button");
    reaction.tabIndex = 0;
    reaction.setAttribute("aria-label", "Área de reacción");
    const startButton = $("start-reaction");
    function begin() {
      clearTimeout(delay);
      state = "waiting";
      reaction.classList.remove("reaction-ready");
      reaction.textContent = "Espera al verde…";
      startButton.disabled = true;
      delay = setTimeout(
        () => {
          state = "ready";
          start = performance.now();
          reaction.classList.add("reaction-ready");
          reaction.textContent = "Ahora.";
        },
        1000 + Math.random() * 2200,
      );
    }
    function react() {
      if (state === "waiting") {
        clearTimeout(delay);
        state = "idle";
        reaction.textContent = "Demasiado pronto. Prueba otra vez.";
        startButton.disabled = false;
        return;
      }
      if (state !== "ready") return;
      const seconds = (performance.now() - start) / 1000;
      state = "idle";
      reaction.classList.remove("reaction-ready");
      reaction.textContent = seconds.toFixed(3) + " s";
      $("reaction-count").textContent = ++attempts;
      startButton.disabled = false;
      if (!best || seconds < best) {
        best = seconds;
        $("best-reaction").textContent = best.toFixed(2) + " s";
        try {
          localStorage.setItem("bestReactionTime", String(best));
        } catch {}
      }
    }
    startButton.addEventListener("click", begin);
    reaction.addEventListener("click", react);
    reaction.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        react();
      }
    });
    addEventListener("pagehide", () => clearTimeout(delay));
  }

  const trivia = $("trivia-questions");
  if (trivia) {
    const questions = [
      [
        "¿En qué año salió Counter-Strike como mod de Half-Life?",
        ["1999", "2000", "2001", "1998"],
      ],
      [
        "¿Qué personaje protagoniza el primer Metal Gear Solid?",
        ["Solid Snake", "Big Boss", "Raiden", "Venom Snake"],
      ],
      [
        "¿Qué estudio desarrolló Hollow Knight?",
        ["Team Cherry", "Supergiant Games", "Motion Twin", "ConcernedApe"],
      ],
      [
        "¿Qué juego se desarrolla en la Grieta del Invocador?",
        ["League of Legends", "Valorant", "Rocket League", "Minecraft"],
      ],
      [
        "¿Cuál es el nombre del perro de Duck Hunt?",
        ["No tiene nombre oficial", "Duke", "Barker", "Rover"],
      ],
    ];
    let index = 0,
      score = 0;
    const next = $("next-trivia");
    function render() {
      trivia.replaceChildren();
      next.style.display = "none";
      $("trivia-question").textContent = index + 1;
      $("trivia-total").textContent = questions.length;
      $("trivia-score").textContent = score;
      const [question, choices] = questions[index];
      const heading = document.createElement("h3");
      heading.textContent = question;
      trivia.append(heading);
      const options = document.createElement("div");
      options.className = "trivia-options";
      trivia.append(options);
      shuffle(choices).forEach((text) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option";
        button.textContent = text;
        button.addEventListener("click", () => {
          const correct = text === choices[0];
          if (correct) $("trivia-score").textContent = ++score;
          options.querySelectorAll("button").forEach((option) => {
            option.disabled = true;
            if (option.textContent === choices[0])
              option.classList.add("correct");
          });
          if (!correct) button.classList.add("incorrect");
          next.style.display = "inline-flex";
          next.textContent =
            index === questions.length - 1 ? "Ver resultado" : "Siguiente";
        });
        options.append(button);
      });
    }
    next.addEventListener("click", () => {
      if (index === questions.length) {
        index = 0;
        score = 0;
        render();
        return;
      }
      if (++index < questions.length) render();
      else {
        trivia.replaceChildren();
        const result = document.createElement("h3");
        result.textContent = `${score} de ${questions.length}. ¿Otra ronda?`;
        result.setAttribute("role", "status");
        trivia.append(result);
        next.textContent = "Jugar de nuevo";
      }
    });
    render();
  }
})();
