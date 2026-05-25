"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Layers,
  Gauge,
  Play,
  RotateCcw,
  Code2,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Shield,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  layoutTree,
  flattenTree,
  countNodes,
  maxDepth,
  countFallacies,
  avgConfidence,
} from "@/lib/layout";
import { NODE_META, type ReasoningTree, type PositionedNode } from "@/lib/types";
import { SAMPLE_PROMPT, SAMPLE_RESPONSE, SAMPLE_TREE } from "@/lib/sample";

const NODE_W = 200;
const NODE_H = 88;
const PAD = 80;

export default function Home() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [response, setResponse] = useState(SAMPLE_RESPONSE);
  const [tree, setTree] = useState<ReasoningTree | null>(SAMPLE_TREE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PositionedNode | null>(null);

  const layout = useMemo(() => {
    if (!tree) return null;
    const { positioned, width, height } = layoutTree(tree.root, {
      hSpacing: 240,
      vSpacing: 160,
    });
    return {
      positioned,
      flat: flattenTree(positioned),
      width: width + NODE_W + PAD * 2,
      height: height + NODE_H + PAD * 2,
    };
  }, [tree]);

  const stats = useMemo(() => {
    if (!tree) return null;
    return {
      nodes: countNodes(tree.root),
      depth: maxDepth(tree.root) + 1,
      fallacies: countFallacies(tree.root),
      confidence: Math.round(avgConfidence(tree.root) * 100),
    };
  }, [tree]);

  async function decompose() {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, response }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to decompose");
        setLoading(false);
        return;
      }
      if (!data?.root) {
        setError("Model returned malformed tree");
        setLoading(false);
        return;
      }
      setTree(data as ReasoningTree);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setPrompt(SAMPLE_PROMPT);
    setResponse(SAMPLE_RESPONSE);
    setTree(SAMPLE_TREE);
    setError(null);
    setSelected(null);
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#070912]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400/30 to-violet-500/30 grid place-items-center border border-cyan-300/30">
              <Brain className="w-4 h-4 text-cyan-200" />
            </div>
            <div className="font-semibold tracking-tight">CogniTree</div>
            <span className="hidden sm:inline text-[11px] text-slate-500 ml-1">
              v1.0
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <a
              href="#workspace"
              className="hidden md:inline px-3 py-1.5 text-slate-300 hover:text-white"
            >
              Workspace
            </a>
            <a
              href="#about"
              className="hidden md:inline px-3 py-1.5 text-slate-300 hover:text-white"
            >
              About
            </a>
            <a
              href="#faq"
              className="hidden md:inline px-3 py-1.5 text-slate-300 hover:text-white"
            >
              FAQ
            </a>
            <a
              href="https://github.com/XinnBlueBird/cognitree"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-3 py-1.5 rounded-md border border-white/10 hover:border-cyan-300/40 hover:bg-white/5 flex items-center gap-1.5 text-slate-200"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Source</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgba(94,229,255,0.12), transparent 50%), radial-gradient(circle at 80% 30%, rgba(167,139,250,0.10), transparent 55%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-wider uppercase text-cyan-300/80 border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Reasoning forensics for LLM outputs
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            See how a model{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">
              actually thinks
            </span>
            .
          </h1>
          <p className="mt-5 text-slate-300/90 max-w-2xl text-base md:text-lg leading-relaxed">
            CogniTree decomposes any LLM response into a hierarchical reasoning
            tree. Spot weak premises, hidden assumptions, and logical fallacies
            at a glance, before they ship into your product.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#workspace"
              className="px-5 py-2.5 rounded-md bg-cyan-300 text-slate-950 font-medium hover:bg-cyan-200 transition flex items-center gap-2"
            >
              Open workspace
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="px-5 py-2.5 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-200"
            >
              How it works
            </a>
          </div>

          {/* Stat strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: Layers,
                label: "Node types",
                value: "6",
                hint: "premise → fallacy",
              },
              {
                icon: Target,
                label: "Tree depth",
                value: "3-5",
                hint: "auto-balanced",
              },
              {
                icon: AlertTriangle,
                label: "Fallacies tracked",
                value: "7+",
                hint: "named & flagged",
              },
              {
                icon: Gauge,
                label: "Confidence",
                value: "0-100%",
                hint: "per node",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </div>
                <div className="mt-1.5 text-2xl font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {s.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace */}
      <section id="workspace" className="relative scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[11px] tracking-wider uppercase text-slate-500">
                Workspace
              </div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                Decompose a response
              </h2>
            </div>
            <button
              onClick={loadSample}
              className="text-xs text-slate-400 hover:text-cyan-200 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load sample
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Inputs */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="px-3 py-2 border-b border-white/5 text-[11px] tracking-wider uppercase text-slate-500">
                  Prompt
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What was asked?"
                  className="w-full bg-transparent p-3 text-sm text-slate-200 outline-none resize-none thin-scroll"
                  rows={3}
                />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="px-3 py-2 border-b border-white/5 text-[11px] tracking-wider uppercase text-slate-500 flex items-center justify-between">
                  <span>LLM Response</span>
                  <span className="text-slate-600 normal-case tracking-normal">
                    {response.length} chars
                  </span>
                </div>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Paste the model's full response here..."
                  className="w-full bg-transparent p-3 text-sm text-slate-200 outline-none resize-none thin-scroll"
                  rows={10}
                />
              </div>
              <button
                onClick={decompose}
                disabled={loading || !prompt.trim() || !response.trim()}
                className={`w-full px-4 py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition ${
                  loading
                    ? "bg-cyan-400/40 text-slate-900 pulse-cyan cursor-wait"
                    : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" />
                    Decomposing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Decompose reasoning
                  </>
                )}
              </button>
              {error && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {/* Stats */}
              {stats && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-[11px] tracking-wider uppercase text-slate-500 mb-2">
                    Tree stats
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Nodes" value={stats.nodes} />
                    <Stat label="Depth" value={stats.depth} />
                    <Stat
                      label="Fallacies"
                      value={stats.fallacies}
                      tone={stats.fallacies > 0 ? "rose" : "default"}
                    />
                    <Stat label="Avg confidence" value={`${stats.confidence}%`} />
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="text-[11px] tracking-wider uppercase text-slate-500 mb-2">
                  Legend
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(Object.keys(NODE_META) as Array<keyof typeof NODE_META>).map(
                    (k) => (
                      <div key={k} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: NODE_META[k].color }}
                        />
                        <span className="text-slate-300">
                          {NODE_META[k].label}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-8">
              <div className="rounded-lg border border-white/10 bg-[#04050b] relative overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                  <div className="text-[11px] tracking-wider uppercase text-slate-500">
                    Reasoning tree
                  </div>
                  <div className="text-[11px] text-slate-600 hidden md:block">
                    drag scroll · click node for detail
                  </div>
                </div>
                <div className="bg-grid-fine">
                  {layout ? (
                    <div
                      className="overflow-auto thin-scroll max-h-[640px]"
                      style={{ minHeight: 480 }}
                    >
                      <TreeCanvas
                        layout={layout}
                        selected={selected}
                        onSelect={setSelected}
                      />
                    </div>
                  ) : (
                    <div className="grid place-items-center text-slate-500 text-sm py-32">
                      Decompose a response to see its reasoning tree
                    </div>
                  )}
                </div>

                {/* Detail panel */}
                {selected && (
                  <div className="border-t border-white/5 p-4 bg-white/[0.015]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${NODE_META[selected.type].chip}`}
                          >
                            {NODE_META[selected.type].label}
                          </span>
                          {selected.fallacy && (
                            <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border bg-rose-500/15 border-rose-400/40 text-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {selected.fallacy}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            confidence {Math.round(selected.confidence * 100)}%
                          </span>
                        </div>
                        <div className="text-base font-medium text-slate-100">
                          {selected.label}
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                          {selected.rationale}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="text-xs text-slate-500 hover:text-slate-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-[11px] tracking-wider uppercase text-slate-500">
            About
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
            Reasoning is a structure, not a paragraph.
          </h2>
          <p className="mt-3 text-slate-400 max-w-3xl leading-relaxed">
            LLM outputs read like fluent prose, but the underlying logic is a
            graph: claims supported by premises, premises backed by evidence or
            sliding into assumptions, branches that converge into conclusions
            or break under fallacy. CogniTree extracts that hidden structure so
            you can audit it before you trust it.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Layers,
                title: "Hierarchical decomposition",
                body:
                  "Every claim is mapped to its supporting nodes. 6-14 nodes per response, 3-5 levels deep, color-coded by type.",
              },
              {
                icon: AlertTriangle,
                title: "Fallacy detection",
                body:
                  "False dichotomy, hasty generalization, post hoc, equivocation, no-true-Scotsman, straw man, appeal to authority. Flagged inline.",
              },
              {
                icon: Shield,
                title: "Confidence scoring",
                body:
                  "Each node carries a 0-100% support score derived from how strongly the response text justifies it. Weak nodes stand out.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-5 hover:border-cyan-300/30 transition"
              >
                <div className="w-9 h-9 rounded-md bg-cyan-400/10 border border-cyan-300/20 grid place-items-center mb-3">
                  <f.icon className="w-4 h-4 text-cyan-200" />
                </div>
                <div className="font-medium tracking-tight mb-1">{f.title}</div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center gap-2 text-cyan-200 text-xs tracking-wider uppercase mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Pipeline
            </div>
            <ol className="space-y-2.5 text-sm text-slate-300">
              {[
                "You paste the original prompt and the LLM's full response.",
                "CogniTree's reasoning extractor (powered by an LLM with a forensic system prompt) parses the response into typed nodes.",
                "Nodes are arranged with a tidy-tree layout. Connections are drawn as smooth bezier branches with type-coded colors.",
                "Click any node to inspect its rationale, type, fallacy label (if any), and confidence.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-none w-6 h-6 rounded-md border border-cyan-300/30 bg-cyan-300/5 text-cyan-200 grid place-items-center text-[11px]">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-[11px] tracking-wider uppercase text-slate-500">
            FAQ
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 mb-6">
            Common questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What kind of responses can I decompose?",
                a: "Any text-based LLM answer that contains reasoning, an argument, a recommendation, or a multi-step explanation. Pure factual lookups (single-fact answers) won't have much of a tree.",
              },
              {
                q: "How accurate is the fallacy detection?",
                a: "It catches the most common patterns reliably (false dichotomy, hasty generalization, no-true-Scotsman, post hoc, appeal to authority, straw man, equivocation). Subtle or domain-specific fallacies may be missed. Treat the output as a co-pilot, not an oracle.",
              },
              {
                q: "Is my data stored?",
                a: "No. Prompts and responses are sent to the model provider and not persisted on our side. There is no database, no telemetry, no analytics.",
              },
              {
                q: "Can I export the tree?",
                a: "The full tree is available as JSON in the API response. Visual export (PNG/SVG) is on the roadmap.",
              },
              {
                q: "Why does the same input sometimes produce a slightly different tree?",
                a: "The reasoning extractor is itself an LLM, so trees are deterministic per call but vary across calls. Run twice and compare if you want to stress-test stability.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-white/10 bg-white/[0.02] open:border-cyan-300/30"
              >
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3 text-sm font-medium">
                  <HelpCircle className="w-4 h-4 text-cyan-300/70 flex-none" />
                  <span className="flex-1">{item.q}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 transition group-open:rotate-90" />
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed pl-11">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-cyan-300/70" />
            <span>CogniTree © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#workspace" className="hover:text-slate-300">
              Workspace
            </a>
            <a href="#about" className="hover:text-slate-300">
              About
            </a>
            <a href="#faq" className="hover:text-slate-300">
              FAQ
            </a>
            <a
              href="https://github.com/XinnBlueBird/cognitree"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "rose";
}) {
  const colour =
    tone === "rose" ? "text-rose-300" : "text-slate-100";
  return (
    <div>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${colour}`}>{value}</div>
    </div>
  );
}

function TreeCanvas({
  layout,
  selected,
  onSelect,
}: {
  layout: {
    positioned: PositionedNode;
    flat: PositionedNode[];
    width: number;
    height: number;
  };
  selected: PositionedNode | null;
  onSelect: (n: PositionedNode) => void;
}) {
  const { flat, width, height } = layout;
  const PAD_LEFT = PAD;
  const PAD_TOP = PAD;

  // Build edges
  const edges: Array<{
    from: PositionedNode;
    to: PositionedNode;
    color: string;
  }> = [];
  function walk(n: PositionedNode) {
    n.children.forEach((c) => {
      edges.push({
        from: n,
        to: c,
        color: NODE_META[c.type].color,
      });
      walk(c);
    });
  }
  walk(layout.positioned);

  return (
    <div
      className="relative"
      style={{
        width: Math.max(width, 720),
        height: Math.max(height, 520),
      }}
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        width={Math.max(width, 720)}
        height={Math.max(height, 520)}
      >
        {edges.map((e, i) => {
          const x1 = e.from.x + PAD_LEFT + NODE_W / 2;
          const y1 = e.from.y + PAD_TOP + NODE_H;
          const x2 = e.to.x + PAD_LEFT + NODE_W / 2;
          const y2 = e.to.y + PAD_TOP;
          const midY = (y1 + y2) / 2;
          const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={e.color}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              className="branch-flow"
            />
          );
        })}
      </svg>

      {flat.map((n) => {
        const meta = NODE_META[n.type];
        const isSelected = selected?.id === n.id;
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n)}
            className={`node-card absolute rounded-lg border bg-[#0d1124]/90 backdrop-blur-sm text-left p-2.5 ${
              isSelected
                ? "ring-2 " + meta.ring + " border-white/20"
                : "border-white/10 hover:border-white/20"
            }`}
            style={{
              width: NODE_W,
              height: NODE_H,
              left: n.x + PAD_LEFT,
              top: n.y + PAD_TOP,
              boxShadow: isSelected
                ? `0 0 0 1px ${meta.color}55, 0 0 24px -8px ${meta.color}88`
                : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border"
                style={{
                  background: `${meta.color}15`,
                  borderColor: `${meta.color}55`,
                  color: meta.color,
                }}
              >
                {meta.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {Math.round(n.confidence * 100)}%
              </span>
            </div>
            <div className="text-[13px] leading-snug font-medium text-slate-100 line-clamp-2">
              {n.label}
            </div>
            {n.fallacy && (
              <div className="absolute -top-1.5 -right-1.5">
                <span
                  className="block w-2.5 h-2.5 rounded-full"
                  style={{ background: NODE_META.fallacy.color }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
