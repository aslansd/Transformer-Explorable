import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, BrainCircuit, Play, RotateCcw } from "lucide-react";
import { ChapterId } from "./types";

import TransformerGuide from "./components/TransformerGuide";
import ChapterIntro from "./components/ChapterIntro";
import ChapterEmbedding from "./components/ChapterEmbedding";
import ChapterPosEncoding from "./components/ChapterPosEncoding";
import ChapterAttention from "./components/ChapterAttention";
import ChapterMultiHead from "./components/ChapterMultiHead";
import ChapterSandbox from "./components/ChapterSandbox";

interface ChapterDetail {
  id: ChapterId;
  title: string;
  subtitle: string;
  badge: string;
}

const CHAPTERS: ChapterDetail[] = [
  {
    id: "intro",
    title: "1. The Curse of Context",
    subtitle: "Why words are chameleons",
    badge: "Context",
  },
  {
    id: "embeddings",
    title: "2. The Word Map",
    subtitle: "Writing meaning as coordinates",
    badge: "Embeddings",
  },
  {
    id: "position",
    title: "3. Positional Waves",
    subtitle: "Beating order-blindness",
    badge: "Position",
  },
  {
    id: "attention",
    title: "4. The Matchmaker",
    subtitle: "Self-attention: Query, Key & Value",
    badge: "Attention",
  },
  {
    id: "multihead",
    title: "5. The Orchestra",
    subtitle: "Parallel multi-head attention",
    badge: "Multi-Head",
  },
  {
    id: "sandbox",
    title: "6. The Sandbox Lab",
    subtitle: "Play with your own sentences",
    badge: "Sandbox",
  },
];

export default function App() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  const activeChapter = CHAPTERS[currentIdx];

  const handleNext = useCallback(
    () => setCurrentIdx((i) => Math.min(i + 1, CHAPTERS.length - 1)),
    [],
  );
  const handlePrev = useCallback(() => setCurrentIdx((i) => Math.max(i - 1, 0)), []);

  // Arrow keys page through chapters; Escape/Enter dismisses the splash.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showSplash) {
        if (e.key === "Escape" || e.key === "Enter") setShowSplash(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSplash, handleNext, handlePrev]);

  // Moving to a new chapter should start you at the top of it.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIdx]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between selection:bg-amber-200">
      {/* Splash */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-stone-900 text-white z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="max-w-2xl w-full text-center space-y-7 px-4 py-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-[14px] bg-stone-900 flex items-center justify-center">
                    <BrainCircuit size={32} className="text-amber-400 animate-pulse" />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3">
                <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  Interactive explorable explanation
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
                  How Transformers Work
                </h1>
                <p className="font-display text-stone-400 text-sm md:text-base max-w-lg mx-auto">
                  Six short chapters on tokens, embeddings, positional encoding and
                  self-attention — built to be played with rather than read.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 font-display">
                    🎯 Hands-on play
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Drag sliders, flip toggles and watch the numbers move instead of reading
                    static text.
                  </p>
                </div>
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 font-display">
                    ❤️ Clear metaphors
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Learn Query, Key and Value through a matchmaking game — with the real
                    formulas kept alongside.
                  </p>
                </div>
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 font-display">
                    🤖 A guide on call
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Ask Inspector Node anything as you go. Needs a Gemini API key; otherwise it
                    replies offline.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowSplash(false)}
                  autoFocus
                  className="bg-amber-400 hover:bg-amber-500 text-stone-900 px-7 py-3 rounded-xl font-bold text-sm shadow-xl transition-all inline-flex items-center gap-2 group cursor-pointer"
                  id="splash-start-button"
                >
                  Start chapter 1{" "}
                  <Play
                    size={14}
                    className="fill-stone-900 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
                <p className="text-[10px] text-stone-500 font-mono mt-3">
                  Tip: ← and → keys move between chapters.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-stone-200 py-3.5 px-4 md:px-8 relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSplash(true)}
                title="Back to the title screen"
                aria-label="Back to the title screen"
                className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-md hover:bg-stone-800 transition-colors shrink-0"
              >
                <BrainCircuit size={18} />
              </button>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-display font-extrabold text-[#1c1917] text-base md:text-lg tracking-tight">
                    Transformer Explorable
                  </h1>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                    Playable guide
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                  A visual, step-by-step explainer of self-attention
                </p>
              </div>
            </div>

            <nav
              aria-label="Chapters"
              className="flex items-center gap-1 md:gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0"
            >
              {CHAPTERS.map((ch, idx) => {
                const isActive = currentIdx === idx;
                const isPassed = currentIdx > idx;

                return (
                  <button
                    key={ch.id}
                    onClick={() => setCurrentIdx(idx)}
                    aria-current={isActive ? "step" : undefined}
                    className={`text-[10px] md:text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-white border-amber-600 font-bold"
                        : isPassed
                          ? "bg-stone-100 text-stone-500 border-stone-200"
                          : "bg-white text-stone-400 border-stone-200 hover:text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    {ch.badge}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4 min-w-0">
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-stone-900 text-xl md:text-2xl tracking-tight">
                {activeChapter.title}
              </h2>
              <p className="text-stone-500 text-xs md:text-sm">{activeChapter.subtitle}</p>
            </div>

            <div>
              {activeChapter.id === "intro" && <ChapterIntro />}
              {activeChapter.id === "embeddings" && <ChapterEmbedding />}
              {activeChapter.id === "position" && <ChapterPosEncoding />}
              {activeChapter.id === "attention" && <ChapterAttention />}
              {activeChapter.id === "multihead" && <ChapterMultiHead />}
              {activeChapter.id === "sandbox" && <ChapterSandbox />}
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 min-w-0">
            <TransformerGuide currentChapter={activeChapter.id} />
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-stone-200 p-4 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 disabled:bg-stone-50 disabled:text-stone-300 hover:bg-stone-200 px-4 py-2.5 rounded-xl border border-stone-200 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="hidden md:flex gap-2">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to ${ch.title}`}
                className={`w-2.5 h-2.5 rounded-full transition-all border ${
                  currentIdx === idx
                    ? "bg-stone-900 border-stone-900 scale-125"
                    : "bg-stone-200 border-transparent hover:bg-stone-400"
                }`}
              />
            ))}
          </div>

          {currentIdx === CHAPTERS.length - 1 ? (
            <button
              onClick={() => {
                setCurrentIdx(0);
                setShowSplash(true);
              }}
              className="flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-400 hover:bg-amber-500 px-5 py-2.5 rounded-xl border border-amber-500 shadow-md transition-all cursor-pointer"
            >
              Start over <RotateCcw size={14} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-stone-900 hover:bg-stone-800 px-5 py-2.5 rounded-xl border border-stone-950 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              id="footer-next-button"
            >
              Next chapter{" "}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
