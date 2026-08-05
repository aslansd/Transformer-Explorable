import { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { WordVector } from "../types";
import { distance, cosineSimilarity } from "../lib/nn";

/**
 * Toy 2-D word map.
 *
 * X axis = "femininity", Y axis = "royalty".  The four gendered/royal words form
 * an exact parallelogram, so king - man + woman lands precisely on queen:
 *   (-65, 75) - (-70, -70) + (70, -65) = (75, 80)  ✅
 * (In the previous version the axis labels were swapped relative to the data:
 * the X axis was labelled "femininity" while king and queen both sat at x ≈ +70.)
 */
const STATIC_WORDS: WordVector[] = [
  { word: "king", x: -65, y: 75, category: "royal" },
  { word: "queen", x: 75, y: 80, category: "royal" },
  { word: "man", x: -70, y: -70, category: "person" },
  { word: "woman", x: 70, y: -65, category: "person" },
  { word: "throne", x: 5, y: 88, category: "furniture" },
  { word: "lion", x: -30, y: 25, category: "animal" },
  { word: "puppy", x: 5, y: -88, category: "animal" },
  { word: "kitten", x: 40, y: -80, category: "animal" },
  { word: "house", x: -35, y: -30, category: "location" },
];

const byWord = (w: string) => STATIC_WORDS.find((s) => s.word === w)!;

/** -100..100 model coordinate → 0..100 % from the left edge. */
const toLeftPct = (x: number) => (x + 100) / 2;
/** -100..100 model coordinate → 0..100 % from the bottom edge. */
const toBottomPct = (y: number) => (y + 100) / 2;
/** -100..100 model coordinate → 0..100 % from the top edge (for SVG y). */
const toTopPct = (y: number) => 100 - toBottomPct(y);

type MathStage = "idle" | "direction" | "transport" | "result";

export default function ChapterEmbedding() {
  const [inputText, setInputText] = useState("transformer");
  const [activeTab, setActiveTab] = useState<"math" | "map">("math");
  const [mathStage, setMathStage] = useState<MathStage>("idle");
  const [customX, setCustomX] = useState(0);
  const [customY, setCustomY] = useState(0);
  const timers = useRef<number[]>([]);

  // Clear pending animation timers on unmount so we never setState on a dead component.
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  const getSubTokens = (text: string): string[] => {
    const raw = text.toLowerCase().trim();
    const known: Record<string, string[]> = {
      transformer: ["transform", "er"],
      embeddings: ["embed", "ding", "s"],
      "self-attention": ["self", "-", "attention"],
      attention: ["attention"],
      prediction: ["predict", "ion"],
      unbelievable: ["un", "believ", "able"],
    };
    if (known[raw]) return known[raw];
    if (raw.length === 0) return [];
    if (raw.length <= 5) return [raw];
    return [raw.slice(0, 4), raw.slice(4)];
  };

  const tokens = useMemo(() => getSubTokens(inputText), [inputText]);

  // Nearest neighbours to the custom point, by both metrics.
  const { nearestByDistance, nearestByCosine } = useMemo(() => {
    let bestD = STATIC_WORDS[0];
    let bestC = STATIC_WORDS[0];
    let minD = Infinity;
    let maxC = -Infinity;
    STATIC_WORDS.forEach((item) => {
      const d = distance(item.x, item.y, customX, customY);
      if (d < minD) {
        minD = d;
        bestD = item;
      }
      const c = cosineSimilarity(item.x, item.y, customX, customY);
      if (c > maxC) {
        maxC = c;
        bestC = item;
      }
    });
    return { nearestByDistance: bestD.word, nearestByCosine: bestC.word };
  }, [customX, customY]);

  const startVectorMathSequence = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setMathStage("direction");
    timers.current.push(window.setTimeout(() => setMathStage("transport"), 1500));
    timers.current.push(window.setTimeout(() => setMathStage("result"), 3000));
  };

  const king = byWord("king");
  const man = byWord("man");
  const woman = byWord("woman");
  const queen = byWord("queen");
  // woman + (king - man) — this is exactly queen's position, by construction.
  const landing = { x: woman.x + (king.x - man.x), y: woman.y + (king.y - man.y) };

  const highlightedWords = (): string[] => {
    if (mathStage === "direction") return ["king", "man"];
    if (mathStage === "transport") return ["king", "man", "woman"];
    if (mathStage === "result") return ["queen"];
    return [];
  };
  const highlighted = highlightedWords();

  return (
    <div className="space-y-6">
      {/* Learning context card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🗺️ From Text into Numbers (Tokens &amp; Embeddings)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Computers don't read English — they read <strong>numbers</strong>. Turning a
            sentence into something a Transformer can chew on takes two steps:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-stone-600">
            <li>
              <span className="font-semibold text-stone-800">Tokenization</span>: chopping text
              into sub-word pieces, so that rare and made-up words are still spellable from
              familiar parts —{" "}
              <span className="bg-stone-100 font-mono text-xs px-1 rounded border">
                ['transform', 'er']
              </span>
              .
            </li>
            <li>
              <span className="font-semibold text-stone-800">Embedding</span>: looking up a
              vector of numbers for each token — its coordinates on a high-dimensional{" "}
              <strong>word map</strong>. Nobody writes those coordinates by hand; the model{" "}
              <em>learns</em> them during training.
            </li>
          </ul>
          <p>
            Once meaning lives in coordinates, directions on the map start to mean something —
            and you can do arithmetic with them.
          </p>
        </div>
      </div>

      {/* Main interaction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tokenizer */}
        <div className="lg:col-span-5 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              1. The sub-word tokenizer
            </h4>
            <p className="text-xs text-stone-500 leading-normal">
              Type a word (try "transformer", "unbelievable", "embeddings") to see it split into
              sub-word tokens.
            </p>
            <div className="space-y-2">
              <label className="sr-only" htmlFor="tokenizer-input">
                Word to tokenize
              </label>
              <input
                id="tokenizer-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 18))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none focus:bg-white text-stone-900 font-medium"
                placeholder="Type a long word..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["transformer", "embeddings", "unbelievable", "prediction"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setInputText(preset)}
                    className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded-md border border-stone-200 transition-colors"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono tracking-wider text-stone-400 block uppercase">
              Tokenizer output
            </span>
            <div className="flex flex-wrap gap-1.5 items-center min-h-[30px]">
              {tokens.map((tok, idx) => (
                <motion.div
                  key={`${tok}-${idx}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                    idx % 3 === 0
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : idx % 3 === 1
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-teal-100 text-teal-800 border-teal-200"
                  }`}
                >
                  "{tok}"
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 leading-normal pt-1.5">
              Each piece becomes an ID in a vocabulary of roughly 50,000–200,000{" "}
              <em>tokens</em> (not words). The splits above are hand-picked for readability — a
              real BPE tokenizer learns its splits from data and often keeps common words whole.
            </p>
          </div>
        </div>

        {/* Word map */}
        <div className="lg:col-span-7 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-2 gap-2">
            <h4 className="font-display font-semibold text-stone-950 text-sm">
              2. Explore the word map
            </h4>
            <div className="flex bg-stone-100 rounded-xl p-1 border border-stone-200 shrink-0">
              <button
                onClick={() => setActiveTab("math")}
                aria-pressed={activeTab === "math"}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "math"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Vector math
              </button>
              <button
                onClick={() => setActiveTab("map")}
                aria-pressed={activeTab === "map"}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "map"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Tweak coordinates
              </button>
            </div>
          </div>

          {/* Plot */}
          <div className="h-72 w-full bg-stone-950 rounded-2xl relative overflow-hidden border border-stone-800">
            <div className="absolute inset-x-0 top-1/2 border-t border-stone-800" />
            <div className="absolute inset-y-0 left-1/2 border-l border-stone-800" />
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-600 uppercase tracking-widest">
              ↑ more royal (Y)
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-600 uppercase tracking-widest">
              more feminine (X) →
            </span>

            {/* Arrows for the vector-arithmetic walkthrough */}
            {activeTab === "math" && mathStage !== "idle" && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <marker
                    id="arrowhead-amber"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" />
                  </marker>
                  <marker
                    id="arrowhead-rose"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Step 1: the "royalty" direction, man → king */}
                <line
                  x1={toLeftPct(man.x)}
                  y1={toTopPct(man.y)}
                  x2={toLeftPct(king.x)}
                  y2={toTopPct(king.y)}
                  stroke="#fbbf24"
                  strokeWidth="0.6"
                  strokeDasharray="2 1.5"
                  vectorEffect="non-scaling-stroke"
                  markerEnd="url(#arrowhead-amber)"
                />

                {/* Step 2+: the same arrow, moved so it starts at woman */}
                {mathStage !== "direction" && (
                  <line
                    x1={toLeftPct(woman.x)}
                    y1={toTopPct(woman.y)}
                    x2={toLeftPct(landing.x)}
                    y2={toTopPct(landing.y)}
                    stroke={mathStage === "result" ? "#f43f5e" : "#fbbf24"}
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                    markerEnd={
                      mathStage === "result"
                        ? "url(#arrowhead-rose)"
                        : "url(#arrowhead-amber)"
                    }
                  />
                )}
              </svg>
            )}

            {/* Word nodes */}
            {STATIC_WORDS.map((item) => {
              const isHot = highlighted.includes(item.word);
              return (
                <motion.div
                  key={item.word}
                  style={{
                    position: "absolute",
                    left: `${toLeftPct(item.x)}%`,
                    bottom: `${toBottomPct(item.y)}%`,
                  }}
                  className={`-translate-x-1/2 translate-y-1/2 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border transition-all pointer-events-none ${
                    isHot
                      ? "bg-amber-400 text-stone-900 border-amber-300 scale-110 shadow-lg shadow-amber-500/20 z-20"
                      : "bg-stone-900 text-stone-400 border-stone-800 z-10"
                  }`}
                  id={`embedding-node-${item.word}`}
                >
                  {item.word}
                </motion.div>
              );
            })}

            {/* Custom point */}
            {activeTab === "map" && (
              <div
                style={{
                  position: "absolute",
                  left: `${toLeftPct(customX)}%`,
                  bottom: `${toBottomPct(customY)}%`,
                }}
                className="w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500 border-2 border-white shadow-xl z-30"
                id="embedding-dragger"
              >
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-mono font-bold rounded px-1 whitespace-nowrap shadow">
                  your concept
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {activeTab === "math" ? (
            <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3.5">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <h5 className="text-xs font-semibold text-stone-800">
                    The famous one: king − man + woman ≈ queen
                  </h5>
                  <p className="text-[10px] text-stone-500">
                    Watch it as geometry: grab a direction, then re-use it somewhere else.
                  </p>
                </div>
                <button
                  onClick={startVectorMathSequence}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg border border-amber-600 shadow transition-all flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={13} /> Run it
                </button>
              </div>

              <div className="flex gap-1.5 items-center justify-around font-mono text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 flex-wrap">
                <span className="font-bold text-stone-800">👑 king</span>
                <span>−</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    mathStage === "direction"
                      ? "bg-amber-100 text-amber-900 border border-amber-200 font-bold"
                      : ""
                  }`}
                >
                  👨 man
                </span>
                <span>+</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    mathStage === "transport"
                      ? "bg-amber-100 text-amber-900 border border-amber-200 font-bold"
                      : ""
                  }`}
                >
                  👩 woman
                </span>
                <span>=</span>
                <span
                  className={`px-2 py-0.5 rounded-lg ${
                    mathStage === "result"
                      ? "bg-rose-500 text-white font-bold"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {mathStage === "result"
                    ? `👸 queen (${queen.x}, ${queen.y})`
                    : "…"}
                </span>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed bg-white border border-stone-200 rounded-lg p-2.5">
                {mathStage === "idle" &&
                  "Press Run. Step 1 draws the arrow from man to king — that arrow is the 'royalty' direction. Step 2 picks the very same arrow up and drops it on woman."}
                {mathStage === "direction" &&
                  "Step 1 — king − man isolates a direction on the map: 'become royal'. It is just a subtraction of two coordinate pairs."}
                {mathStage === "transport" &&
                  "Step 2 — add that direction to woman. Same length, same angle, different starting point."}
                {mathStage === "result" &&
                  "You land on queen. Worth knowing: this famous result is real but flattering — it usually only works after the three input words are excluded from the answer, and it fails on plenty of other analogies."}
              </p>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3">
              <h5 className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                🎛️ Adjust the two dimensions of "your concept"
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="embed-x"
                    className="text-[10px] font-mono text-stone-500 flex justify-between"
                  >
                    <span>Femininity (X)</span>
                    <span className="font-bold text-stone-700">{customX}</span>
                  </label>
                  <input
                    id="embed-x"
                    type="range"
                    min="-90"
                    max="90"
                    value={customX}
                    onChange={(e) => setCustomX(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="embed-y"
                    className="text-[10px] font-mono text-stone-500 flex justify-between"
                  >
                    <span>Royalty (Y)</span>
                    <span className="font-bold text-stone-700">{customY}</span>
                  </label>
                  <input
                    id="embed-y"
                    type="range"
                    min="-90"
                    max="90"
                    value={customY}
                    onChange={(e) => setCustomY(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center gap-2">
                  <span>Nearest word by distance:</span>
                  <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200 rounded font-bold uppercase text-[10px]">
                    {nearestByDistance}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>Nearest by cosine similarity (angle):</span>
                  <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200 rounded font-bold uppercase text-[10px]">
                    {nearestByCosine}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed pt-1 border-t border-stone-100">
                  These two often disagree. Real embedding search almost always uses cosine
                  similarity — it cares about the <em>direction</em> a word points, not how far
                  from the origin it sits.
                </p>
              </div>

              <p className="text-[10px] text-stone-400 leading-relaxed">
                Two axes is a cartoon. Real embeddings have 256–4096 dimensions, and no single
                one is cleanly "femininity" — the interpretable directions are combinations of
                many dimensions at once.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
