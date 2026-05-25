<div align="center">

# CogniTree

### Reasoning forensics for LLM outputs.

Decompose any model response into a hierarchical reasoning tree.
Spot weak premises, hidden assumptions, and logical fallacies at a glance.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-22C55E)](#license)

</div>

---

## What is CogniTree?

LLM outputs read like fluent prose, but the underlying logic is a graph: claims supported by premises, premises backed by evidence or sliding into assumptions, branches that converge into conclusions or break under fallacy.

CogniTree extracts that hidden structure. Paste a prompt and the model's response, and the tool returns a typed, color-coded reasoning tree with confidence scores per node and named fallacies flagged inline.

It's a forensic lens for any team that uses LLM output in decisions, summaries, recommendations, or copy where logical soundness actually matters.

## Why CogniTree?

Most LLM tools focus on what was said. CogniTree focuses on **how it was reasoned**.

- Reading a 400-word AI response and spotting a false dichotomy buried in paragraph three takes effort. The tree shows it instantly.
- Confidence scores per node surface the parts the model couldn't actually justify, so you know which claims to verify.
- Side-by-side prompt and tree means you can audit before you trust, and disagree with structure rather than vibes.

## Features

### Hierarchical decomposition

Every claim is mapped to its supporting nodes. Each tree has 6-14 nodes across 3-5 levels of depth. Nodes are typed and color-coded:

| Type | Meaning |
|------|---------|
| `premise` | A foundational claim the response rests on. |
| `inference` | A derived claim built from one or more premises. |
| `evidence` | A specific cited fact, study, example, or data point. |
| `assumption` | An unstated belief required for the reasoning to hold. |
| `conclusion` | The final recommendation, answer, or output. |
| `fallacy` | A flawed step in the reasoning chain, named by category. |

### Fallacy detection

Catches the most common patterns: false dichotomy, hasty generalization, post hoc, equivocation, no-true-Scotsman, straw man, appeal to authority. Each fallacy node is tagged with its name and a one-line rationale explaining why the model slipped.

### Confidence scoring

Each node carries a 0-100% support score derived from how strongly the response text justifies it. Aggregate stats show tree-level confidence so weak responses stand out without reading every node.

### Interactive canvas

A tidy-tree layout with smooth bezier connectors. Click any node to inspect its rationale, type, fallacy label, and confidence in a detail panel. The whole thing is responsive and dark-themed for long sessions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| AI Backend | MiMo v2.5 Pro (Token Plan endpoint) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- A MiMo API key (Token Plan endpoint, prefix `tp-`)

### Installation

```bash
git clone https://github.com/XinnBlueBird/cognitree.git
cd cognitree
npm install
cp .env.example .env.local
# edit .env.local and add your MIMO_API_KEY
npm run dev
```

The app boots at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MIMO_API_KEY` | Token Plan API key for MiMo v2.5 Pro. Used server-side only. | Yes |

A starter `.env.example` is in the repo. **Never commit `.env` or `.env.local`.**

## Project Structure

```
cognitree/
├── app/
│   ├── api/
│   │   └── decompose/
│   │       └── route.ts        # POST /api/decompose -> reasoning tree JSON
│   ├── globals.css             # Theme tokens, grid bg, glow + branch animations
│   ├── layout.tsx              # Root layout, font, metadata
│   └── page.tsx                # Landing + workspace + tree canvas
├── lib/
│   ├── layout.ts               # Tidy-tree layout algorithm + tree stats helpers
│   ├── sample.ts               # Built-in demo prompt, response, and tree
│   └── types.ts                # Node types, tree shape, type metadata
├── public/                     # Static assets
├── .env.example                # MIMO_API_KEY placeholder
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

```
+------------------+        +-----------------------+        +--------------------+
| Prompt + LLM     |  POST  | /api/decompose        |  HTTPS | MiMo v2.5 Pro      |
| response (text)  +------->+ - validates input     +------->+ Token Plan endpoint|
+------------------+        | - applies system      |        +--------------------+
                            |   prompt (forensic    |                |
                            |   reasoning analyst)  |                | reasoning_content
                            +-----------------------+                |
                                       ^                             v
                                       |                  +----------------------+
                                       |                  | Strict JSON parse    |
                                       |                  | (root + children)    |
                                       |                  +----------+-----------+
                                       |                             |
                            +----------+-----------+                 |
                            | layoutTree()         |  <--------------+
                            | tidy hierarchical    |
                            | layout + bezier edges|
                            +----------+-----------+
                                       |
                                       v
                            +----------------------+
                            | TreeCanvas (React)   |
                            | nodes + SVG branches |
                            | + click-to-inspect   |
                            +----------------------+
```

The reasoning extractor uses a forensic system prompt that constrains the output to a strict JSON schema. Only the JSON is parsed, never free text, so the UI is always renderable.

## Roadmap

- Side-by-side compare: same prompt, different models, two trees.
- PNG and SVG export of the tree canvas.
- Saved trees with shareable read-only URLs.
- Browser extension to decompose any selected text inline.

## Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/your-thing`).
3. Commit (`git commit -m "feat: add your thing"`).
4. Push (`git push origin feature/your-thing`).
5. Open a Pull Request.

Keep PRs focused. One feature per PR. Match the existing TypeScript and Tailwind style.

## License

MIT. See [LICENSE](LICENSE).

---

<div align="center">

Built by <a href="https://github.com/XinnBlueBird">XinnBlueBird</a> ·
Next.js 16 · TypeScript · Tailwind 4 · MiMo v2.5 Pro

</div>
