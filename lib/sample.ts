import type { ReasoningTree } from "./types";

export const SAMPLE_PROMPT =
  "Should our startup adopt a four-day work week?";

export const SAMPLE_RESPONSE = `Yes, you should switch to a four-day work week. Studies in Iceland and the UK showed productivity stays the same or improves. Employees will be happier, and happy employees produce better work. Therefore your startup will perform better. Also, your competitors will eventually do it, so you should be first. The few companies that tried it and failed were probably mismanaged.`;

export const SAMPLE_TREE: ReasoningTree = {
  root: {
    id: "n0",
    label: "Adopt four-day work week",
    type: "conclusion",
    confidence: 0.62,
    fallacy: null,
    rationale: "Final recommendation derived from cited studies and assumptions.",
    children: [
      {
        id: "n1",
        label: "Productivity stays the same",
        type: "premise",
        confidence: 0.78,
        fallacy: null,
        rationale: "Backed by Iceland and UK trials.",
        children: [
          {
            id: "n2",
            label: "Iceland trial outcomes",
            type: "evidence",
            confidence: 0.85,
            fallacy: null,
            rationale: "Public-sector study, 2015-2019.",
            children: [],
          },
          {
            id: "n3",
            label: "UK 4-Day Week pilot",
            type: "evidence",
            confidence: 0.8,
            fallacy: null,
            rationale: "61 companies, 6-month trial.",
            children: [],
          },
        ],
      },
      {
        id: "n4",
        label: "Happy employees produce better work",
        type: "inference",
        confidence: 0.55,
        fallacy: null,
        rationale: "Plausible but generalised.",
        children: [
          {
            id: "n5",
            label: "Happiness causes performance",
            type: "assumption",
            confidence: 0.45,
            fallacy: null,
            rationale: "Correlation framed as causation without controls.",
            children: [],
          },
        ],
      },
      {
        id: "n6",
        label: "Be first or competitors win",
        type: "fallacy",
        confidence: 0.35,
        fallacy: "False dichotomy",
        rationale:
          "Frames the choice as first-mover-or-loser, ignoring middle paths.",
        children: [],
      },
      {
        id: "n7",
        label: "Failed companies were mismanaged",
        type: "fallacy",
        confidence: 0.3,
        fallacy: "No true Scotsman",
        rationale: "Dismisses counter-evidence by redefining the category.",
        children: [],
      },
    ],
  },
};
