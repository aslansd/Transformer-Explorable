import { useState } from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface ContextExample {
  sentence: string[];
  focusIndex: number;
  highlightIndices: number[];
  category: string;
  cardTitle: string;
  description: string;
  /** The four illustrative "meaning dials" for this word in this context. */
  vector: { term: string; value: number }[];
  /** The same dials for the word looked up alone, with no context at all. */
  isolated: { term: string; value: number }[];
}

const BANK_ISOLATED = [
  { term: "Nature & Rivers", value: 46 },
  { term: "Finance & Money", value: 52 },
  { term: "Buildings", value: 44 },
  { term: "Earthiness", value: 41 },
];

const CELL_ISOLATED = [
  { term: "Organic Life", value: 48 },
  { term: "Technology", value: 35 },
  { term: "Incarceration", value: 42 },
  { term: "Power/Battery", value: 30 },
];

const EXPERIMENTS: ContextExample[] = [
  {
    sentence: ["The", "river", "bank", "was", "steep", "and", "muddy"],
    focusIndex: 2,
    highlightIndices: [1, 4, 6],
    category: "Earth / Nature",
    cardTitle: "Natural Shoreline",
    description:
      "'river', 'steep' and 'muddy' push the word 'bank' towards a geographic dirt slope.",
    vector: [
      { term: "Nature & Rivers", value: 94 },
      { term: "Finance & Money", value: 3 },
      { term: "Buildings", value: 12 },
      { term: "Earthiness", value: 89 },
    ],
    isolated: BANK_ISOLATED,
  },
  {
    sentence: ["The", "savings", "bank", "approved", "our", "home", "loan"],
    focusIndex: 2,
    highlightIndices: [1, 3, 6],
    category: "Finance / Institution",
    cardTitle: "Financial Institution",
    description:
      "'savings', 'approved' and 'loan' project the very same word into the world of money and debt.",
    vector: [
      { term: "Nature & Rivers", value: 1 },
      { term: "Finance & Money", value: 96 },
      { term: "Buildings", value: 78 },
      { term: "Earthiness", value: 5 },
    ],
    isolated: BANK_ISOLATED,
  },
  {
    sentence: ["The", "biological", "cell", "was", "dividing", "quickly"],
    focusIndex: 2,
    highlightIndices: [1, 4],
    category: "Biology / Cells",
    cardTitle: "Organism Biology",
    description: "'biological' and 'dividing' tell us this 'cell' is a unit of organic life.",
    vector: [
      { term: "Organic Life", value: 98 },
      { term: "Technology", value: 2 },
      { term: "Incarceration", value: 1 },
      { term: "Power/Battery", value: 4 },
    ],
    isolated: CELL_ISOLATED,
  },
  {
    sentence: ["The", "prison", "cell", "was", "cold", "and", "dark"],
    focusIndex: 2,
    highlightIndices: [1, 4, 6],
    category: "Incarceration / Jail",
    cardTitle: "Correctional Facility",
    description:
      "Surrounded by 'prison', 'cold' and 'dark', the same word becomes a small locked room.",
    vector: [
      { term: "Organic Life", value: 0 },
      { term: "Technology", value: 5 },
      { term: "Incarceration", value: 95 },
      { term: "Power/Battery", value: 2 },
    ],
    isolated: CELL_ISOLATED,
  },
];

export default function ChapterIntro() {
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showIsolated, setShowIsolated] = useState(false);
  const [visited, setVisited] = useState<number[]>([0]);

  const active = EXPERIMENTS[activeExpIdx];
  const shownVector = showIsolated ? active.isolated : active.vector;
  const focusWord = active.sentence[active.focusIndex];

  const selectExperiment = (idx: number) => {
    setActiveExpIdx(idx);
    setVisited((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  return (
    <div className="space-y-6">
      {/* Concept introduction card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🗣️ The Curse of Context
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Early language models gave every word one fixed vector, like a single dictionary
            entry. The word <span className="font-bold underline text-amber-800">bank</span> got
            one entry and <span className="font-bold underline text-amber-800">cell</span> got
            another — no matter which sentence they turned up in.
          </p>
          <p className="font-semibold text-stone-800">
            But words are chameleons. Their meaning is shaped by their neighbours.
          </p>
          <p>
            So a Transformer gives every word a <em>second</em>, context-dependent
            representation: each word looks around at the rest of the sentence and{" "}
            <strong>pays attention</strong> to the words that pin down what it means here. That
            single idea is what the rest of this guide unpacks.
          </p>
        </div>
      </div>

      {/* Interactive activity */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display font-semibold text-stone-900 text-base">
              Interactive experiment: semantic shift
            </h3>
            <p className="text-xs text-stone-500">
              Same word, four sentences. Watch which neighbours do the work.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXPERIMENTS.map((exp, idx) => (
              <button
                key={exp.cardTitle}
                onClick={() => selectExperiment(idx)}
                aria-pressed={activeExpIdx === idx}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  activeExpIdx === idx
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {exp.cardTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Sentence canvas */}
        <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 relative z-10">
            {active.sentence.map((word, wIdx) => {
              const isFocus = wIdx === active.focusIndex;
              const isAnchor = active.highlightIndices.includes(wIdx);

              return (
                <motion.div
                  key={`${activeExpIdx}-${wIdx}`}
                  onMouseEnter={() => setHoveredIdx(wIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold select-none transition-all duration-300 relative ${
                    isFocus
                      ? "bg-amber-500 text-white shadow-md ring-2 ring-amber-300"
                      : isAnchor
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-white text-stone-700 border border-stone-200"
                  } ${hoveredIdx === wIdx ? "ring-2 ring-stone-400" : ""}`}
                  id={`intro-word-${wIdx}`}
                >
                  {word}
                  {isAnchor && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: wIdx * 0.2 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-stone-500 mt-6 font-mono max-w-md">
            Word in focus:{" "}
            <span className="font-bold underline text-amber-600">{focusWord}</span>. Blue words
            are the context-givers that disambiguate it.
          </p>
        </div>

        {/* Breakdown panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <div className="bg-stone-50/50 border border-stone-200/60 rounded-xl p-5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Context category: {active.category}
              </span>
              <p className="text-sm font-medium text-stone-800 leading-snug">
                {active.description}
              </p>
            </div>
            <button
              onClick={() => setShowIsolated((v) => !v)}
              aria-pressed={showIsolated}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                showIsolated
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              {showIsolated
                ? `↩ Put "${focusWord}" back in its sentence`
                : `🔇 Show "${focusWord}" with no context`}
            </button>
          </div>

          {/* Meaning dials */}
          <div className="bg-stone-900 text-white rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800 gap-2">
              <h5 className="font-mono text-xs font-semibold tracking-wider text-stone-400 uppercase">
                {showIsolated ? "🔇 Context-free vector" : "🧠 Context-shifted vector"}: "
                {focusWord}"
              </h5>
              <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-amber-400 shrink-0">
                d = 4
              </span>
            </div>

            <div className="space-y-3">
              {shownVector.map((item) => (
                <div key={item.term} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300">{item.term}</span>
                    <span className="font-bold text-amber-500">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      animate={{ width: `${item.value}%` }}
                      transition={{ type: "spring", stiffness: 80 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-stone-500 leading-relaxed border-t border-stone-800 pt-2">
              {showIsolated
                ? "With no neighbours, the word sits on the fence between its senses. That is what a fixed, non-contextual embedding looks like."
                : "Real models use hundreds or thousands of these dials, and nobody labels them by hand — the names here are invented so the picture stays readable."}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-wrap gap-3 justify-between items-center pt-2 border-t border-stone-100">
          {visited.length < EXPERIMENTS.length ? (
            <span className="text-stone-500 text-xs italic">
              Seen {visited.length} of {EXPERIMENTS.length} scenarios — try the rest!
            </span>
          ) : (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <CheckCircle size={14} /> Nice. You watched one word take four different meanings.
            </span>
          )}
          <button
            onClick={() => selectExperiment((activeExpIdx + 1) % EXPERIMENTS.length)}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl border border-stone-200 transition-all font-semibold"
          >
            Next scenario <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
