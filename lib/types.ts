export type NodeType =
  | "premise"
  | "inference"
  | "evidence"
  | "assumption"
  | "conclusion"
  | "fallacy";

export interface ReasoningNode {
  id: string;
  label: string;
  type: NodeType;
  confidence: number;
  fallacy: string | null;
  rationale: string;
  children: ReasoningNode[];
}

export interface ReasoningTree {
  root: ReasoningNode;
}

export interface PositionedNode extends ReasoningNode {
  x: number;
  y: number;
  depth: number;
  children: PositionedNode[];
}

export const NODE_META: Record<
  NodeType,
  { label: string; color: string; ring: string; chip: string }
> = {
  premise: {
    label: "Premise",
    color: "#5ee5ff",
    ring: "ring-cyan-300/40",
    chip: "bg-cyan-400/10 text-cyan-200 border-cyan-400/30",
  },
  inference: {
    label: "Inference",
    color: "#a78bfa",
    ring: "ring-violet-300/40",
    chip: "bg-violet-400/10 text-violet-200 border-violet-400/30",
  },
  evidence: {
    label: "Evidence",
    color: "#34d399",
    ring: "ring-emerald-300/40",
    chip: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
  },
  assumption: {
    label: "Assumption",
    color: "#fbbf24",
    ring: "ring-amber-300/40",
    chip: "bg-amber-400/10 text-amber-200 border-amber-400/30",
  },
  conclusion: {
    label: "Conclusion",
    color: "#f472b6",
    ring: "ring-pink-300/40",
    chip: "bg-pink-400/10 text-pink-200 border-pink-400/30",
  },
  fallacy: {
    label: "Fallacy",
    color: "#fb7185",
    ring: "ring-rose-300/50",
    chip: "bg-rose-500/15 text-rose-200 border-rose-400/40",
  },
};
