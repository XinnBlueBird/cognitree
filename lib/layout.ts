import type { PositionedNode, ReasoningNode } from "./types";

/**
 * Tidy tree layout (Reingold-Tilford-ish, simplified).
 * Returns positions in abstract units; consumer scales to pixels.
 */
export function layoutTree(
  root: ReasoningNode,
  options: { hSpacing?: number; vSpacing?: number } = {}
): { positioned: PositionedNode; width: number; height: number } {
  const hSpacing = options.hSpacing ?? 240;
  const vSpacing = options.vSpacing ?? 150;

  let cursor = 0;

  function assign(
    node: ReasoningNode,
    depth: number
  ): PositionedNode {
    if (!node.children || node.children.length === 0) {
      const positioned: PositionedNode = {
        ...node,
        x: cursor * hSpacing,
        y: depth * vSpacing,
        depth,
        children: [],
      };
      cursor += 1;
      return positioned;
    }
    const placedChildren = node.children.map((c) => assign(c, depth + 1));
    const first = placedChildren[0].x;
    const last = placedChildren[placedChildren.length - 1].x;
    const x = (first + last) / 2;
    return {
      ...node,
      x,
      y: depth * vSpacing,
      depth,
      children: placedChildren,
    };
  }

  const positioned = assign(root, 0);

  // Compute bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;
  function walk(n: PositionedNode) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
    n.children.forEach(walk);
  }
  walk(positioned);

  // Shift so minX = 0
  const shift = -minX;
  function shiftAll(n: PositionedNode) {
    n.x += shift;
    n.children.forEach(shiftAll);
  }
  shiftAll(positioned);

  const width = maxX - minX;
  const height = maxY;

  return { positioned, width, height };
}

export function flattenTree(node: PositionedNode): PositionedNode[] {
  const out: PositionedNode[] = [node];
  node.children.forEach((c) => out.push(...flattenTree(c)));
  return out;
}

export function countNodes(node: ReasoningNode): number {
  return 1 + (node.children?.reduce((s, c) => s + countNodes(c), 0) ?? 0);
}

export function maxDepth(node: ReasoningNode, depth = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(...node.children.map((c) => maxDepth(c, depth + 1)));
}

export function countFallacies(node: ReasoningNode): number {
  const self = node.type === "fallacy" ? 1 : 0;
  return (
    self +
    (node.children?.reduce((s, c) => s + countFallacies(c), 0) ?? 0)
  );
}

export function avgConfidence(node: ReasoningNode): number {
  let sum = 0;
  let count = 0;
  function walk(n: ReasoningNode) {
    sum += n.confidence;
    count += 1;
    n.children?.forEach(walk);
  }
  walk(node);
  return count === 0 ? 0 : sum / count;
}
