import React, { useState } from "react";
import { HelpCircle, Sparkles, AlertCircle, RefreshCcw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PhraseWord {
  text: string;
  pos: number;
  baseCoords: [number, number]; // [x, y] content representation
}

const PHRASE_A: PhraseWord[] = [
  { text: "Dog", pos: 0, baseCoords: [12, -45] },
  { text: "bites", pos: 1, baseCoords: [60, 20] },
  { text: "man", pos: 2, baseCoords: [-40, 50] }
];

const PHRASE_B: PhraseWord[] = [
  { text: "Man", pos: 0, baseCoords: [-40, 50] }, // Notice base coords match PHRASE_A but swapped order!
  { text: "bites", pos: 1, baseCoords: [60, 20] },
  { text: "dog", pos: 2, baseCoords: [12, -45] }
];

export default function ChapterPosEncoding() {
  const [useEncoding, setUseEncoding] = useState(false);
  const [activePreset, setActivePreset] = useState<"dog-bites" | "man-bites">("dog-bites");
  const [wavePos, setWavePos] = useState(0);

  const activePhrase = activePreset === "dog-bites" ? PHRASE_A : PHRASE_B;

  // Mathematical Positional offsets based on Sine/Cosine
  const getPEOffset = (pos: number, dimension: "x" | "y"): number => {
    // Simulated simple frequencies
    if (dimension === "x") {
      return Math.sin(pos * 1.5) * 22;
    } else {
      return Math.cos(pos * 1.5) * 22;
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational block */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🌊 Anagram Blindness & Positional Waves (Order Matters!)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Because Transformers handle all words of a sentence simultaneously (in parallel), they have a funny secret: **without positional signals, they are entirely blind to order!**
          </p>
          <p>
            To a raw word-map, <span className="font-semibold text-stone-800">"Dog bites man"</span> and <span className="font-semibold text-stone-800">"Man bites dog"</span> look exactly identical. Under the hood, they use the same three ingredients.
          </p>
          <p>
            How do we fix this? We stamp a unique mathematical barcode (**Positional Encoding**) onto each word's embedding. We use sine and cosine waves of different frequencies so word slot #0 gets one wave shape, slot #1 another, and so on.
          </p>
        </div>
      </div>

      {/* Interface panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive panel: The sentence representation switcher */}
        <div className="lg:col-span-7 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <h4 className="font-display font-semibold text-stone-900 text-sm">
                  1. Play with Sentence Order
                </h4>
                <p className="text-xs text-stone-500">
                  Switch sentences. Then, turn Positional Encoding toggle ON to add waves!
                </p>
              </div>
              
              {/* Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePreset("dog-bites")}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                    activePreset === "dog-bites" ? "bg-amber-500 text-white border-amber-600" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  "Dog bites man"
                </button>
                <button
                  onClick={() => setActivePreset("man-bites")}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                    activePreset === "man-bites" ? "bg-amber-500 text-white border-amber-600" : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  "Man bites dog"
                </button>
              </div>
            </div>

            {/* Sentence graphics */}
            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl flex justify-center items-center gap-3.5">
              {activePhrase.map((item, idx) => {
                const offsetX = getPEOffset(item.pos, "x");
                const offsetY = getPEOffset(item.pos, "y");

                return (
                  <motion.div
                    key={item.text}
                    layout
                    className="bg-white border-2 border-stone-200/80 px-4 py-2.5 rounded-xl shadow-sm text-center min-w-[75px]"
                  >
                    <span className="text-[10px] font-mono font-bold text-stone-400 block">POS #{item.pos}</span>
                    <span className="text-xs font-bold text-stone-800">{item.text}</span>
                    {useEncoding && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 mt-1 rounded border border-emerald-100"
                      >
                        PE +[{offsetX.toFixed(0)}, {offsetY.toFixed(0)}]
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Core Graphic Plot demonstrating convergence or divergence */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl h-60 relative overflow-hidden flex items-center justify-center">
            {/* Axes */}
            <hr className="absolute inset-x-0 border-t border-stone-800 top-1/2" />
            <hr className="absolute inset-y-0 border-l border-stone-800 left-1/2" />

            <AnimatePresence mode="popLayout">
              {activePhrase.map((item) => {
                // Determine layout coordinates
                // If positional encoding is turned on, coordinates shift by PE waves offset!
                const peX = useEncoding ? getPEOffset(item.pos, "x") : 0;
                const peY = useEncoding ? getPEOffset(item.pos, "y") : 0;

                const finalX = item.baseCoords[0] + peX;
                const finalY = item.baseCoords[1] + peY;

                return (
                  <motion.div
                    key={item.text}
                    style={{
                      position: "absolute",
                      left: `${(finalX + 100) / 2}%`,
                      bottom: `${(finalY + 100) / 2}%`
                    }}
                    transition={{ type: "spring", stiffness: 70, damping: 15 }}
                    className={`-translate-x-1/2 translate-y-1/2 text-[10px] font-mono font-bold px-2 py-1 rounded-md border flex flex-col items-center ${
                      useEncoding
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800 z-20 shadow-md"
                        : "bg-stone-900 text-stone-400 border-stone-800"
                    }`}
                  >
                    <span>{item.text}</span>
                    <span className="text-[8px] text-stone-500">[{finalX.toFixed(0)}, {finalY.toFixed(0)}]</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Float visual alerts explaining states */}
            <div className="absolute top-2 left-3 max-w-[200px] text-[10px] font-mono text-stone-400 bg-stone-950 border border-stone-800 p-2 rounded">
              {!useEncoding ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} /> Without PE offsets, words stay clustered in identical semantics. No order is preserved!
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={10} /> Wave encodings push words based on exact slots, isolating 'Man' in position 0 vs 2!
                </span>
              )}
            </div>
          </div>

          <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 flex justify-between items-center gap-4">
            <div>
              <p className="text-xs font-bold text-stone-800">Toggle Positional Encoding Waves</p>
              <p className="text-[10px] text-stone-500">Adds the Slot Wave offsets directly to the semantic coordinates.</p>
            </div>
            
            <button
              onClick={() => setUseEncoding(!useEncoding)}
              id="pe-toggle"
              className={`font-semibold text-xs px-4 py-2 rounded-xl border shadow-sm transition-all shrink-0 ${
                useEncoding
                  ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              }`}
            >
              {useEncoding ? "OFF (Undo Waves)" : "ON (Apply Waves)"}
            </button>
          </div>
        </div>

        {/* Right Panel: The mathematical Wave grid */}
        <div className="lg:col-span-5 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              2. Inspect slot Sine / Cosine Waves
            </h4>
            <p className="text-xs text-stone-500">
              Drag the slot slider to watch how different frequencies weave up or down, creating a continuous "numerical landscape".
            </p>
          </div>

          {/* Interactive slide position controller */}
          <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-stone-600">Sentence Slot (Position pos)</span>
              <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200 rounded">
                SLOT STAMP #{wavePos}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              value={wavePos}
              onChange={(e) => setWavePos(Number(e.target.value))}
              id="wave-pos-slider"
              className="w-full accent-amber-500"
            />
          </div>

          {/* Draw wave visualizations in canvas bars */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono tracking-wider text-stone-400 block uppercase">
              Visual PE wave amplitudes
            </span>
            <div className="space-y-1.5 font-mono text-[10px]">
              {/* Frequency waves list */}
              {[
                { label: "Sin Wave (Low frequency i=0)", amp: Math.sin(wavePos * 0.4), color: "bg-indigo-500" },
                { label: "Cos Wave (Low frequency i=1)", amp: Math.cos(wavePos * 0.4), color: "bg-indigo-400" },
                { label: "Sin Wave (Medium freq i=2)", amp: Math.sin(wavePos * 1.2), color: "bg-teal-500" },
                { label: "Cos Wave (High frequency i=3)", amp: Math.cos(wavePos * 2.8), color: "bg-pink-500" }
              ].map((wave, index) => {
                const ampPercent = Math.round(((wave.amp + 1) / 2) * 100);

                return (
                  <div key={index} className="space-y-1 bg-stone-50 p-2 rounded border border-stone-200/50">
                    <div className="flex justify-between text-[9px] text-stone-500">
                      <span>{wave.label}</span>
                      <span className="font-bold text-stone-700">{wave.amp.toFixed(2)}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden relative">
                      {/* Negative/Positive middle line */}
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-stone-400/40" />
                      <motion.div
                        className={`h-full ${wave.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ampPercent}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
