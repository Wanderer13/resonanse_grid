(() => {
  const boardEl = document.getElementById("board");
  const waveLayer = document.getElementById("waveLayer");
  const pulseLayer = document.getElementById("pulseLayer");
  const levelLabel = document.getElementById("levelLabel");
  const levelName = document.getElementById("levelName");
  const statusEl = document.getElementById("status");
  const winOverlay = document.getElementById("winOverlay");
  const winText = document.getElementById("winText");
  const continueBtn = document.getElementById("continueBtn");
  const checkBtn = document.getElementById("checkBtn");
  const hintBtn = document.getElementById("hintBtn");
  const rulesDialog = document.getElementById("rulesDialog");

  let levelIndex = 0;
  let size = 0;
  let walls = new Set();
  let grid = [];
  let target = { rows: [], cols: [] };
  let solution = [];
  let locked = new Set();
  let solved = false;

  function key(x, y) {
    return `${x},${y}`;
  }

  function emptyGrid(n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
  }

  function isWall(x, y, wallSet = walls) {
    return wallSet.has(key(x, y));
  }

  function wallSetFrom(level) {
    return new Set((level.walls || []).map(({ x, y }) => key(x, y)));
  }

  function lineInteractions(cells) {
    const pairs = [];
    let score = 0;
    let last = null;

    cells.forEach((cell, index) => {
      if (cell.wall) {
        last = null;
        return;
      }
      if (!cell.freq) return;

      if (last) {
        const resonance = last.freq === cell.freq;
        const value = resonance ? last.freq : 0;
        score += value;
        pairs.push({
          from: last.index,
          to: index,
          freqA: last.freq,
          freqB: cell.freq,
          resonance,
          value
        });
      }
      last = { index, freq: cell.freq };
    });

    return { score, pairs };
  }

  function analyze(sourceGrid, wallSet, n) {
    const rows = [];
    const cols = [];
    const rowPairs = [];
    const colPairs = [];

    for (let y = 0; y < n; y++) {
      const cells = [];
      for (let x = 0; x < n; x++) {
        cells.push({
          freq: sourceGrid[y][x],
          wall: wallSet.has(key(x, y))
        });
      }
      const result = lineInteractions(cells);
      rows.push(result.score);
      result.pairs.forEach((pair) => {
        rowPairs.push({
          ...pair,
          y,
          x1: pair.from,
          x2: pair.to
        });
      });
    }

    for (let x = 0; x < n; x++) {
      const cells = [];
      for (let y = 0; y < n; y++) {
        cells.push({
          freq: sourceGrid[y][x],
          wall: wallSet.has(key(x, y))
        });
      }
      const result = lineInteractions(cells);
      cols.push(result.score);
      result.pairs.forEach((pair) => {
        colPairs.push({
          ...pair,
          x,
          y1: pair.from,
          y2: pair.to
        });
      });
    }

    return { rows, cols, rowPairs, colPairs };
  }

  function cluesMatch(current) {
    return (
      current.rows.every((value, i) => value === target.rows[i]) &&
      current.cols.every((value, i) => value === target.cols[i])
    );
  }

  function cellCenter(x, y) {
    const cell = boardEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    const wrap = boardEl.parentElement;
    if (!cell || !wrap) return { x: 0, y: 0 };
    const cr = cell.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    return {
      x: cr.left - wr.left + cr.width / 2,
      y: cr.top - wr.top + cr.height / 2,
      size: cr.width
    };
  }

  function freqClass(freq) {
    return freq ? `freq-${freq}` : "";
  }

  function setSolvedUi(isSolved) {
    continueBtn.classList.toggle("hidden", !isSolved);
    checkBtn.disabled = isSolved;
    hintBtn.disabled = isSolved;
  }

  function render() {
    const current = analyze(grid, walls, size);
    const matched = cluesMatch(current);

    boardEl.style.gridTemplateColumns = `var(--cell-size, 56px) repeat(${size}, var(--cell-size, 56px))`;
    boardEl.replaceChildren();

    const corner = document.createElement("div");
    boardEl.appendChild(corner);

    for (let x = 0; x < size; x++) {
      const clue = document.createElement("div");
      clue.className = "clue" + (current.cols[x] === target.cols[x] ? " match" : "");
      clue.textContent = target.cols[x];
      boardEl.appendChild(clue);
    }

    for (let y = 0; y < size; y++) {
      const rowClue = document.createElement("div");
      rowClue.className = "clue" + (current.rows[y] === target.rows[y] ? " match" : "");
      rowClue.textContent = target.rows[y];
      boardEl.appendChild(rowClue);

      for (let x = 0; x < size; x++) {
        const cell = document.createElement("button");
        cell.type = "button";
        const wall = isWall(x, y);
        const freq = grid[y][x];
        const isLocked = locked.has(key(x, y));
        cell.className = `cell ${wall ? "wall" : "playable"} ${freqClass(freq)}${isLocked ? " locked" : ""}`;
        cell.disabled = wall;
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);

        if (wall) {
          cell.textContent = "🌳";
          cell.setAttribute("aria-label", "Дерево");
        } else {
          const mark = document.createElement("span");
          mark.className = "giraffe" + (freq ? ` size-${freq}` : "");
          if (freq) {
            const icon = document.createElement("span");
            icon.className = "giraffe-icon";
            icon.textContent = "🦒";
            const num = document.createElement("span");
            num.className = "giraffe-num";
            num.textContent = String(freq);
            mark.append(icon, num);
          }
          cell.appendChild(mark);
          if (isLocked) {
            cell.setAttribute(
              "aria-label",
              freq ? `Подсказка: жираф роста ${freq}` : "Подсказка: пустая клетка"
            );
          } else {
            cell.setAttribute("aria-label", freq ? `Жираф роста ${freq}` : "Пустая клетка");
          }
          cell.addEventListener("click", () => onCellClick(x, y));
        }

        boardEl.appendChild(cell);
      }
    }

    drawWaves(current);
    levelLabel.textContent = `Уровень ${levelIndex + 1} / ${LEVELS.length}`;
    levelName.textContent = LEVELS[levelIndex].name;

    if (matched) {
      if (!solved) {
        solved = true;
        statusEl.className = "status good";
        statusEl.textContent = "Все подсказки совпали. Можно идти дальше.";
      }
      setSolvedUi(true);
    } else {
      solved = false;
      setSolvedUi(false);
    }

    return current;
  }

  function drawWaves(current) {
    const wrap = boardEl.parentElement;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    waveLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    waveLayer.setAttribute("width", String(width));
    waveLayer.setAttribute("height", String(height));
    waveLayer.replaceChildren();

    const ns = "http://www.w3.org/2000/svg";

    function addPair(a, b, pair) {
      const line = document.createElementNS(ns, "path");
      line.setAttribute("d", `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      line.setAttribute(
        "class",
        `wave ${pair.resonance ? `f${pair.freqA}` : "noise"}`
      );
      waveLayer.appendChild(line);

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      const glow = document.createElementNS(ns, "circle");
      glow.setAttribute("cx", String(midX));
      glow.setAttribute("cy", String(midY));
      glow.setAttribute("r", pair.resonance ? "11" : "8");
      glow.setAttribute("class", `flash-bg ${pair.resonance ? "good" : "bad"}`);
      waveLayer.appendChild(glow);

      const flash = document.createElementNS(ns, "text");
      flash.setAttribute("x", String(midX));
      flash.setAttribute("y", String(midY));
      flash.setAttribute("text-anchor", "middle");
      flash.setAttribute("dominant-baseline", "middle");
      flash.setAttribute("class", `flash ${pair.resonance ? "good" : "bad"}`);
      flash.textContent = pair.resonance ? "♥" : "~";
      waveLayer.appendChild(flash);
    }

    current.rowPairs.forEach((pair) => {
      addPair(cellCenter(pair.x1, pair.y), cellCenter(pair.x2, pair.y), pair);
    });
    current.colPairs.forEach((pair) => {
      addPair(cellCenter(pair.x, pair.y1), cellCenter(pair.x, pair.y2), pair);
    });
  }

  function spawnPulse(x, y, freq) {
    const cell = boardEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    const wrap = boardEl.parentElement;
    if (!cell || !wrap) return;
    const cr = cell.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    const pulse = document.createElement("div");
    pulse.className = "pulse";
    pulse.style.left = `${cr.left - wr.left}px`;
    pulse.style.top = `${cr.top - wr.top}px`;
    pulse.style.width = `${cr.width}px`;
    pulse.style.height = `${cr.height}px`;
    pulse.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--f${freq}`)
      .trim();
    pulseLayer.appendChild(pulse);
    pulse.addEventListener("animationend", () => pulse.remove());
  }

  function onCellClick(x, y) {
    if (solved || locked.has(key(x, y))) return;
    grid[y][x] = (grid[y][x] + 1) % 4;
    const freq = grid[y][x];
    statusEl.className = "status";
    statusEl.textContent = "";
    render();
    if (freq) spawnPulse(x, y, freq);
  }

  function loadLevel(index) {
    levelIndex = (index + LEVELS.length) % LEVELS.length;
    const level = LEVELS[levelIndex];
    size = level.size;
    walls = wallSetFrom(level);
    grid = emptyGrid(size);
    solution = level.solution.map((row) => row.slice());
    locked = new Set();
    target = analyze(solution, walls, size);
    solved = false;
    setSolvedUi(false);
    winOverlay.classList.add("hidden");
    statusEl.className = "status";
    statusEl.textContent = "";
    pulseLayer.replaceChildren();
    render();
  }

  function showMismatches() {
    const current = analyze(grid, walls, size);
    boardEl.querySelectorAll(".clue").forEach((el) => el.classList.remove("mismatch"));

    const clues = [...boardEl.querySelectorAll(".clue")];
    const colClues = clues.slice(0, size);
    const rowClues = clues.slice(size);

    let any = false;
    colClues.forEach((el, x) => {
      if (current.cols[x] !== target.cols[x]) {
        el.classList.add("mismatch");
        any = true;
      }
    });
    rowClues.forEach((el, y) => {
      if (current.rows[y] !== target.rows[y]) {
        el.classList.add("mismatch");
        any = true;
      }
    });

    if (!any) {
      statusEl.className = "status good";
      statusEl.textContent = "Все подсказки совпали. Можно идти дальше.";
      setSolvedUi(true);
      return;
    }

    statusEl.className = "status bad";
    statusEl.textContent = "Дружба ещё не сошлась: эти числа не совпали.";
  }

  document.getElementById("prevBtn").addEventListener("click", () => {
    loadLevel(levelIndex - 1);
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    loadLevel(levelIndex + 1);
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    loadLevel(levelIndex);
  });
  function applyHint() {
    if (solved) return;

    const mismatches = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (isWall(x, y) || locked.has(key(x, y))) continue;
        const want = solution[y][x];
        if (grid[y][x] === want) continue;
        mismatches.push({
          x,
          y,
          want,
          priority: want ? 0 : 1
        });
      }
    }

    if (!mismatches.length) {
      statusEl.className = "status good";
      statusEl.textContent = "Все открываемые клетки уже на своих местах.";
      return;
    }

    mismatches.sort((a, b) => a.priority - b.priority);
    const pick = mismatches[0];
    grid[pick.y][pick.x] = pick.want;
    locked.add(key(pick.x, pick.y));
    statusEl.className = "status good";
    statusEl.textContent = pick.want
      ? `Подсказка: жираф роста ${pick.want}.`
      : "Подсказка: эта клетка должна быть пустой.";
    render();
    if (pick.want) spawnPulse(pick.x, pick.y, pick.want);
  }

  document.getElementById("checkBtn").addEventListener("click", showMismatches);
  document.getElementById("hintBtn").addEventListener("click", applyHint);
  document.getElementById("continueBtn").addEventListener("click", () => {
    winText.textContent = `Уровень «${LEVELS[levelIndex].name}» собран. Жирафы довольны.`;
    winOverlay.classList.remove("hidden");
  });
  document.getElementById("rulesBtn").addEventListener("click", () => {
    rulesDialog.showModal();
  });
  document.getElementById("winNextBtn").addEventListener("click", () => {
    if (levelIndex === LEVELS.length - 1) {
      winOverlay.classList.add("hidden");
      statusEl.className = "status good";
      statusEl.textContent = "Вся поляна собрана. Жирафы счастливы.";
      return;
    }
    loadLevel(levelIndex + 1);
  });

  window.addEventListener("resize", () => {
    if (size) drawWaves(analyze(grid, walls, size));
  });

  loadLevel(0);
})();
