import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import { AttentionHead } from "../types";

const HEADS: AttentionHead[] = [
  {
    id: 1,
    name: "Descriptor head (H1)",
    description:
      "Adjectives reach forward to the noun they modify. Handy for keeping 'brown' attached to 'fox' rather than 'dog'.",
    color: "pink",
    focusType: "quick/brown → fox · lazy → dog",
  },
  {
    id: 2,
    name: "Predicate head (H2)",
    description:
      "The verb reaches back to its subject and forward to what it acts on — the who-did-what-to-whom skeleton.",
    color: "sky",
    focusType: "jumps → fox (subject) · jumps → dog (via 'over')",
  },
  {
    id: 3,
    name: "Function-word head (H3)",
    description:
      "Articles and prepositions bind to the noun phrase they belong to, which mostly keeps the syntax tidy.",
    color: "teal",
    focusType: "the → fox · over/the → dog",
  },
];

const SENTENCE = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"];

const LINKS: Record<number, { from: number; to: number }[]> = {
  1: [
    { from: 1, to: 3 }, // quick -> fox
    { from: 2, to: 3 }, // brown -> fox
    { from: 7, to: 8 }, // lazy  -> dog
  ],
  2: [
    { from: 4, to: 3 }, // jumps -> fox
    { from: 4, to: 8 }, // jumps -> dog
  ],
  3: [
    { from: 0, to: 3 }, // The  -> fox
    { from: 5, to: 8 }, // over -> dog
    { from: 6, to: 8 }, // the  -> dog
  ],
};

const STROKE: Record<number, string> = {
  1: "#ec4899",
  2: "#0ea5e9",
  3: "#14b8a6",
};

interface Point {
  x: number;
  y: number;
}

export default function ChapterMultiHead() {
  const [activeHeadId, setActiveHeadId] = useState<number | "all">("all");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [anchors, setAnchors] = useState<Point[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Measure the word chips *after* they are in the DOM, relative to the same
   * element the <svg> is positioned against. The previous version called
   * document.getElementById() during render (so nothing was drawn on first
   * paint) and measured against the flex row rather than the padded canvas
   * (so every arc was offset by the padding).
   */
  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const points = nodeRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left - canvasRect.left + r.width / 2,
        y: r.bottom - canvasRect.top,
      };
    });
    setAnchors(points);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(canvas);
    window.addEventListener("resize", measure);
    // Re-measure once webfonts land, since they change chip widths.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => undefined);
    }
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const visibleHeadIds = activeHeadId === "all" ? [1, 2, 3] : [activeHeadId];

  const arcs = visibleHeadIds.flatMap((headId) =>
    LINKS[headId].map((link, idx) => ({ ...link, headId, key: `${headId}-${idx}` })),
  );

  return (
    <div className="space-y-6">
      {/* Learning card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🕵️ Division of Labour (Multi-Head Attention)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            One sentence carries several relationships at once. In{" "}
            <span className="font-semibold text-stone-800">
              "The quick brown fox jumps over the lazy dog."
            </span>
            :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600 text-xs">
            <li>Who performed the action? (fox jumps)</li>
            <li>Which adjectives attach to which nouns? (brown fox, lazy dog)</li>
            <li>Which function words hold the phrases together? (over the dog)</li>
          </ul>
          <p>
            A single attention pattern has to compromise between these. So instead of one big
            head, the model <strong>splits</strong> its vectors into <em>h</em> smaller slices —
            each with its own W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> — and runs attention on
            all of them in parallel. With d<sub>model</sub> = 512 and h = 8 heads, each head
            works in 64 dimensions, so the total cost is about the same as one full-size head.
          </p>
          <p>
            Afterwards the heads' outputs are <strong>concatenated</strong> back into one vector
            and passed through one more learned matrix, W<sub>O</sub>, which decides how to mix
            their reports.
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-display font-semibold text-stone-900 text-base">
              The head orchestra
            </h4>
            <p className="text-xs text-stone-500">
              Pick a head to see the links it happens to specialise in.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setActiveHeadId("all")}
              aria-pressed={activeHeadId === "all"}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeHeadId === "all"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              All heads
            </button>
            {HEADS.map((head) => (
              <button
                key={head.id}
                onClick={() => setActiveHeadId(head.id)}
                aria-pressed={activeHeadId === head.id}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all border border-transparent ${
                  activeHeadId === head.id
                    ? head.id === 1
                      ? "bg-pink-100 text-pink-800 border-pink-200"
                      : head.id === 2
                        ? "bg-sky-100 text-sky-800 border-sky-200"
                        : "bg-teal-100 text-teal-800 border-teal-200"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {head.name}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="bg-stone-50 border border-stone-200 rounded-xl p-6 relative overflow-hidden"
        >
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 relative z-20 w-full">
            {SENTENCE.map((word, wIdx) => {
              const touched = arcs.some((a) => a.from === wIdx || a.to === wIdx);
              return (
                <div
                  key={wIdx}
                  ref={(el) => {
                    nodeRefs.current[wIdx] = el;
                  }}
                  onMouseEnter={() => setHoveredIdx(wIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`bg-white border-2 px-3 py-2 rounded-xl text-xs font-semibold select-none transition-all duration-300 ${
                    hoveredIdx === wIdx
                      ? "border-stone-500 shadow scale-105 text-stone-900"
                      : touched
                        ? "border-stone-300 text-stone-700"
                        : "border-stone-200 text-stone-400"
                  }`}
                  id={`multihead-node-${wIdx}`}
                >
                  {word}
                </div>
              );
            })}
          </div>

          {/* Room for the arcs to hang below the words */}
          <div className="h-28" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" aria-hidden="true">
            {anchors.length === SENTENCE.length &&
              arcs.map((arc) => {
                const a = anchors[arc.from];
                const b = anchors[arc.to];
                if (!a || !b) return null;

                const y = Math.max(a.y, b.y) + 6;
                const depth = Math.min(90, Math.abs(a.x - b.x) * 0.45 + 24);
                const dimmed = hoveredIdx !== null && hoveredIdx !== arc.from && hoveredIdx !== arc.to;

                return (
                  <path
                    key={arc.key}
                    d={`M ${a.x} ${y} Q ${(a.x + b.x) / 2} ${y + depth} ${b.x} ${y}`}
                    fill="none"
                    stroke={STROKE[arc.headId]}
                    strokeWidth={activeHeadId === "all" ? 1.8 : 2.5}
                    strokeDasharray={activeHeadId === "all" ? "3 3" : undefined}
                    opacity={dimmed ? 0.15 : 0.85}
                    strokeLinecap="round"
                  />
                );
              })}
          </svg>

          <p className="text-[10px] font-mono text-center text-stone-400 relative z-20">
            Every head runs over the whole sentence in the same forward pass — they don't take
            turns.
          </p>
        </div>

        {/* Head cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADS.map((head) => {
            const isActive = activeHeadId === "all" || activeHeadId === head.id;
            return (
              <button
                key={head.id}
                onClick={() => setActiveHeadId(head.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? head.id === 1
                      ? "bg-pink-50/50 border-pink-300 text-pink-900"
                      : head.id === 2
                        ? "bg-sky-50/50 border-sky-300 text-sky-900"
                        : "bg-teal-50/50 border-teal-300 text-teal-900"
                    : "bg-stone-50 border-stone-200/50 text-stone-400"
                }`}
              >
                <div className="flex justify-between items-center font-bold mb-1.5 text-xs">
                  <span>{head.name}</span>
                  <Layers size={13} />
                </div>
                <p className="text-[11px] leading-relaxed mb-3">{head.description}</p>
                <div className="font-mono text-[9px] font-bold bg-white/80 px-2 py-1 rounded border border-stone-200 block">
                  {head.focusType}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 border border-stone-200 rounded-xl p-3.5">
          ⚠️ <strong>An honest caveat.</strong> Nobody assigns these jobs. Heads are initialised
          randomly and whatever specialisation appears is emergent — and messy. Researchers do
          find heads that track syntax in trained models, but plenty of heads have no tidy
          description at all, many can be pruned with little loss, and reading attention weights
          as an explanation of what a model "thought" is contested. The three clean heads above
          are a teaching illustration, not a screenshot of a real model.
        </p>
      </div>
    </div>
  );
}
