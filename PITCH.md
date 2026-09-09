# Giraffe Meadow — pitch for a producer and publisher

**Selling point:** a logic puzzle where the player is looking not for digits or objects, but for **friendship between giraffes** — and sees those gazes right on the meadow.

This document covers how the game differs from “Sudoku + X” hybrids, what the web prototype already has, which meadows unlock a year of content, and where ads and payments can sit without hurting the rules.

## Market position

Successful logic hits of recent years usually glue familiar mechanics together: Train Tracks ≈ Sudoku + a path network, ColorSweeper ≈ Minesweeper + nonogram. That is a clear way the segment grows, but the store is already full of those hybrids.

Giraffe Meadow sells a **new kind of information on the board**. The edge numbers are not a sum of heights and not a count of animals. They are a friendship counter: matching height among those who can see each other. The player reconstructs a network of relationships: who is looking at whom.

| Game | What the player looks for |
| --- | --- |
| Sudoku | Digits |
| Minesweeper | Bombs |
| Train Tracks | A path |
| Giraffe Meadow | Relationships between animals |

Visually this reads in seconds on a screenshot: gazes along rows and columns, a heart `♥` for friendship, `~` for confusion. The player is not “solving a table”, they are looking at a living meadow. The rules are still short and fully deterministic — no randomness in the solution.

The picture is cute and animal-led; the logic is adult. That gives casual-audience CTR without flattening the puzzle into match-3.

**Meta is light**, in the spirit of Train Tracks / ColorSweeper: progress through meadows, with no city, farm, or heroes around the grid.

```text
Solved a level
    → received a meadow postcard
    → unlocked a new meadow
    → received new rules
```

Giraffes are the starting skin and the store face. The rules are not tied to the species: the same grid can be shown with rabbits, cats, or penguins. That is cosmetics, not a new mechanic, and a separate IAP (see below).

## What already exists (meadows 1–2)

A web prototype in HTML/CSS/JS, suitable for GitHub Pages and fast demos.

- Boards 4×4 … 8×8.
- Giraffes of three heights `1 / 2 / 3`.
- Friendship and confusion along a line of sight.
- Trees that break the gaze.
- Gazes always on the board, flashes at intersections.
- Check, hint, and **Keep walking** after a solve (the win window does not cover the board immediately).
- 12 handcrafted levels.

That is enough to show the core: “find friendship by height”. For the store, the core needs to grow to ~30 JSON levels, and gaze rendering should move to Canvas/WebGL (or Unity Web), without changing the rules.

The base meadows **stay free**. They carry onboarding and organic traffic. The starting skin is giraffes.

## Roadmap: meadows 3–6

Each meadow adds one rule to the same gaze network. Content scales as location packs, not as new genres.

### Meadow 3 — ponds

A gaze reflects off water and changes direction. The player reads a bent network: friendship can meet not on a straight line, but after one or two reflections. Screenshots show broken gazes, which is good for CTR.

### Meadow 4 — hills

A hill cell changes friendship strength: height `1` counts as `2`. The contribution to the edge number grows, and puzzles appear of the form “where to put a hill so a two produces the needed friendship”. That is a natural difficulty jump after trees.

### Meadow 5 — families

A gaze only travels through its own: different families (by height or coat) share one board and barely interfere, until the player links them by mistake. Deep mid-game, many unique solutions.

### Meadow 6 — wandering bushes

Obstacles shift on a beat. Placing giraffes is no longer static: you have to plan the moment when a gaze will pass. This is late-game and a reason for daily walks.

After meadow 6, content turns on combinations of the same rules (pond + family, hill + movement) without inflating the metagame.

## Ads and payments

Model: a **free game**, with a soft gate on convenience and meta, not on the right to solve a level. Ads do not appear during a move and are not drawn over a gaze — that would break the main wow moment.

### Where to show ads

| Place | Format | Why |
| --- | --- | --- |
| After the **Keep walking** button | Interstitial | The player has already looked at the finished meadow; this is a level-to-level transition |
| Entering a new meadow | Interstitial | A rare, “big” progression moment |
| Start of a daily puzzle | Short interstitial or banner | Daily return |
| At the player’s choice | Rewarded | Hint, skip, postcard replay |

Do not put an interstitial on the first onboarding or on every cell click.

### Rewarded ads

The player starts the video themselves and gets one-shot help:

- an extra hint (as in the prototype, one cell from the solution);
- a skip of an overly hard level, losing the “perfect” postcard, but without a dead end;
- a replay of a missing postcard if the meadow did not unlock;
- in meadow 6 — a one-shot reset of a wandering-bush beat.

### Payments (IAP)

- Remove ads.
- A hint pack (convenience, not a required key to the solution).
- Premium meadows: early access to locations 4–6 while the free track is still on meadow 3.
- **Herd skins.** The rules stay the same; who stands on a cell changes. Giraffes are the default. For IAP you can put rabbits, cats, penguins, seasonal animals. Pure cosmetics: height, friendship `♥`, and confusion `~` do not change. It looks good in the store (“the same puzzle — a different animal”), gives a reason for seasonal packs, and does not break puzzle fairness.
- Battle pass “meadow album”: cosmetics, location postcards, and sometimes a new skin for daily play, with no pay-to-win rules.

Worlds 1–2 and the base rules of new meadows are not put behind a paywall. Premium speeds up access to locations, but does not sell “the right answer”. Starting giraffes stay free forever: a paid skin is a want, not a gate.

#### Why skins are a separate revenue column

Meadow logic does not depend on the giraffe. Swap sprites and palette, and you get “Rabbit Meadow” without new level content. That is:

- low production cost relative to a level pack;
- a clear storefront in the store and in the game (grid preview before purchase);
- live-ops without inflating the rules: Easter — rabbits, winter — penguins, night — owls;
- gifts and collecting in a battle pass, not pay-to-win.

You can sell packs (rabbits / cats / penguins) and a “whole zoo” bundle. One skin applies to the whole game or is chosen per meadow — a product choice; it does not affect the rules.

### What not to do

- Ads over the gaze animation.
- Levels that cannot be finished without a bought or rewarded hint.
- Paid access to the friendship rules themselves.
- A paid-only skin: giraffes must remain the free face of the game.
- A city / farm / heroes wrapper around the grid — that blurs the screenshot. Animals live **on the cells**, not in a separate zoo around the puzzle.

## Product recommendation

1. Finish a web/Unity MVP: 30 levels of meadows 1–2, persistent gazes, a readable store screenshot with giraffes.
2. Ship meadows in packs: trees → ponds → hills → families → wandering bushes.
3. Turn monetization on from the second meadow: interstitial after **Keep walking**, rewarded hint, IAP “remove ads”.
4. First cosmetic IAP — a rabbit pack: the same prototype, different sprites, a check that the skin sells without confusing the rules.
5. Daily puzzle and meadow album — after the core already holds a session without pressure.

The game looks fresh specifically while you can see on the board who is looking at whom. Anything that covers that (overlays, banners on the grid, extra meta) hits CTR and the genre feel. A skin changes who stands on a cell — not how friendship is read.
