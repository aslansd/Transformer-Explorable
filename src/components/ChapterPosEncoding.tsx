import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { positionalEncoding, peFrequency } from "../lib/nn";

interface PhraseWord {
  text: string;
  pos: number;
  baseCoords: [number, number];
}

const PHRASE_A: PhraseWord[] = [
  { text: "Dog", pos: 0, baseCoords: [12, -45] },
  { text: "bites", pos: 1, baseCoords: [60, 20] },
  { text: "man", pos: 2, baseCoords: [-40, 50] },
];

const PHRASE_B: PhraseWord[] = [
  // Same three vectors as PHRASE_A — only the slots they sit in have changed.
  { text: "Man", pos: 0, baseCoords: [-40, 50] },
  { text: "bites", pos: 1, baseCoords: [60, 20] },
  { text: "dog", pos: 2, baseCoords: [12, -45] },
];

/**
 * The explorable uses a miniature model: d_model = 8 dimensions and base = 100.
 * "Attention Is All You Need" uses d_model = 512 and base = 10000; with those
 * numbers the slower waves barely move across a 10-word sentence, so they would
 * be invisible here. The *shape* — dimension 0 fastest, higher dimensions
 * progressively slower — is identical.
 */
const D_MODEL = 8;
const BASE = 100;
const AMPLITUDE = 22; // how far a PE nudges a point on the toy 2-D map
const MAX_POS = 15;

export default function ChapterPosEncoding() {
  const [useEncoding, setUseEncoding] = useState(false);
  const [activePreset, setActivePreset] = useState<"dog-bites" | "man-bites">("dog-bites");
  const [wavePos, setWavePos] = useState(0);

  const activePhrase = activePreset === "dog-bites" ? PHRASE_A : PHRASE_B;

  // The map only has two axes, so we show the first sin/cos pair (dimensions 0 and 1).
  const peX = (pos: number) => positionalEncoding(pos, 0, D_MODEL, BASE) * AMPLITUDE;
  const peY = (pos: number) => positionalEncoding(pos, 1, D_MODEL, BASE) * AMPLITUDE;

  const pairs = [0, 1, 2, 3].map((pair) => {
    const sinDim = pair * 2;
    const cosDim = pair * 2 + 1;
    const freq = peFrequency(sinDim, D_MODEL, BASE);
    return {
      pair,
      sinDim,
      cosDim,
      freq,
      wavelength: (2 * Math.PI) / freq,
      sinValue: positionalEncoding(wavePos, sinDim, D_MODEL, BASE),
      cosValue: positionalEncoding(wavePos, cosDim, D_MODEL, BASE),
    };
  });

  return (
    <div className="space-y-6">
      {/* Educational block */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🌊 Order-blindness &amp; Positional Waves
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Self-attention looks at every word simultaneously, and it treats the sentence as an
            unordered <em>set</em>. Shuffle the words and the attention maths shuffles right
            along with them — every word ends up with exactly the same output as before, just in
            a different slot.
          </p>
          <p>
            So <span className="font-semibold text-stone-800">"Dog bites man"</span> and{" "}
            <span className="font-semibold text-stone-800">"Man bites dog"</span> are built from
            the same three vectors, and without extra help the model literally cannot tell them
            apart.
          </p>
          <p>
            The fix: stamp each slot with a unique pattern — a{" "}
            <strong>positional encoding</strong> — and <em>add</em> it to the word's embedding
            before attention runs. The original Transformer builds those stamps from sine and
            cosine waves at many different frequencies, so every position gets its own
            fingerprint, and the <em>difference</em> between two stamps encodes how far apart
            the words are.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: sentence + map */}
        <div className="lg:col-span-7 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <h4 className="font-display font-semibold text-stone-900 text-sm">
                  1. Play with sentence order
                </h4>
                <p className="text-xs text-stone-500">
                  Switch sentences with the waves off, then turn them on.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePreset("dog-bites")}
                  aria-pressed={activePreset === "dog-bites"}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                    activePreset === "dog-bites"
                      ? "bg-amber-500 text-white border-amber-600"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  "Dog bites man"
                </button>
                <button
                  onClick={() => setActivePreset("man-bites")}
                  aria-pressed={activePreset === "man-bites"}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                    activePreset === "man-bites"
                      ? "bg-amber-500 text-white border-amber-600"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  "Man bites dog"
                </button>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl flex justify-center items-center gap-3.5 flex-wrap">
              {activePhrase.map((item) => (
                <motion.div
                  key={item.text}
                  layout
                  className="bg-white border-2 border-stone-200/80 px-4 py-2.5 rounded-xl shadow-sm text-center min-w-[85px]"
                >
                  <span className="text-[10px] font-mono font-bold text-stone-400 block">
                    slot {item.pos}
                  </span>
                  <span className="text-xs font-bold text-stone-800">{item.text}</span>
                  {useEncoding && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 mt-1 rounded border border-emerald-100"
                    >
                      + [{peX(item.pos).toFixed(0)}, {peY(item.pos).toFixed(0)}]
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Plot */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl h-60 relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 border-t border-stone-800" />
            <div className="absolute inset-y-0 left-1/2 border-l border-stone-800" />

            {activePhrase.map((item) => {
              const finalX = item.baseCoords[0] + (useEncoding ? peX(item.pos) : 0);
              const finalY = item.baseCoords[1] + (useEncoding ? peY(item.pos) : 0);

              return (
                <motion.div
                  key={item.text}
                  animate={{
                    left: `${(finalX + 100) / 2}%`,
                    bottom: `${(finalY + 100) / 2}%`,
                  }}
                  transition={{ type: "spring", stiffness: 70, damping: 15 }}
                  style={{ position: "absolute" }}
                  className={`-translate-x-1/2 translate-y-1/2 text-[10px] font-mono font-bold px-2 py-1 rounded-md border flex flex-col items-center ${
                    useEncoding
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800 z-20 shadow-md"
                      : "bg-stone-900 text-stone-400 border-stone-800 z-10"
                  }`}
                >
                  <span>{item.text}</span>
                  <span className="text-[8px] text-stone-500">
                    [{finalX.toFixed(0)}, {finalY.toFixed(0)}]
                  </span>
                </motion.div>
              );
            })}

            <div className="absolute top-2 left-3 max-w-[230px] text-[10px] font-mono bg-stone-950 border border-stone-800 p-2 rounded z-30">
              {!useEncoding ? (
                <span className="text-red-400 flex items-start gap-1">
                  <AlertCircle size={10} className="mt-0.5 shrink-0" /> Both sentences produce
                  the identical set of three points. Switch sentences — nothing moves.
                </span>
              ) : (
                <span className="text-emerald-400 flex items-start gap-1">
                  <CheckCircle size={10} className="mt-0.5 shrink-0" /> Each slot adds its own
                  offset, so "man" in slot 0 is now a different vector from "man" in slot 2.
                </span>
              )}
            </div>
          </div>

          <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 flex justify-between items-center gap-4">
            <div>
              <p className="text-xs font-bold text-stone-800">Positional encoding</p>
              <p className="text-[10px] text-stone-500">
                Adds the slot's wave values to the word's coordinates.
              </p>
            </div>

            <button
              onClick={() => setUseEncoding((v) => !v)}
              id="pe-toggle"
              role="switch"
              aria-checked={useEncoding}
              className={`font-semibold text-xs px-4 py-2 rounded-xl border shadow-sm transition-all shrink-0 ${
                useEncoding
                  ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              }`}
            >
              {useEncoding ? "ON — click to remove" : "OFF — click to apply"}
            </button>
          </div>
        </div>

        {/* Right: the waves */}
        <div className="lg:col-span-5 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              2. Inspect the slot fingerprint
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Drag the slider through the sentence. Dimension 0 is the{" "}
              <strong>fastest</strong> wave; each pair after it is slower. Fast dimensions
              distinguish neighbours, slow ones say roughly where in the text you are.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="wave-pos-slider" className="text-xs font-mono font-bold text-stone-600">
                Position (pos)
              </label>
              <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200 rounded">
                pos = {wavePos}
              </span>
            </div>
            <input
              id="wave-pos-slider"
              type="range"
              min="0"
              max={MAX_POS}
              value={wavePos}
              onChange={(e) => setWavePos(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] font-mono text-stone-400 text-center">
              PE(pos, 2i) = sin(pos / {BASE}^(2i/{D_MODEL})) &nbsp;·&nbsp; PE(pos, 2i+1) = cos(…)
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-mono tracking-wider text-stone-400 block uppercase">
              All {D_MODEL} dimensions of this slot's stamp
            </span>

            <div className="space-y-2 font-mono text-[10px]">
              {pairs.map(({ pair, sinDim, cosDim, wavelength, sinValue, cosValue }) => (
                <div
                  key={pair}
                  className="space-y-1.5 bg-stone-50 p-2 rounded border border-stone-200/50"
                >
                  <div className="flex justify-between text-[9px] text-stone-500">
                    <span className="font-bold">
                      pair i={pair} (dims {sinDim} &amp; {cosDim})
                    </span>
                    <span>
                      wavelength ≈ {wavelength < 1000 ? wavelength.toFixed(1) : "≫"} slots
                    </span>
                  </div>

                  {[
                    { tag: `sin · dim ${sinDim}`, value: sinValue, color: "bg-indigo-500" },
                    { tag: `cos · dim ${cosDim}`, value: cosValue, color: "bg-teal-500" },
                  ].map((row) => (
                    <div key={row.tag} className="space-y-0.5">
                      <div className="flex justify-between text-[9px] text-stone-500">
                        <span>{row.tag}</span>
                        <span className="font-bold text-stone-700">{row.value.toFixed(2)}</span>
                      </div>
                      {/* Bar is centred: the middle line is zero, left is -1, right is +1. */}
                      <div className="h-2 w-full bg-stone-200 rounded-full relative overflow-hidden">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-stone-400/60 z-10" />
                        <motion.div
                          className={`absolute inset-y-0 ${row.color} rounded-full`}
                          animate={{
                            left: `${row.value >= 0 ? 50 : 50 + row.value * 50}%`,
                            width: `${Math.abs(row.value) * 50}%`,
                          }}
                          transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <p className="text-[10px] text-stone-400 leading-relaxed">
              This toy uses d_model = {D_MODEL} and base = {BASE}. The paper uses 512 and 10000.
              Many modern models swap these fixed waves for learned position vectors or rotary
              embeddings (RoPE), but the job is the same: tell attention where each token sits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
