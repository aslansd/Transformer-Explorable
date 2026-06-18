import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Maximize2, 
  BrainCircuit, 
  HelpCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { ChapterId } from "./types";

// Import custom sub-modules
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
  { id: "intro", title: "1. The Curse of Context", subtitle: "Why words are chameleons", badge: "Context" },
  { id: "embeddings", title: "2. The Word Map", subtitle: "Writing thoughts as coordinates", badge: "Embeddings" },
  { id: "position", title: "3. Positional Waves", subtitle: "Beating order-blindness", badge: "Position" },
  { id: "attention", title: "4. The Matchmaker Ceremony", subtitle: "Self-Attention Query, Key & Value", badge: "Attention" },
  { id: "multihead", title: "5. The Orchestra", subtitle: "Parallel multi-head focus", badge: "Multi-Head" },
  { id: "sandbox", title: "6. The Sandbox Lab", subtitle: "Play with custom parameters", badge: "Sandbox" }
];

export default function App() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const activeChapter = CHAPTERS[currentIdx];

  const handleNext = () => {
    if (currentIdx < CHAPTERS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between selection:bg-amber-200">
      
      {/* Splash introduction screen block */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-stone-900 text-white z-50 flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full text-center space-y-7 px-4">
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
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  Interactive Explorable Explanation
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
                  How Transformers Work
                </h1>
                <p className="font-display text-stone-400 text-sm md:text-base max-w-lg mx-auto">
                  Play your way through tokens, embedding maps, and self-attention curves. An interactive visual guide built on Nicky Case design philosophy.
                </p>
              </div>

              {/* Core Philosophy points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-display">
                    🎯 Hands-on Play
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Tweak vector coordinates and watch coordinates shift dynamically instead of reading static text.
                  </p>
                </div>
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-display">
                    ❤️ Clear Metaphors
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Learn Query, Key, and Value mechanisms using an interactive Matchmaking game.
                  </p>
                </div>
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-800/50 space-y-2">
                  <h3 className="font-semibold text-xs text-amber-400 flex items-center gap-1.5 font-display">
                    🤖 Live AI Assistant
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Chat with Inspector Node in real-time, explaining actual token matrix calculations.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowSplash(false)}
                  className="bg-amber-400 hover:bg-amber-500 text-stone-900 px-7 py-3 rounded-xl font-bold text-sm shadow-xl transition-all inline-flex items-center gap-2 group cursor-pointer"
                  id="splash-start-button"
                >
                  Enter the Sandbox <Play size={14} className="fill-stone-900 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-[10px] text-stone-500 font-mono mt-3">
                  Press Start to begin Chapter 1.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app Layout structure */}
      <div className="flex-1 flex flex-col">
        
        {/* Navigation Top Header */}
        <header className="bg-white border-b border-stone-200 py-3.5 px-4 md:px-8 relative z-25">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Title / Back home */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSplash(true)}
                title="Reset to Splash"
                className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold shadow-md hover:bg-stone-800 transition-colors"
              >
                <BrainCircuit size={18} />
              </button>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-extrabold text-[#1c1917] text-base md:text-lg tracking-tight">
                    Transformer Explorable
                  </h1>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-700 bg-amber-100 border border-amber-200.50 px-1.5 py-0.5 rounded uppercase">
                    Playable Guide
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                  The visual, step-by-step explainer of self-attention
                </p>
              </div>
            </div>

            {/* Chapters Progress Steps Indicators */}
            <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
              {CHAPTERS.map((ch, idx) => {
                const isActive = currentIdx === idx;
                const isPassed = currentIdx > idx;

                return (
                  <button
                    key={ch.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`text-[10px] md:text-xs font-semibold px-2.2 py-1.5 rounded-lg border transition-all shrink-0 ${
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

        {/* Dynamic Chapter stage bento grid content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active slide simulation frame */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Slide Title */}
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-stone-900 text-xl md:text-2xl tracking-tight">
                {activeChapter.title}
              </h2>
              <p className="text-stone-500 text-xs md:text-sm">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* Main Interactive Workspace frame */}
            <div className="transition-all duration-500">
              {activeChapter.id === "intro" && <ChapterIntro />}
              {activeChapter.id === "embeddings" && <ChapterEmbedding />}
              {activeChapter.id === "position" && <ChapterPosEncoding />}
              {activeChapter.id === "attention" && <ChapterAttention />}
              {activeChapter.id === "multihead" && <ChapterMultiHead />}
              {activeChapter.id === "sandbox" && <ChapterSandbox />}
            </div>

          </div>

          {/* Persistent AI Assistant Guide sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <TransformerGuide currentChapter={activeChapter.id} />
          </div>

        </main>

      </div>

      {/* Control slide footer bar */}
      <footer className="bg-white border-t border-stone-200 p-4 md:px-8 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Prev button */}
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 disabled:bg-stone-50 disabled:text-stone-300 disabled:border-stone-100 hover:bg-stone-200 px-4.5 py-2.5 rounded-xl border border-stone-200 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Middle: Progress dots */}
          <div className="hidden md:flex gap-2">
            {CHAPTERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all border ${
                  currentIdx === idx
                    ? "bg-stone-900 border-stone-900 scale-125"
                    : "bg-stone-200 border-transparent hover:bg-stone-400"
                }`}
              />
            ))}
          </div>

          {/* Right: Next button */}
          {currentIdx === CHAPTERS.length - 1 ? (
            <button
              onClick={() => {
                setCurrentIdx(0);
                setShowSplash(true);
              }}
              className="flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-400 hover:bg-amber-500 px-5 py-2.5 rounded-xl border border-amber-500 shadow-md transition-all cursor-pointer"
            >
              Restart Guide <RotateCcw size={14} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-stone-900 hover:bg-stone-800 px-5.5 py-2.5 rounded-xl border border-stone-950 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              id="footer-next-button"
            >
              Next Chapter <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

        </div>
      </footer>

    </div>
  );
}
