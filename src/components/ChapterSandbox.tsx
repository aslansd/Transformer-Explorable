import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Bot, Loader2, Info } from "lucide-react";
import { softmax } from "../lib/nn";
import Markdown from "./Markdown";

const PRESETS = [
  "She saw a crane building a massive steel skyscraper.",
  "The crane flew elegantly over the muddy river bank.",
  "I checked my bank balance to transfer the cash loan.",
  "The python swallowed the egg whole.",
];

/** Hand-written topical associations. This is a teaching prop, not a trained model. */
const RELATIONS: Record<string, string[]> = {
  crane: ["building", "skyscraper", "flew", "river", "elegantly", "steel", "bird"],
  building: ["skyscraper", "crane", "steel", "built"],
  skyscraper: ["building", "crane", "steel"],
  flew: ["crane", "elegantly", "over", "bird"],
  river: ["bank", "muddy", "flew", "water"],
  bank: ["river", "muddy", "balance", "transfer", "cash", "loan"],
  balance: ["bank", "transfer", "cash", "loan"],
  cash: ["balance", "bank", "transfer", "loan"],
  loan: ["balance", "bank", "transfer", "cash"],
  python: ["snake", "swallowed", "egg", "code", "language", "programming"],
  snake: ["python", "swallowed", "egg"],
  swallowed: ["python", "snake", "egg", "whole"],
  developer: ["built", "react", "app", "route", "code"],
  built: ["developer", "react", "app", "building"],
  app: ["developer", "built", "react", "route"],
  route: ["app", "server", "side"],
};

function tokenize(sentence: string): string[] {
  return sentence
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\w'-]/g, ""))
    .filter((w) => w.length > 0);
}

/**
 * Build a row-stochastic attention matrix from the heuristic scores.
 * Derived with useMemo rather than stored in state: the old version kept
 * `tokens` and `attentionMatrix` in two separate useEffects, so on the render
 * between them the matrix was still the old (shorter) one and
 * `attentionMatrix[row][col]` threw a TypeError — a blank-screen crash as soon
 * as you typed an extra word.
 */
function buildMatrix(tokens: string[]): number[][] {
  return tokens.map((rowWord, r) => {
    const logits = tokens.map((colWord, c) => {
      if (r === c) return 1.4; // a word always keeps some of itself
      let score = 0.4;
      if (RELATIONS[rowWord]?.includes(colWord)) score += 1.8;
      if (RELATIONS[colWord]?.includes(rowWord)) score += 1.2;
      score += 0.9 / (Math.abs(r - c) + 1); // nearby words matter a bit more
      return score;
    });
    return softmax(logits);
  });
}

export default function ChapterSandbox() {
  const [sentence, setSentence] = useState(PRESETS[0]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const tokens = useMemo(() => tokenize(sentence), [sentence]);
  const matrix = useMemo(() => buildMatrix(tokens), [tokens]);

  // Any change to the sentence invalidates the current selection.
  useEffect(() => {
    setSelectedRow(null);
    setSelectedCol(null);
    setAiExplanation(null);
    abortRef.current?.abort();
  }, [sentence]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const askInspector = async (rowIdx: number, colIdx: number) => {
    const selected = tokens[rowIdx];
    const target = tokens[colIdx];
    if (!selected || !target) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const response = await fetch("/api/inspect-attention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence,
          selectedWord: selected,
          targetWord: target,
          attentionScore: matrix[rowIdx]?.[colIdx] ?? 0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAiExplanation(data.explanation ?? "The inspector returned an empty answer.");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.error(e);
      setAiExplanation(
        "The inspector couldn't be reached. Check that the server is running and try again.",
      );
    } finally {
      if (!controller.signal.aborted) setIsAiLoading(false);
    }
  };

  const selectCell = (rowIdx: number, colIdx: number) => {
    setSelectedRow(rowIdx);
    setSelectedCol(colIdx);
    void askInspector(rowIdx, colIdx);
  };

  const cellClass = (score: number) => {
    if (score > 0.4) return "bg-rose-600 border-rose-700 text-white";
    if (score > 0.2) return "bg-rose-400 border-rose-500 text-white";
    if (score > 0.1) return "bg-rose-200 border-rose-300 text-rose-900";
    if (score > 0.05) return "bg-rose-50 border-rose-100 text-rose-800";
    return "bg-stone-100 border-stone-200 text-stone-400";
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🧪 The Sandbox Lab
        </h4>
        <p className="text-sm text-stone-700 leading-relaxed">
          Your turn. Type a sentence or pick an ambiguous preset, then click any cell to ask the{" "}
          <strong>AI Attention Inspector</strong> why two words might be linked.
        </p>
        <p className="text-xs text-stone-600 bg-white/70 border border-amber-200/70 rounded-lg p-2.5 leading-relaxed">
          ⚠️ <strong>What this is and isn't.</strong> The heatmap below is <em>not</em> a real
          trained Transformer. It's a small hand-written heuristic — words score higher when
          they're close together or when they appear in a built-in topic list — pushed through a
          real softmax so each row is a genuine probability distribution summing to 1. It shows
          you the <em>shape</em> of an attention matrix, not what GPT actually computes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left: input + heatmap */}
        <div className="xl:col-span-8 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 flex flex-col">
          <div className="space-y-3.5">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              1. Input sentence
            </h4>

            <label className="sr-only" htmlFor="sandbox-prompt-input">
              Sentence to analyse
            </label>
            <input
              id="sandbox-prompt-input"
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value.slice(0, 120))}
              placeholder="Type any sentence…"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none focus:bg-white text-stone-900 font-medium"
            />

            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSentence(preset)}
                  title={preset}
                  className="text-[10px] text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 py-1 px-2 rounded-lg transition-all text-left truncate max-w-[220px]"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Tokens */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">
                Tokens — click one, then another
              </span>
              {selectedRow !== null && (
                <button
                  onClick={() => {
                    setSelectedRow(null);
                    setSelectedCol(null);
                    setAiExplanation(null);
                  }}
                  className="text-[9px] font-semibold text-stone-500 hover:text-stone-900 underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tokens.map((tok, idx) => (
                <button
                  key={`${tok}-${idx}`}
                  onClick={() => {
                    if (selectedRow === null) setSelectedRow(idx);
                    else if (selectedRow === idx) {
                      setSelectedRow(null);
                      setSelectedCol(null);
                    } else selectCell(selectedRow, idx);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shadow-sm border ${
                    selectedRow === idx
                      ? "bg-rose-500 text-white border-rose-600 scale-105"
                      : selectedCol === idx
                        ? "bg-amber-400 text-stone-900 border-amber-500 scale-105"
                        : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                  }`}
                >
                  {tok}
                </button>
              ))}
            </div>

            {selectedRow !== null && selectedCol === null && (
              <p className="text-[10px] text-amber-600 font-medium">
                👉 Now click a second token to see how much "{tokens[selectedRow]}" attends to it.
              </p>
            )}
          </div>

          {/* Heatmap */}
          {tokens.length > 0 && (
            <div className="space-y-2 pt-1.5">
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">
                Attention weights — N × N, each row sums to 1
              </span>

              <div className="overflow-x-auto border border-stone-200/50 rounded-xl bg-stone-50 p-4">
                <div className="min-w-[340px] flex flex-col gap-1">
                  <div className="flex gap-1 items-center font-mono text-[9px] text-stone-400 pb-1 border-b border-stone-200/50 mb-1">
                    <div className="w-[70px] shrink-0 font-bold text-stone-500 text-right pr-2">
                      to →
                    </div>
                    {tokens.map((tok, idx) => (
                      <div key={idx} className="w-8 text-center truncate" title={tok}>
                        {tok.slice(0, 4)}
                      </div>
                    ))}
                  </div>

                  {tokens.map((rowTok, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1 items-center">
                      <button
                        onClick={() => setSelectedRow(rowIdx)}
                        className={`w-[70px] shrink-0 font-mono text-[10px] font-bold truncate text-right pr-2 hover:text-rose-500 transition-colors ${
                          selectedRow === rowIdx ? "text-rose-600" : "text-stone-700"
                        }`}
                      >
                        {rowTok}
                      </button>

                      {tokens.map((colTok, colIdx) => {
                        const score = matrix[rowIdx]?.[colIdx] ?? 0;
                        const isFocused = selectedRow === rowIdx && selectedCol === colIdx;
                        const rowActive = selectedRow === null || selectedRow === rowIdx;

                        return (
                          <button
                            key={colIdx}
                            onClick={() => selectCell(rowIdx, colIdx)}
                            title={`"${rowTok}" → "${colTok}": ${score.toFixed(2)}`}
                            style={{ opacity: rowActive ? 1 : 0.4 }}
                            className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-mono text-[9px] font-semibold border transition-all ${
                              isFocused
                                ? "bg-amber-400 border-amber-500 text-stone-950 scale-110 z-10 ring-2 ring-rose-500"
                                : cellClass(score)
                            }`}
                          >
                            {score.toFixed(2)}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-stone-400">
                Row = the word doing the looking, column = the word being looked at. The matrix
                is not symmetric: "bank" can lean heavily on "river" without "river" leaning back
                just as hard.
              </p>
            </div>
          )}
        </div>

        {/* Right: inspector */}
        <div className="xl:col-span-4 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-stone-900 text-sm">
                  Attention Inspector
                </h4>
                <p className="text-[10px] font-mono text-stone-400">Powered by Gemini</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 min-h-[300px] flex flex-col">
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[320px] pr-1.5">
                {selectedRow !== null && selectedCol !== null ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2 text-[10px] bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg font-mono">
                      <span className="text-stone-500 truncate">
                        "{tokens[selectedRow]}" → "{tokens[selectedCol]}"
                      </span>
                      <span className="font-bold text-rose-600 shrink-0">
                        {(matrix[selectedRow]?.[selectedCol] ?? 0).toFixed(2)}
                      </span>
                    </div>

                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-400 text-xs font-mono">
                        <Loader2 className="animate-spin text-rose-500" size={24} />
                        <span>Thinking…</span>
                      </div>
                    ) : aiExplanation ? (
                      <div className="text-xs text-stone-700 leading-relaxed bg-white border border-stone-200 p-3 rounded-xl shadow-sm">
                        <Markdown text={aiExplanation} />
                      </div>
                    ) : (
                      <button
                        onClick={() => askInspector(selectedRow, selectedCol)}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={13} className="text-amber-400" /> Explain this link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-2 text-stone-400">
                    <Info size={28} className="text-stone-300" />
                    <p className="text-xs font-medium max-w-[200px]">
                      Pick two tokens, or click a cell in the heatmap.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-600 leading-snug bg-amber-50 p-3 rounded-xl border border-amber-200/50 mt-4">
            💡 <strong>Try this:</strong> run "The python swallowed the egg whole." and then "I
            wrote the python script last night." — same token, different neighbours.
          </div>
        </div>
      </div>

      {/* What we skipped */}
      <div className="bg-stone-900 text-stone-300 rounded-2xl p-6 space-y-3.5">
        <h4 className="font-display font-bold text-white text-base">
          🧱 One last thing: attention isn't the whole Transformer
        </h4>
        <p className="text-sm leading-relaxed">
          Everything in this guide describes <em>one</em> attention sub-layer. A full model wraps
          it in a few more pieces, repeated dozens of times:
        </p>
        <ul className="text-xs space-y-2 leading-relaxed">
          <li>
            <span className="font-semibold text-amber-400">Residual connection + LayerNorm.</span>{" "}
            The attention output is added back onto its own input, then normalised. Without this
            shortcut, deep stacks simply don't train.
          </li>
          <li>
            <span className="font-semibold text-amber-400">Feed-forward network.</span> Each
            position then passes through a small two-layer network (typically 4× wider than
            d<sub>model</sub>) — on its own, with no mixing between positions. Attention moves
            information <em>between</em> tokens; the FFN does the thinking <em>within</em> one.
          </li>
          <li>
            <span className="font-semibold text-amber-400">Stacking.</span> That block repeats 12,
            48, 96+ times. Early layers pick up surface patterns; later ones build more abstract
            structure.
          </li>
          <li>
            <span className="font-semibold text-amber-400">Causal masking.</span> Generative
            models like GPT hide every future token before the softmax, so a word can only attend
            backwards. Everything you saw here was bidirectional, BERT-style.
          </li>
          <li>
            <span className="font-semibold text-amber-400">Output head.</span> Finally, a linear
            layer plus softmax over the whole vocabulary turns the last vector into a probability
            for every possible next token.
          </li>
        </ul>
        <p className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-800 pt-3">
          Want the primary source? Vaswani et al., "Attention Is All You Need" (2017) — and for
          more explorables in this spirit, Nicky Case's work at ncase.me.
        </p>
      </div>
    </div>
  );
}
