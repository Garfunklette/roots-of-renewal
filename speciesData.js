// speciesData.js

const PLANTS = [
  {
    name: "Milkweed",
    cost: 10,
    squareFootage: 5,
    height: "2–5 ft",
    spacing: "12–18 in",
    bloomMonths: [6,7,8],
    sproutMonths: [5],
    seedMonths: [9],
    hostFor: ["Monarch Butterfly"],
    foodFor: ["Monarch Butterfly","Bumblebee"],
    blurb: "Milkweed is a keystone prairie plant. Its toxic sap deters most herbivores, but Monarch caterpillars depend on it as their only host. Its blooms are also nectar-rich, feeding many insects."
  },
  {
    name: "Purple Coneflower",
    cost: 15,
    squareFootage: 4,
    height: "2–4 ft",
    spacing: "12–18 in",
    bloomMonths: [7,8,9],
    sproutMonths: [5],
    seedMonths: [10],
    hostFor: [],
    foodFor: ["Bumblebee","Butterflies"],
    blurb: "Coneflower’s purple petals and spiny centers are beloved by butterflies and bees. In autumn, its seeds become a food source for finches and other songbirds."
  },
  {
    name: "Little Bluestem",
    cost: 12,
    squareFootage: 6,
    height: "2–4 ft",
    spacing: "6–12 in",
    bloomMonths: [8,9],
    sproutMonths: [5],
    seedMonths: [10],
    hostFor: [],
    foodFor: [],
    blurb: "This bunchgrass offers shelter to ground-nesting insects and provides vibrant fall color. It remains standing through winter, offering cover for wildlife."
  },
  {
    name: "Bee Balm",
    cost: 18,
    squareFootage: 3,
    height: "2–3 ft",
    spacing: "18–24 in",
    bloomMonths: [7,8],
    sproutMonths: [5],
    seedMonths: [9],
    hostFor: [],
    foodFor: ["Ruby-throated Hummingbird","Bumblebee"],
    blurb: "Bee Balm’s bright tubular flowers attract hummingbirds and long-tongued bees. Historically, it was used by Indigenous peoples as a medicinal herb."
  },
  {
    name: "Black-eyed Susan",
    cost: 8,
    squareFootage: 3,
    height: "2–3 ft",
    spacing: "12–18 in",
    bloomMonths: [6,7,8,9],
    sproutMonths: [5],
    seedMonths: [10],
    hostFor: [],
    foodFor: ["Bumblebee","Butterflies"],
    blurb: "These cheerful golden blooms thrive in disturbed soils. They are generalist nectar sources, supporting a wide variety of pollinators throughout summer."
  },
  {
    name: "Cardinal Flower",
    cost: 20,
    squareFootage: 2,
    height: "3–5 ft",
    spacing: "12–18 in",
    bloomMonths: [7,8,9],
    sproutMonths: [5],
    seedMonths: [10],
    hostFor: [],
    foodFor: ["Ruby-throated Hummingbird"],
    blurb: "With brilliant red spikes of flowers, Cardinal Flower is almost exclusively pollinated by hummingbirds, who are drawn to its color and shape."
  }
];

// POLLINATORS remain unchanged
const POLLINATORS = [
  {
    name: "Monarch Butterfly",
    boost: 0.2,
    host: "Milkweed",
    food: "Milkweed, Coneflower",
    blurb: "Monarchs migrate thousands of miles each year. They can only reproduce where Milkweed grows, making it a vital restoration plant."
  },
  {
    name: "Bumblebee",
    boost: 0.15,
    host: null,
    food: "Coneflower, Bee Balm, Black-eyed Susan",
    blurb: "Bumblebees perform buzz pollination, shaking pollen loose from flowers. They are among the earliest and latest pollinators active each season."
  },
  {
    name: "Ruby-throated Hummingbird",
    boost: 0.15,
    host: null,
    food: "Bee Balm, Cardinal Flower",
    blurb: "The only hummingbird nesting in the eastern U.S., this species hovers like a jewel as it sips nectar from tubular blooms."
  },
  {
    name: "Swallowtail Butterfly",
    boost: 0.1,
    host: "Dill, Parsley",
    food: "Coneflower, Bee Balm",
    blurb: "Large and colorful, Swallowtails are generalist nectar feeders. Their caterpillars rely on specific host plants, but adults visit many garden flowers."
  },
  {
    name: "Leafcutter Bee",
    boost: 0.1,
    host: null,
    food: "Coneflower, Black-eyed Susan",
    blurb: "Solitary and industrious, Leafcutter Bees cut circular pieces of leaves to line their nests. They are efficient pollinators of wildflowers and crops."
  },
  {
    name: "Hoverfly",
    boost: 0.05,
    host: null,
    food: "Black-eyed Susan, Coneflower",
    blurb: "Often mistaken for bees, Hoverflies are harmless mimics. Their larvae prey on aphids, while adults are important flower pollinators."
  }
];

const POLLINATOR_BIODIVERSITY = {
  "Monarch Butterfly": 5,
  "Bumblebee": 4,
  "Ruby-throated Hummingbird": 4,
  "Swallowtail Butterfly": 3,
  "Leafcutter Bee": 2,
  "Hoverfly": 1
};
