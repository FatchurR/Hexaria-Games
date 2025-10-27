document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("instruction-modal");
  const closeButton = document.querySelector(".close-button");
  const instructionButtons = document.querySelectorAll(".instruction");

  const welcomeScreen = document.getElementById("welcome-screen");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");
  const playWithBotCheckbox = document.getElementById("play-with-bot");
  const gameLevelSelect = document.getElementById("game-level");
  const playGameButton = document.getElementById("play-game");

  const hexariaContainer = document.querySelector(".hexaria-container");
  const leaderboardContent = document.getElementById("leaderboard-content");
  const sortScoreButton = document.getElementById("sort-score");
  const player1ScoreElement = document.getElementById("player1-score");
  const player2ScoreElement = document.getElementById("player2-score");
  const currentHexagonElement = document.getElementById("current-hexagon");
  const newGameButton = document.getElementById("new-game");
  const canvas = document.getElementById("hexaria-board");
  const ctx = canvas.getContext("2d");

  let currentPlayer = "red";
  let currentHexagonValue = 1;
  let player1Score = 0;
  let player2Score = 0;
  let hexagons = [];
  const hexRadius = 25;
  const hexHeight = Math.sqrt(3) * hexRadius;
  const hexWidth = 2 * hexRadius;

  let settings = {
    level: "easy",
    player1Name: "",
    player2Name: "",
  };

  function updatePlayButtonState() {
    const p1 = player1NameInput.value.trim();
    const p2 = player2NameInput.value.trim();
    const lvl = gameLevelSelect.value;
    const withBot = playWithBotCheckbox.checked;

    playGameButton.disabled = !(p1 && lvl && (withBot || p2));
  }

  player1NameInput.addEventListener("input", updatePlayButtonState);
  player2NameInput.addEventListener("input", updatePlayButtonState);
  gameLevelSelect.addEventListener("change", updatePlayButtonState);
  playWithBotCheckbox.addEventListener("change", () => {
    player2NameInput.disabled = playWithBotCheckbox.checked;
    updatePlayButtonState();
  });

  instructionButtons.forEach((btn) => {
    btn.addEventListener("click", () => modal.classList.add("show"));
  });
  closeButton.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });

  playGameButton.addEventListener("click", () => {
    settings.player1Name = player1NameInput.value.trim();
    settings.player2Name = playWithBotCheckbox.checked
      ? "Bot"
      : player2NameInput.value.trim();
    settings.level = gameLevelSelect.value;

    document.getElementById("player1-name-display").innerText =
      settings.player1Name;
    document.getElementById("player2-name-display").innerText =
      settings.player2Name;

    welcomeScreen.style.display = "none";
    hexariaContainer.style.display = "flex";
    initializeGame(settings.level, settings.player1Name, settings.player2Name);
  });

  function drawHexagon(x, y, color, value) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.lineTo(x + hexRadius * Math.cos(angle), y + hexRadius * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();

    if (value != null) {
      ctx.fillStyle = "#111827";
      ctx.font = "bold 12px Inter, sans-serif";
      const text = String(value);
      const metrics = ctx.measureText(text);
      ctx.fillText(text, x - metrics.width / 2, y + 4);
    }
  }

  function initializeGame(level, player1Name, player2Name) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagons.length = 0;
    player1Score = 0;
    player2Score = 0;
    currentPlayer = "red";
    updateScore();
    updateTurnIndicator();

    let disabledHexagonCount = 4;
    if (level === "medium") disabledHexagonCount = 6;
    if (level === "hard") disabledHexagonCount = 8;

    const rows = 8;
    const cols = 10;
    const offsetX = (canvas.width - (cols * hexWidth * 0.75 + hexRadius * 0.25)) / 2;
    const offsetY = (canvas.height - rows * hexHeight) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth * 0.75 + hexRadius + offsetX;
        const y = row * hexHeight + (col % 2 === 0 ? hexHeight / 2 : 0) + offsetY;
        const hex = { x, y, color: "#e5e7eb", value: null, disabled: false };
        hexagons.push(hex);
        drawHexagon(x, y, hex.color, null);
      }
    }

    for (let i = 0; i < disabledHexagonCount; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * hexagons.length);
      } while (hexagons[idx].disabled);
      hexagons[idx].disabled = true;
      drawHexagon(hexagons[idx].x, hexagons[idx].y, "#d1d5db", null);
    }

    updateCurrentHexagon();
    if (player2Name === "Bot" && currentPlayer === "blue") {
      setTimeout(botMove, 600);
    }
  }

  function updateCurrentHexagon() {
    currentHexagonValue = Math.floor(Math.random() * 20) + 1;
    currentHexagonElement.innerText = `Hexagon Sekarang: ${currentPlayer === 'red' ? 'merah' : 'biru'} ${currentHexagonValue}`;
  }

  function updateTurnIndicator() {
    const el = document.getElementById("current-turn");
    el.innerText = currentPlayer === "red" ? "Giliran Player 1" : "Giliran Player 2";
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === "red" ? "blue" : "red";
    updateTurnIndicator();
  }

  function calculateScore(player) {
    return hexagons
      .filter((h) => h.color === player)
      .reduce((sum, h) => sum + (h.value || 0), 0);
  }

  function updateScore() {
    player1Score = calculateScore("red");
    player2Score = calculateScore("blue");
    player1ScoreElement.innerText = `Skor Player 1: ${player1Score}`;
    player2ScoreElement.innerText = `Skor Player 2: ${player2Score}`;
  }

  function placeHexagon(index) {
    const h = hexagons[index];
    if (h.disabled || h.color === "red" || h.color === "blue") return;

    h.color = currentPlayer;
    h.value = currentHexagonValue;
    drawHexagon(h.x, h.y, h.color, h.value);
    updateScore();

    switchPlayer();
    updateCurrentHexagon();

    if (settings.player2Name === "Bot" && currentPlayer === "blue") {
      setTimeout(botMove, 600);
    }

    checkGameOver();
  }

  function botMove() {
    const empty = hexagons.filter(
      (h) => !h.disabled && h.color !== "red" && h.color !== "blue"
    );
    if (!empty.length) return;

    const i = Math.floor(Math.random() * empty.length);
    const hex = empty[i];

    hex.color = currentPlayer;
    hex.value = currentHexagonValue;
    drawHexagon(hex.x, hex.y, hex.color, hex.value);

    updateScore();
    switchPlayer();
    updateCurrentHexagon();
    checkGameOver();
  }

  function checkGameOver() {
    const allFilled = hexagons.every(
      (h) => h.disabled || h.color === "red" || h.color === "blue"
    );
    if (!allFilled) return;

    let result = "Draw";
    if (player1Score > player2Score) result = "Player 1";
    if (player2Score > player1Score) result = "Player 2";
    showGameOver(result, player1Score, player2Score);
  }

  function showGameOver(winner, p1, p2) {
    const wrap = document.createElement("div");
    wrap.className = "game-over";
    wrap.style.position = "fixed";
    wrap.style.left = "50%";
    wrap.style.top = "50%";
    wrap.style.transform = "translate(-50%,-50%)";
    wrap.style.background = "#fff";
    wrap.style.padding = "20px";
    wrap.style.borderRadius = "12px";
    wrap.style.border = "1px solid #e5e7eb";
    wrap.style.boxShadow = "0 8px 30px rgba(2,6,23,.12)";
    wrap.style.zIndex = "1001";
    wrap.style.textAlign = "center";
    wrap.innerHTML = `
      <h2 style="margin-bottom:10px;color:#2563eb">Game Selesai!</h2>
      <p>Pemenang: ${winner === 'Player 1' ? 'Player 1' : winner === 'Player 2' ? 'Player 2' : 'Seri nih!'}</p>
      <p>Skor Player 1: ${p1}</p>
      <p>Skor Player 2: ${p2}</p>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
        <button id="restart-game" style="padding:8px 12px;border-radius:10px;background:#2563eb;color:#fff;border:none">Main Lagi</button>
        <button id="save-score" style="padding:8px 12px;border-radius:10px;background:#fff;color:#2563eb;border:1px solid #2563eb">Simpan Skor</button>
      </div>
    `;
    document.body.appendChild(wrap);

    document.getElementById("restart-game").addEventListener("click", () => {
      document.body.removeChild(wrap);
      initializeGame(settings.level, settings.player1Name, settings.player2Name);
    });
    document.getElementById("save-score").addEventListener("click", () => {
      const scoreToSave =
        winner === "Player 1" ? p1 : winner === "Player 2" ? p2 : Math.max(p1, p2);
      const nameToSave =
        winner === "Player 1"
          ? settings.player1Name
          : winner === "Player 2"
          ? settings.player2Name
          : "Draw";
      saveScore(nameToSave, scoreToSave);
      document.body.removeChild(wrap);
    });
  }

  function saveScore(username, score) {
    const list = JSON.parse(localStorage.getItem("matchHistory")) || [];
    list.push({ username, score, date: new Date().toISOString() });
    localStorage.setItem("matchHistory", JSON.stringify(list));
    updateLeaderboard();
  }

  function updateLeaderboard() {
    const list = JSON.parse(localStorage.getItem("matchHistory")) || [];
    leaderboardContent.innerHTML = "";
    list.forEach((m) => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.gap = "8px";
      item.innerHTML = `
        <span>${m.username}: ${m.score}</span>
        <button class="detail-btn" style="padding:6px 10px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;color:#1f2937;cursor:pointer">Details</button>
      `;
      item.querySelector(".detail-btn").addEventListener("click", () => {
        alert(`Nama: ${m.username}\nSkor: ${m.score}\nTanggal Main: ${new Date(m.date).toLocaleString()}`);
      });
      leaderboardContent.appendChild(item);
    });
  }

  sortScoreButton.addEventListener("click", () => {
    const list = JSON.parse(localStorage.getItem("matchHistory")) || [];
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem("matchHistory", JSON.stringify(list));
    updateLeaderboard();
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

      for (let i = 0; i < hexagons.length; i++) {
      const h = hexagons[i];
      const dist = Math.hypot(x - h.x, y - h.y);
      if (dist <= hexRadius) {
        placeHexagon(i);
        break;
      }
    }
  });

  newGameButton.addEventListener("click", () => {
    initializeGame(settings.level, settings.player1Name, settings.player2Name);
  });

  updateLeaderboard();
});
