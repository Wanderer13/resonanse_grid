const LEVELS = [
  {
    name: "First Friendship",
    size: 4,
    walls: [],
    tutorial: true,
    maxFreq: 1,
    givens: [{ x: 0, y: 0, freq: 1 }],
    coach: "This height-1 giraffe is looking down the column. Place another one — they will make friends.",
    coachAfterPair: "The number 1 is this pair’s strength. There should be no extra giraffes on the board.",
    solution: [
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  },
  {
    name: "Two Heights",
    size: 4,
    walls: [],
    tutorial: true,
    maxFreq: 2,
    givens: [
      { x: 0, y: 0, freq: 1 },
      { x: 2, y: 0, freq: 1 }
    ],
    coach: "This pair already scores 1. A different height is a different friendship: two twos score 2.",
    solution: [
      [1, 0, 1, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 2],
      [0, 0, 0, 0]
    ]
  },
  {
    name: "Corner",
    size: 4,
    walls: [],
    solution: [
      [2, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0]
    ]
  },
  {
    name: "Power of Two",
    size: 5,
    walls: [],
    solution: [
      [0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 3, 0, 3]
    ]
  },
  {
    name: "Lattice",
    size: 5,
    walls: [],
    solution: [
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 2, 0, 1]
    ]
  },
  {
    name: "Tree on the Path",
    size: 5,
    walls: [{ x: 2, y: 0 }],
    coach: "A tree breaks the gaze: giraffes cannot see each other through 🌳.",
    solution: [
      [1, 1, 0, 2, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    name: "Hidden Gaze",
    size: 5,
    walls: [{ x: 2, y: 1 }, { x: 2, y: 3 }],
    solution: [
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    name: "Three Heights",
    size: 6,
    walls: [{ x: 2, y: 1 }],
    solution: [
      [2, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 3, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 3]
    ]
  },
  {
    name: "Little Meadows",
    size: 6,
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
    solution: [
      [1, 1, 0, 2, 2, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [3, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1]
    ]
  },
  {
    name: "Long Path",
    size: 7,
    walls: [{ x: 3, y: 1 }, { x: 3, y: 5 }],
    solution: [
      [2, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 3],
      [0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 2]
    ]
  },
  {
    name: "Crossroads",
    size: 7,
    walls: [{ x: 3, y: 3 }, { x: 1, y: 1 }, { x: 5, y: 5 }],
    solution: [
      [3, 0, 0, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0],
      [3, 0, 0, 0, 0, 0, 2],
      [0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 2]
    ]
  },
  {
    name: "Big Meadow",
    size: 8,
    walls: [
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 1, y: 3 },
      { x: 6, y: 4 }
    ],
    solution: [
      [1, 0, 1, 0, 0, 2, 0, 2],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0, 3, 0],
      [1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 2],
      [0, 3, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 0, 2, 0, 2]
    ]
  }
];
