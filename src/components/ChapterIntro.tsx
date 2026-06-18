import React, { useState } from "react";
import { HelpCircle, ChevronRight, CheckCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContextExample {
  sentence: string[];
  focusIndex: number;
  highlightIndices: number[];
  category: string;
  cardTitle: string;
  description: string;
  vector: { term: string; value: number }[];
}

const EXPERIMENTS: ContextExample[] = [
  {
    sentence: ["The", "river", "bank", "was", "steep", "and", "muddy"],
    focusIndex: 2,
    highlightIndices: [1, 4, 6],
    category: "Earth / Nature",
    cardTitle: "Natural Shoreline",
    description: "Here, words like 'river', 'steep' and 'muddy' force the word 'bank' to describe a geographic dirt slope.",
    vector: [
      { term: "Nature & Rivers", value: 94 },
      { term: "Finance & Money", value: 3 },
      { term: "Buildings", value: 12 },
      { term: "Earthiness", value: 89 }
    ]
  },
  {
    sentence: ["The", "savings", "bank", "approved", "our", "home", "loan"],
    focusIndex: 2,
    highlightIndices: [1, 3, 5, 6],
    category: "Finance / Institution",
    cardTitle: "Financial Institution",
    description: "Words like 'savings', 'approved' and 'loan' project the word 'bank' into the financial domain of money and debt.",
    vector: [
      { term: "Nature & Rivers", value: 1 },
      { term: "Finance & Money", value: 96 },
      { term: "Buildings", value: 78 },
      { term: "Earthiness", value: 5 }
    ]
  },
  {
    sentence: ["The", "biological", "cell", "was", "dividing", "quickly"],
    focusIndex: 2,
    highlightIndices: [1, 4],
    category: "Biology / Cells",
    cardTitle: "Organism Biology",
    description: "In biology, 'dividing' and 'biological' tell us that this 'cell' is a unit of organic life.",
    vector: [
      { term: "Organic Life", value: 98 },
      { term: "Technology", value: 2 },
      { term: "Incarceration", value: 1 },
      { term: "Power/Battery", value: 4 }
    ]
  },
  {
    sentence: ["The", "prison", "cell", "was", "cold", "and", "dark"],
    focusIndex: 2,
    highlightIndices: [1, 4, 6],
    category: "Incarceration / Jail",
    cardTitle: "Correctional Facility",
    description: "Surrounded by 'prison', 'cold', and 'dark', the word 'cell' transforms into a small lockup room.",
    vector: [
      { term: "Organic Life", value: 0 },
      { term: "Technology", value: 5 },
      { term: "Incarceration", value: 95 },
      { term: "Power/Battery", value: 2 }
    ]
  }
];

export default function ChapterIntro() {
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const [userHoveredIdx, setUserHoveredIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const active = EXPERIMENTS[activeExpIdx];

  return (
    <div className="space-y-6">
      {/* Concept Introduction card like ncase.me */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🗣️ The Curse of Context
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            For decades, computers treated words like isolated entries in a dictionary. The word{" "}
            <span className="font-bold underline text-amber-800">bank</span> had one fixed entry, and the word{" "}
            <span className="font-bold underline text-amber-800">cell</span> had another.
          </p>
          <p className="font-semibold text-stone-800">
            But words are chameleons! Their true meaning is shaped entirely by their neighbors.
          </p>
          <p>
            To understand natural human thought, a model can't just read words left-to-right or in isolation.
            It must allow words to **pay attention** to each other and morph their meanings in real-time.
          </p>
        </div>
      </div>

      {/* Interactive Activity */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display font-semibold text-stone-900 text-base">
              Interactive Experiment: Semantic Shift
            </h3>
            <p className="text-xs text-stone-500">
              Click different scenarios to watch how adjacent words transmit context.
            </p>
          </div>
          {/* Quick selectors */}
          <div className="flex flex-wrap gap-1.5">
            {EXPERIMENTS.map((exp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveExpIdx(idx);
                  setSolved(true);
                }}
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

        {/* Visual interactive Sentence Canvas */}
        <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden">
          {/* Floating Context stream arrows */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 relative z-10">
            {active.sentence.map((word, wIdx) => {
              const isFocus = wIdx === active.focusIndex;
              const isHighlighter = active.highlightIndices.includes(wIdx);
              const isHovered = userHoveredIdx === wIdx;

              return (
                <motion.div
                  key={wIdx}
                  onClick={() => setUserHoveredIdx(wIdx === userHoveredIdx ? null : wIdx)}
                  onMouseEnter={() => setUserHoveredIdx(wIdx)}
                  onMouseLeave={() => setUserHoveredIdx(null)}
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer select-none transition-all duration-300 relative ${
                    isFocus
                      ? "bg-amber-500 text-white shadow-md ring-2 ring-amber-300"
                      : isHighlighter
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
                  }`}
                  id={`intro-word-${wIdx}`}
                >
                  {word}

                  {/* Draw connection animation links */}
                  {isHighlighter && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: wIdx * 0.2 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-stone-500 mt-6 font-mono max-w-md">
            Word in focus: <span className="font-bold underline text-amber-600">{active.sentence[active.focusIndex]}</span>. Highlights show context-givers (anchors).
          </p>
        </div>

        {/* Breakdown Panel with Dynamic Meaning Spectrum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Descriptive explain block */}
          <div className="bg-stone-50/50 border border-stone-200/60 rounded-xl p-5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Context Category: {active.category}
              </span>
              <p className="text-sm font-medium text-stone-800 leading-snug">
                {active.description}
              </p>
            </div>
            <div className="text-xs text-stone-500 flex items-center gap-1.5 pt-2 border-t border-stone-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Tip: Hover over context words to see vectors adjust!
            </div>
          </div>

          {/* Meaning Vector Visualizer (Coordinate graph) */}
          <div className="bg-stone-900 text-white rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h5 className="font-mono text-xs font-semibold tracking-wider text-stone-400 uppercase">
                🧠 Context-Shifted Vector: "{active.sentence[active.focusIndex]}"
              </h5>
              <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">
                d=4
              </span>
            </div>

            <div className="space-y-3">
              {active.vector.map((item, idx) => {
                // Boost or damp weight based on hover
                const isAnchorHovered = active.highlightIndices.includes(userHoveredIdx || -1);
                const val = (userHoveredIdx !== null && active.highlightIndices.includes(userHoveredIdx))
                  ? Math.min(100, Math.max(0, item.value + (idx % 2 === 0 ? 10 : -8)))
                  : item.value;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-300">{item.term}</span>
                      <span className="font-bold text-amber-500">{val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ type: "spring", stiffness: 80 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Playful check button */}
        <div className="flex justify-between items-center pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            {!solved ? (
              <span className="text-stone-500 text-xs italic">Read this and select a card to proceed!</span>
            ) : (
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <CheckCircle size={14} /> Solved: You saw how context anchors shift semantic maps!
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setActiveExpIdx((activeExpIdx + 1) % EXPERIMENTS.length);
              setSolved(true);
            }}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl border border-stone-200 transition-all font-semibold"
          >
            Next Scenario <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
