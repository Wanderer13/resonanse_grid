(() => {
  const boardEl = document.getElementById("board");
  const waveLayer = document.getElementById("waveLayer");
  const pulseLayer = document.getElementById("pulseLayer");
  const levelLabel = document.getElementById("levelLabel");
  const levelName = document.getElementById("levelName");
  const coachEl = document.getElementById("coach");
  const legendEl = document.getElementById("legend");
  const statusEl = document.getElementById("status");
  const winOverlay = document.getElementById("winOverlay");
  const winText = document.getElementById("winText");
  const continueBtn = document.getElementById("continueBtn");
  const checkBtn = document.getElementById("checkBtn");
  const hintBtn = document.getElementById("hintBtn");
  const rulesDialog = document.getElementById("rulesDialog");
  const welcomeDialog = document.getElementById("welcomeDialog");

  let levelIndex = 0;
  let size = 0;
  let walls = new Set();
  let grid = [];
  let target = { rows: [], cols: [] };
  let solution = [];
  let locked = new Set();
  let solved = false;
  let maxFreq = 3;
  let prevScores = null;

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

  function giraffeCount(source) {
    let n = 0;
    source.forEach((row) => {
      row.forEach((value) => {
        if (value) n += 1;
      });
    });
    return n;
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

  function uniqueUnmatchedLine(current) {
    const cols = [];
    const rows = [];
    current.cols.forEach((value, i) => {
      if (value !== target.cols[i]) cols.push(i);
    });
    current.rows.forEach((value, i) => {
      if (value !== target.rows[i]) rows.push(i);
    });
    if (cols.length === 1 && rows.length === 0) return { type: "col", index: cols[0] };
    if (rows.length === 1 && cols.length === 0) return { type: "row", index: rows[0] };
    return null;
  }

  function cellCenter(x, y) {
    const cell = boardEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    const wrap = boardEl.parentElement;
    if (!cell || !wrap) return { x: 0, y: 0 };
    const cr = cell.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    return {
      x: Math.round(cr.left - wr.left + cr.width / 2),
      y: Math.round(cr.top - wr.top + cr.height / 2),
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

  function clickHint(level) {
    const cap = level.maxFreq || 3;
    if (cap <= 1) return "Click to place or remove a height-1 giraffe.";
    if (cap === 2) return "Click: empty → 1 → 2 → empty.";
    return "Click: empty → 1 → 2 → 3 → empty.";
  }

  function fillClue(el, currentValue, targetValue, { bump = false, focus = false } = {}) {
    const match = currentValue === targetValue;
    el.className = "clue" + (match ? " match" : " pending");
    if (focus) el.classList.add("line-focus");
    el.setAttribute(
      "aria-label",
      match
        ? `Clue ${targetValue}, matched`
        : `Clue ${targetValue}, now ${currentValue}`
    );

    const targetSpan = document.createElement("span");
    targetSpan.className = "clue-target";
    targetSpan.textContent = String(targetValue);
    el.appendChild(targetSpan);

    if (!match) {
      const now = document.createElement("span");
      now.className = "clue-now";
      now.textContent = `now ${currentValue}`;
      el.appendChild(now);
    }

    if (bump) {
      el.classList.add("bump");
      el.addEventListener("animationend", () => el.classList.remove("bump"), { once: true });
    }
  }

  function updateLegend(level) {
    const cap = level.maxFreq || 3;
    const hasWalls = (level.walls || []).length > 0;
    legendEl.querySelector('[data-legend="f1"]').classList.toggle("hidden", cap < 1);
    legendEl.querySelector('[data-legend="f2"]').classList.toggle("hidden", cap < 2);
    legendEl.querySelector('[data-legend="f3"]').classList.toggle("hidden", cap < 3);
    legendEl.querySelector('[data-legend="wall"]').classList.toggle("hidden", !hasWalls);
    legendEl.querySelector('[data-legend="good"]').classList.remove("hidden");
    legendEl.querySelector('[data-legend="noise"]').classList.toggle("hidden", cap < 2);
  }

  function updateCoach(current) {
    const level = LEVELS[levelIndex];
    const matched = cluesMatch(current);
    let text = level.coach || clickHint(level);

    if (matched) {
      text = "Everyone is looking the right way.";
    } else if (level.tutorial) {
      const pairs = [...current.rowPairs, ...current.colPairs];
      const harmfulNoise = pairs.some((pair) => {
        if (pair.resonance) return false;
        const lineTarget = "x1" in pair ? target.rows[pair.y] : target.cols[pair.x];
        return lineTarget > 0;
      });
      const friends = pairs.some((pair) => pair.resonance);
      const extras = giraffeCount(grid) > giraffeCount(solution);
      if (harmfulNoise) {
        text = "~ is confusion; it does not count. You need the same height.";
      } else if (friends && extras) {
        text = "Extra giraffes are looking too. Take them off.";
      } else if (friends && level.coachAfterPair) {
        text = level.coachAfterPair;
      }
    }

    coachEl.textContent = text;
    coachEl.className = "coach" + (matched ? " good" : "");
  }

  function render() {
    const current = analyze(grid, walls, size);
    const matched = cluesMatch(current);
    const level = LEVELS[levelIndex];
    const focus = level.tutorial ? uniqueUnmatchedLine(current) : null;

    boardEl.style.gridTemplateColumns = `var(--cell-size, 56px) repeat(${size}, var(--cell-size, 56px))`;
    boardEl.replaceChildren();

    const corner = document.createElement("div");
    boardEl.appendChild(corner);

    for (let x = 0; x < size; x++) {
      const clue = document.createElement("div");
      const isFocus = focus && focus.type === "col" && focus.index === x;
      const bump = Boolean(prevScores && prevScores.cols[x] !== current.cols[x]);
      fillClue(clue, current.cols[x], target.cols[x], { bump, focus: isFocus });
      clue.dataset.col = String(x);
      boardEl.appendChild(clue);
    }

    for (let y = 0; y < size; y++) {
      const rowClue = document.createElement("div");
      const isFocus = focus && focus.type === "row" && focus.index === y;
      const bump = Boolean(prevScores && prevScores.rows[y] !== current.rows[y]);
      fillClue(rowClue, current.rows[y], target.rows[y], { bump, focus: isFocus });
      rowClue.dataset.row = String(y);
      boardEl.appendChild(rowClue);

      for (let x = 0; x < size; x++) {
        const cell = document.createElement("button");
        cell.type = "button";
        const wall = isWall(x, y);
        const freq = grid[y][x];
        const isLocked = locked.has(key(x, y));
        const lineFocus =
          (focus && focus.type === "col" && x === focus.index) ||
          (focus && focus.type === "row" && y === focus.index);
        cell.className = `cell ${wall ? "wall" : "playable"} ${freqClass(freq)}${isLocked ? " locked" : ""}${lineFocus ? " line-focus" : ""}`;
        cell.disabled = wall;
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);

        if (wall) {
          cell.textContent = "🌳";
          cell.setAttribute("aria-label", "Tree");
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
              freq ? `Hint: height-${freq} giraffe` : "Hint: empty cell"
            );
          } else {
            cell.setAttribute("aria-label", freq ? `Height-${freq} giraffe` : "Empty cell");
          }
          cell.addEventListener("click", () => onCellClick(x, y));
        }

        boardEl.appendChild(cell);
      }
    }

    drawWaves(current);
    levelLabel.textContent = `Level ${levelIndex + 1} / ${LEVELS.length}`;
    levelName.textContent = level.name;
    updateLegend(level);
    updateCoach(current);
    prevScores = { rows: current.rows.slice(), cols: current.cols.slice() };

    if (matched) {
      if (!solved) {
        solved = true;
        statusEl.className = "status good";
        statusEl.textContent = "All the clues match. You can keep walking.";
      }
      setSolvedUi(true);
    } else {
      solved = false;
      setSolvedUi(false);
    }

    return current;
  }

  const WAVE_DASH = 20;
  const WAVE_SPEED = 20;
  let waveRaf = 0;

  function waveDashOffset() {
    return -((performance.now() / 1000) * WAVE_SPEED % WAVE_DASH);
  }

  function applyWaveOffset() {
    waveLayer.style.setProperty("--wave-offset", `${waveDashOffset()}px`);
  }

  function startWaveClock() {
    if (waveRaf) return;
    const tick = () => {
      applyWaveOffset();
      waveRaf = requestAnimationFrame(tick);
    };
    waveRaf = requestAnimationFrame(tick);
  }

  function setSvgAttr(el, name, value) {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }

  function drawWaves(current) {
    const wrap = boardEl.parentElement;
    const width = String(wrap.clientWidth);
    const height = String(wrap.clientHeight);
    setSvgAttr(waveLayer, "viewBox", `0 0 ${width} ${height}`);
    setSvgAttr(waveLayer, "width", width);
    setSvgAttr(waveLayer, "height", height);

    const ns = "http://www.w3.org/2000/svg";
    const seen = new Set();

    function upsertPair(id, a, b, pair) {
      seen.add(id);
      const kind = pair.resonance ? "good" : "bad";
      const waveClass = `wave ${pair.resonance ? `f${pair.freqA}` : "noise"}`;
      const midX = String((a.x + b.x) / 2);
      const midY = String((a.y + b.y) / 2);
      const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

      let group = waveLayer.querySelector(`[data-wave="${id}"]`);
      if (!group) {
        group = document.createElementNS(ns, "g");
        group.setAttribute("data-wave", id);

        const line = document.createElementNS(ns, "path");
        group.appendChild(line);

        const glow = document.createElementNS(ns, "circle");
        group.appendChild(glow);

        const flash = document.createElementNS(ns, "text");
        flash.setAttribute("text-anchor", "middle");
        flash.setAttribute("dominant-baseline", "middle");
        group.appendChild(flash);

        waveLayer.appendChild(group);
      }

      const line = group.children[0];
      const glow = group.children[1];
      const flash = group.children[2];

      setSvgAttr(line, "d", d);
      if (line.getAttribute("class") !== waveClass) {
        line.setAttribute("class", waveClass);
      }
      setSvgAttr(glow, "cx", midX);
      setSvgAttr(glow, "cy", midY);
      setSvgAttr(glow, "r", pair.resonance ? "11" : "8");
      setSvgAttr(glow, "class", `flash-bg ${kind}`);
      setSvgAttr(flash, "x", midX);
      setSvgAttr(flash, "y", midY);
      setSvgAttr(flash, "class", `flash ${kind}`);
      if (flash.textContent !== (pair.resonance ? "♥" : "~")) {
        flash.textContent = pair.resonance ? "♥" : "~";
      }
    }

    current.rowPairs.forEach((pair) => {
      upsertPair(
        `r:${pair.y}:${pair.x1}:${pair.x2}`,
        cellCenter(pair.x1, pair.y),
        cellCenter(pair.x2, pair.y),
        pair
      );
    });
    current.colPairs.forEach((pair) => {
      upsertPair(
        `c:${pair.x}:${pair.y1}:${pair.y2}`,
        cellCenter(pair.x, pair.y1),
        cellCenter(pair.x, pair.y2),
        pair
      );
    });

    [...waveLayer.children].forEach((el) => {
      if (!seen.has(el.getAttribute("data-wave"))) el.remove();
    });

    applyWaveOffset();
    startWaveClock();
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
    grid[y][x] = (grid[y][x] + 1) % (maxFreq + 1);
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
    maxFreq = level.maxFreq || 3;
    walls = wallSetFrom(level);
    grid = emptyGrid(size);
    solution = level.solution.map((row) => row.slice());
    locked = new Set();
    (level.givens || []).forEach(({ x, y, freq }) => {
      grid[y][x] = freq;
      locked.add(key(x, y));
    });
    target = analyze(solution, walls, size);
    solved = false;
    prevScores = null;
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

    let any = false;
    boardEl.querySelectorAll(".clue[data-col]").forEach((el) => {
      const x = Number(el.dataset.col);
      if (current.cols[x] !== target.cols[x]) {
        el.classList.add("mismatch");
        any = true;
      }
    });
    boardEl.querySelectorAll(".clue[data-row]").forEach((el) => {
      const y = Number(el.dataset.row);
      if (current.rows[y] !== target.rows[y]) {
        el.classList.add("mismatch");
        any = true;
      }
    });

    if (!any) {
      statusEl.className = "status good";
      statusEl.textContent = "All the clues match. You can keep walking.";
      setSolvedUi(true);
      return;
    }

    statusEl.className = "status bad";
    statusEl.textContent = "Friendship has not lined up yet: these numbers do not match.";
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
      statusEl.textContent = "Every open cell is already in the right place.";
      return;
    }

    mismatches.sort((a, b) => a.priority - b.priority);
    const pick = mismatches[0];
    grid[pick.y][pick.x] = pick.want;
    locked.add(key(pick.x, pick.y));
    statusEl.className = "status good";
    statusEl.textContent = pick.want
      ? `Hint: a height-${pick.want} giraffe.`
      : "Hint: this cell should be empty.";
    render();
    if (pick.want) spawnPulse(pick.x, pick.y, pick.want);
  }

  document.getElementById("checkBtn").addEventListener("click", showMismatches);
  document.getElementById("hintBtn").addEventListener("click", applyHint);
  document.getElementById("continueBtn").addEventListener("click", () => {
    winText.textContent = `Level “${LEVELS[levelIndex].name}” is complete. The giraffes are happy.`;
    winOverlay.classList.remove("hidden");
  });
  document.getElementById("rulesBtn").addEventListener("click", () => {
    rulesDialog.showModal();
  });
  document.getElementById("winNextBtn").addEventListener("click", () => {
    if (levelIndex === LEVELS.length - 1) {
      winOverlay.classList.add("hidden");
      statusEl.className = "status good";
      statusEl.textContent = "The whole meadow is complete. The giraffes are happy.";
      return;
    }
    loadLevel(levelIndex + 1);
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (size) drawWaves(analyze(grid, walls, size));
    }, 50);
  });

  loadLevel(0);
  welcomeDialog.showModal();
})();
