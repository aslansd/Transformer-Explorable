import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { attentionRow, toPercentages, D_K } from "../lib/nn";

interface MatchWord {
  text: string;
  /** Raw dot product q_it · k_word, before scaling. Illustrative numbers. */
  score: number;
  /** What this word would contribute if it were attended to. */
  value: string;
}

const TIRED_WORDS: MatchWord[] = [
  { text: "The", score: 8, value: "[Article]" },
  { text: "animal", score: 44, value: "[Animate entity: mammal]" },
  { text: "did not", score: 10, value: "[Negation]" },
  { text: "cross", score: 16, value: "[Movement]" },
  { text: "the", score: 6, value: "[Article]" },
  { text: "street", score: 26, value: "[Road infrastructure]" },
  { text: "because", score: 12, value: "[Causal connector]" },
  { text: "it", score: 18, value: "[Pronoun, unresolved]" },
  { text: "was", score: 9, value: "[Copula]" },
  { text: "tired", score: 32, value: "[Biological state: needs rest]" },
];

const WIDE_WORDS: MatchWord[] = [
  { text: "The", score: 8, value: "[Article]" },
  { text: "animal", score: 24, value: "[Animate entity: mammal]" },
  { text: "did not", score: 10, value: "[Negation]" },
  { text: "cross", score: 16, value: "[Movement]" },
  { text: "the", score: 6, value: "[Article]" },
  { text: "street", score: 45, value: "[Road infrastructure]" },
  { text: "because", score: 12, value: "[Causal connector]" },
  { text: "it", score: 18, value: "[Pronoun, unresolved]" },
  { text: "was", score: 9, value: "[Copula]" },
  { text: "too wide", score: 31, value: "[Spatial dimension: broad]" },
];

type Step = "idle" | "project" | "similarity" | "softmax" | "mix";

const STEPS: { id: Step; label: string }[] = [
  { id: "idle", label: "0. Reset" },
  { id: "project", label: "1. Make Q, K, V" },
  { id: "similarity", label: "2. Score (Q·Kᵀ)" },
  { id: "softmax", label: "3. Scale + softmax" },
  { id: "mix", label: "4. Blend the Values" },
];

export default function ChapterAttention() {
  const [activeSentence, setActiveSentence] = useState<"tired" | "wide">("tired");
  const [step, setStep] = useState<Step>("idle");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const words = activeSentence === "tired" ? TIRED_WORDS : WIDE_WORDS;
  const targetWord = activeSentence === "tired" ? "animal" : "street";

  // Real softmax over the scaled scores — no hand-typed percentages that fail to sum to 100.
  const percents = useMemo(
    () => toPercentages(attentionRow(words.map((w) => w.score))),
    [words],
  );
  const percentFor = (text: string) => percents[words.findIndex((w) => w.text === text)] ?? 0;
  const targetPercent = percentFor(targetWord);
  const total = percents.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Explanation header */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🎯 The Matchmaker (Self-Attention)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Every word's vector gets multiplied by three <em>learned</em> matrices — W
            <sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> — producing three different views of that
            same word:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-rose-500 block">🔍 Query (Q)</span>
              <span>"What am I looking for in this sentence?"</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-blue-500 block">🏷️ Key (K)</span>
              <span>"What do I advertise about myself?"</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-emerald-500 block">📦 Value (V)</span>
              <span>"What do I actually hand over if you pick me?"</span>
            </div>
          </div>
          <p>
            Every word compares its Query against every Key, turns those scores into
            percentages, and rebuilds itself as a weighted blend of everyone's Values. Below we
            follow just one word — the pronoun{" "}
            <span className="font-bold text-rose-600">it</span> — but this happens for all ten
            words at once, in one matrix multiplication.
          </p>
        </div>
      </div>

      {/* Simulation */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-display font-semibold text-stone-900 text-base">
              Interactive matchmaker: pronoun resolution
            </h4>
            <p className="text-xs text-stone-500">
              One word at the end changes — and "it" points at something completely different.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 border border-stone-200 rounded-xl shrink-0">
            {(["tired", "wide"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setActiveSentence(s);
                  setStep("idle");
                }}
                aria-pressed={activeSentence === s}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeSentence === s
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {s === "tired" ? '"…it was tired"' : '"…it was too wide"'}
              </button>
            ))}
          </div>
        </div>

        {/* Attention web */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 pb-14 flex flex-col items-center justify-center min-h-[180px] relative">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3.5 relative z-10 w-full max-w-2xl">
            {words.map((item) => {
              const isPronoun = item.text === "it";
              const isTarget = item.text === targetWord;
              const pct = percentFor(item.text);

              // Dim non-participants, but never below readable contrast.
              let opacity = 1;
              if (step === "similarity") opacity = 0.45 + item.score / 90;
              if (step === "softmax" || step === "mix") opacity = 0.4 + pct / 140;

              const highlight =
                isTarget && step === "similarity"
                  ? "border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                  : isTarget && (step === "softmax" || step === "mix")
                    ? "border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-400/30 shadow-md"
                    : "bg-white border-stone-200 text-stone-700";

              return (
                <motion.div
                  key={item.text}
                  layout
                  onMouseEnter={() => setHoveredNode(item.text)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] md:text-xs font-semibold select-none transition-all duration-300 relative border ${
                    isPronoun
                      ? "bg-rose-500 text-white border-rose-600 shadow ring-2 ring-rose-300 z-20 cursor-help"
                      : highlight
                  }`}
                  style={{ opacity: isPronoun ? 1 : Math.min(1, opacity) }}
                  id={`attention-node-${item.text}`}
                >
                  <div>{item.text}</div>

                  {step !== "idle" && step !== "project" && !isPronoun && (
                    <div className="text-[9px] font-mono mt-1 opacity-80">
                      {step === "similarity"
                        ? `q·k = ${item.score}`
                        : `${percentFor(item.text)}%`}
                    </div>
                  )}

                  {step === "project" && (
                    <div className="text-[8px] font-mono mt-1 flex gap-1 justify-center opacity-90">
                      <span className="text-rose-500">q</span>
                      <span className="text-blue-500">k</span>
                      <span className="text-emerald-600">v</span>
                    </div>
                  )}

                  {hoveredNode === item.text && (
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white p-2.5 rounded-lg shadow-xl min-w-[160px] pointer-events-none text-[10px] space-y-1 font-mono">
                      <p className="font-bold border-b border-stone-700 pb-1 text-amber-400">
                        "{item.text}"
                      </p>
                      <p className="text-stone-300">Value: {item.value}</p>
                      <p className="text-stone-400">
                        raw q·k: {item.score} → weight {percentFor(item.text)}%
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {(step === "softmax" || step === "mix") && (
            <div className="absolute bottom-3 text-[10px] font-mono text-stone-500 bg-white border border-stone-200 rounded-lg px-2.5 py-1">
              attention weights sum to {total}% ✓
            </div>
          )}

          {step === "mix" && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-1.5 text-[10px] font-mono text-rose-700 flex items-center gap-1.5 z-20 whitespace-nowrap">
              <Zap size={11} /> "it" now carries {targetPercent}% of "{targetWord}"
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h5 className="text-xs font-semibold text-stone-800">
                Walkthrough: one attention head, step by step
              </h5>
              <p className="text-[10px] text-stone-500">
                Attention(Q, K, V) = softmax(QKᵀ / √d<sub>k</sub>) · V
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 shrink-0">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  aria-pressed={step === s.id}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    step === s.id
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-stone-200 text-[11px] text-stone-600 leading-relaxed space-y-2">
            {step === "idle" && (
              <p>
                🌱 The pronoun <span className="font-bold text-rose-500">it</span> arrives with
                no idea what it refers to. Walk through the four steps to watch it find out.
              </p>
            )}

            {step === "project" && (
              <p>
                🧩 <strong>Project.</strong> Multiply every word vector by the three learned
                matrices: q = xW<sub>Q</sub>, k = xW<sub>K</sub>, v = xW<sub>V</sub>. Same word,
                three roles. These matrices are the part that actually gets <em>trained</em> —
                everything after this is fixed arithmetic.
              </p>
            )}

            {step === "similarity" && (
              <p>
                🔍 <strong>Score.</strong> Take the dot product of{" "}
                <span className="font-bold text-rose-500">it</span>'s query with every word's
                key. A big dot product means "these two point the same way".{" "}
                {activeSentence === "tired" ? (
                  <>
                    Because the sentence ends in <em>tired</em>, the query that "it" emits is
                    looking for something that can <em>be</em> tired — and{" "}
                    <span className="text-amber-600 font-bold">animal</span> scores highest (44).
                  </>
                ) : (
                  <>
                    Because the sentence ends in <em>too wide</em>, the query is looking for
                    something with a width — and{" "}
                    <span className="text-amber-600 font-bold">street</span> scores highest (45).
                  </>
                )}
              </p>
            )}

            {step === "softmax" && (
              <>
                <p>
                  🎚️ <strong>Scale, then softmax.</strong> First divide every score by √d
                  <sub>k</sub> = √{D_K} = {Math.sqrt(D_K)}. Without that, large dot products push
                  softmax into a region where its gradients nearly vanish and training stalls.
                </p>
                <p>
                  Then softmax(x)<sub>i</sub> = e^x<sub>i</sub> / Σ e^x<sub>j</sub> turns the
                  scores into a probability distribution: everything positive, everything summing
                  to 100%. Exponentiating exaggerates the gaps, so{" "}
                  <span className="font-bold">{targetWord}</span> takes {targetPercent}% while
                  the articles get about 1% each.
                </p>
              </>
            )}

            {step === "mix" && (
              <p>
                🧬 <strong>Blend.</strong> Multiply each word's Value vector by its weight and
                add them all up. The output for "it" is {targetPercent}% "{targetWord}" plus
                traces of everything else. Note what leaves this step: not a word, but a{" "}
                <em>vector</em> — a version of "it" that has absorbed its referent. It then goes
                through a residual connection, layer normalisation and a feed-forward network
                before the next layer of attention gets its turn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
