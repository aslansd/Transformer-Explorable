/**
 * Small, honest implementations of the maths the explorable talks about.
 * Every chapter imports from here so the numbers on screen always agree
 * with the formulas printed next to them.
 */

/** Numerically-stable softmax. Returns a vector that sums to exactly 1. */
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

/**
 * Round a probability vector to integer percentages that still sum to 100
 * (largest-remainder method). Without this, naive rounding produces rows
 * that sum to 98% or 105% - which would contradict the claim that softmax
 * produces a probability distribution.
 */
export function toPercentages(probs: number[]): number[] {
  const raw = probs.map((p) => p * 100);
  const floors = raw.map((v) => Math.floor(v));
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++) {
    out[order[k].i] += 1;
    remainder -= 1;
  }
  return out;
}

/** Attention head dimension used throughout the explorable (the 2017 paper uses 64). */
export const D_K = 64;

/**
 * Scaled dot-product attention weights for a single query row.
 * scores = raw q·k dot products; we divide by sqrt(d_k) before the softmax,
 * exactly as in Attention(Q,K,V) = softmax(QKᵀ / √d_k) V.
 */
export function attentionRow(scores: number[], dK: number = D_K): number[] {
  const scale = Math.sqrt(dK);
  return softmax(scores.map((s) => s / scale));
}

/**
 * Sinusoidal positional encoding from "Attention Is All You Need".
 *   PE(pos, 2i)   = sin(pos / base^(2i/d_model))
 *   PE(pos, 2i+1) = cos(pos / base^(2i/d_model))
 *
 * NOTE the direction of the frequencies: dimension 0 is the FASTEST wave and
 * higher dimensions get slower and slower. (The original paper uses
 * base = 10000 and d_model = 512; the explorable uses smaller numbers purely
 * so that every wave visibly moves across a short sentence.)
 */
export function positionalEncoding(
  pos: number,
  dim: number,
  dModel: number,
  base: number,
): number {
  const pair = Math.floor(dim / 2);
  const angle = pos / Math.pow(base, (2 * pair) / dModel);
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

/** Angular frequency of the sin/cos pair that dimension `dim` belongs to. */
export function peFrequency(dim: number, dModel: number, base: number): number {
  const pair = Math.floor(dim / 2);
  return 1 / Math.pow(base, (2 * pair) / dModel);
}

/** Euclidean distance in the toy 2-D word map. */
export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

/** Cosine similarity in the toy 2-D word map (what real vector search actually uses). */
export function cosineSimilarity(ax: number, ay: number, bx: number, by: number): number {
  const dot = ax * bx + ay * by;
  const mag = Math.hypot(ax, ay) * Math.hypot(bx, by);
  return mag === 0 ? 0 : dot / mag;
}
