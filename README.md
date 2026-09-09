# Giraffe Meadow

A grid logic puzzle: the player **looks for friendship between giraffes**, instead of filling in digits or counting objects.

Giraffes of three heights — `1`, `2`, and `3` — are placed on the board. Each giraffe looks along its row and column. The task is to arrange the herd so the numbers along the edges match. Those numbers are not a sum of gazes and not a giraffe count. They show **friendship**: matching height between those who can see each other.

## Why this

In Sudoku you look for digits. In Minesweeper, bombs. In Train Tracks, a path. Here you have to understand **relationships** between giraffes: who is friends with whom, and who is only looking past someone in confusion.

Gazes are always visible on the board. After a move, you can see exactly what changed in the meadow.

## How to find friendship

Two giraffes interact if there is no other giraffe and no tree between them on the same row or column.

- Matching height — **friendship** `♥`. It counts as a **pair of two giraffes**, and that height goes into the number: two `1`s → `1`, two `2`s → `2`, two `3`s → `3`.
- Three threes on one line are already two pairs (`3 + 3 = 6`), not an answer of “3”. The edge number is not a cell count.
- Different height — **confusion** `~`. A soft miss, not a mistake: confusion does not count toward the number.
- A tree breaks the gaze: `1 → 🌳 → X`.

Numbers on top belong to columns, numbers on the left belong to rows. A pink clue already matches the current herd.

Example: two twos with no obstacle — one friendship of strength `2`. A third two on the same line adds another pair, and the number becomes `4`. If a one “sees” them instead, confusion appears, but the number does not grow from it.

You win when **all** edge numbers match. The giraffe layout can be recovered by logic: which heights can even produce that number, where a gaze must be broken by a tree, and where two giraffes must look at each other.

## How to play

1. Clicking a cell cycles its state: empty → `1` → `2` → `3` → empty.
2. Trees are set by the level and cannot be changed.
3. **Check** highlights numbers that do not match.
4. **Hint** reveals one cell from the solution and locks it.
5. When the herd is complete, **Keep walking** appears. You can look at the gazes on the finished board first, then move on.

This repository is a web prototype of worlds 1–2: ordinary giraffes and trees. Boards from 4×4 to 8×8, twelve levels.

## Run

Open [`index.html`](index.html) in a browser, or start a local server from the project folder:

```bash
python -m http.server 8766
```

Then open [http://127.0.0.1:8766/](http://127.0.0.1:8766/).

## Files

| File | Role |
| --- | --- |
| `index.html` | Markup and in-game rules |
| `style.css` | Cute theme, height colors, gazes |
| `game.js` | Friendship, hints, win state |
| `levels.js` | Levels (trees and hidden solution) |
| `PITCH.md` | Producer brief and roadmap |
