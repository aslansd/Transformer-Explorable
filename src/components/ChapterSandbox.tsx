import React, { useState, useEffect } from "react";
import { HelpCircle, Sparkles, Send, Bot, Loader2, Info, ArrowUpRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PRESETS = [
  "She saw a crane building a massive steel skyscraper.",
  "The crane flew elegantly over the muddy river bank.",
  "I checked my bank balance to transfer the cash loan.",
  "The developer built a React app with a server-side route."
];

export default function ChapterSandbox() {
  const [sentence, setSentence] = useState(PRESETS[0]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [targetWordIdx, setTargetWordIdx] = useState<number | null>(null);
  
  // Heuristic simulated attention matrix
  const [attentionMatrix, setAttentionMatrix] = useState<number[][]>([]);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Parse text into individual words
  useEffect(() => {
    const rawWords = sentence
      .trim()
      .split(/\s+/)
      .map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""))
      .filter(w => w.length > 0);
    
    setTokens(rawWords);
    setSelectedWordIdx(null);
    setTargetWordIdx(null);
    setAiExplanation(null);
  }, [sentence]);

  // Construct Heuristic attention weights grid dynamically based on vocabulary relations
  useEffect(() => {
    if (tokens.length === 0) return;
    
    const size = tokens.length;
    const matrix: number[][] = [];

    // Syntactic keyword relations list to make simulation highly realistic
    const relations: Record<string, string[]> = {
      "crane": ["building", "skyscraper", "flew", "river", "elegantly", "steel"],
      "building": ["skyscraper", "crane", "steel", "built"],
      "skyscraper": ["building", "crane", "steel"],
      "flew": ["crane", "elegantly", "over"],
      "river": ["bank", "muddy", "flew"],
      "bank": ["river", "muddy", "balance", "transfer", "cash", "loan"],
      "balance": ["bank", "transfer", "cash", "loan"],
      "cash": ["balance", "bank", "transfer", "loan"],
      "loan": ["balance", "bank", "transfer", "cash"],
      "developer": ["built", "react", "app", "route"],
      "built": ["developer", "react", "app", "building"],
      "app": ["developer", "built", "react", "route"],
      "route": ["app", "server-side"]
    };

    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      const wordR = tokens[r].toLowerCase();

      for (let c = 0; c < size; c++) {
        const wordC = tokens[c].toLowerCase();

        if (r === c) {
          row.push(0.35); // Self attention
        } else {
          // Check heuristic matching relations
          let score = 0.05 + Math.sin(r * c) * 0.02; // baseline context noise
          
          if (relations[wordR] && relations[wordR].includes(wordC)) {
            score += 0.45; // Relational correlation match
          }
          if (relations[wordC] && relations[wordC].includes(wordR)) {
            score += 0.35; // Backwards relationship
          }
          // Distance dampener
          const dist = Math.abs(r - c);
          score += (1 / (dist + 1)) * 0.12;

          row.push(Math.min(1.0, Math.max(0.01, score)));
        }
      }

      // Perform standard SoftMax squashing along the row (making sum close to 1)
      const exps = row.map(v => Math.exp(v * 3.5)); // exponent multiplier
      const sum = exps.reduce((a, b) => a + b, 0);
      const softmaxRow = exps.map(v => Number((v / sum).toFixed(2)));
      
      matrix.push(softmaxRow);
    }

    setAttentionMatrix(matrix);
  }, [tokens]);

  const handleAskAttentionInspector = async (rowIdx: number, colIdx: number) => {
    const selected = tokens[rowIdx];
    const target = tokens[colIdx];
    const score = attentionMatrix[rowIdx][colIdx];

    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const response = await fetch("/api/inspect-attention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: sentence,
          selectedWord: selected,
          targetWord: target,
          attentionScore: score
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection failed");
      }

      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (e) {
      console.error(e);
      setAiExplanation("Oh dear, the inspector node timed out. Ensure your Express server is fully booted and you have internet access!");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Learning info */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🧪 The Sandbox Lab
        </h4>
        <p className="text-sm text-stone-700 leading-relaxed">
          Now it's your turn to play! Write *any sentence* below or try one of our ambiguous presets. 
          The sandbox will tokenize, map, and calculate context weights. Click cells to ask the **AI Attention Inspector** (powered by Gemini) for a deep, intuitive explanation of the links!
        </p>
      </div>

      {/* Main Sandbox dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Sentence controller & Attention Matrix Plot */}
        <div className="xl:col-span-8 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          
          {/* Custom prompt selector inputs */}
          <div className="space-y-3.5">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              1. Input Sentence & Preset Playground
            </h4>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value.slice(0, 100))}
                  id="sandbox-prompt-input"
                  placeholder="Type any custom sentence here..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none focus:bg-white text-stone-900 font-medium"
                />
              </div>

              {/* Presets flex */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => setSentence(preset)}
                    className="text-[10px] text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 py-1 px-2.2 rounded-lg transition-all text-left truncate max-w-full"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual representations tokens flex hover board */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">
                Active Tokens list (Click two to query relation)
              </span>
              {selectedWordIdx !== null && (
                <button 
                  onClick={() => { setSelectedWordIdx(null); setTargetWordIdx(null); }}
                  className="text-[9px] font-semibold text-stone-500 hover:text-stone-900 underline"
                >
                  Clear focus
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tokens.map((tok, idx) => {
                const isSelected = selectedWordIdx === idx;
                const isTarget = targetWordIdx === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedWordIdx === null) {
                        setSelectedWordIdx(idx);
                      } else if (selectedWordIdx === idx) {
                        setSelectedWordIdx(null);
                        setTargetWordIdx(null);
                      } else {
                        setTargetWordIdx(idx);
                        handleAskAttentionInspector(selectedWordIdx, idx);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all shadow-sm border ${
                      isSelected
                        ? "bg-rose-500 text-white border-rose-600 scale-105 z-10"
                        : isTarget
                        ? "bg-amber-400 text-stone-900 border-amber-500 scale-105"
                        : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                    }`}
                  >
                    {tok}
                  </button>
                );
              })}
            </div>

            {selectedWordIdx !== null && targetWordIdx === null && (
              <p className="text-[10px] text-amber-600 font-medium animate-pulse">
                👉 Click another token to measure how strongly &quot;{tokens[selectedWordIdx]}&quot; pays attention to it!
              </p>
            )}
          </div>

          {/* Softmax Heatmap visualization of self-attention matrix */}
          {attentionMatrix.length > 0 && (
            <div className="space-y-2 pt-1.5">
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">
                Self-Attention SoftMax Weight Heatmap ($N \times N$)
              </span>
              
              <div className="overflow-x-auto border border-stone-200/50 rounded-xl bg-stone-50 p-4">
                <div className="min-w-[340px] flex flex-col gap-1">
                  
                  {/* Heatmap header strings */}
                  <div className="flex gap-1 items-center font-mono text-[9px] text-stone-400 pb-1 border-b border-stone-200/50 mb-1">
                    <div className="w-[70px] shrink-0 truncate font-bold text-stone-500 text-right pr-2">Words</div>
                    {tokens.map((tok, idx) => (
                      <div key={idx} className="w-8 text-center truncate" title={tok}>
                        {tok.slice(0, 4)}
                      </div>
                    ))}
                  </div>

                  {/* Grid layout */}
                  {tokens.map((rowTok, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1 items-center">
                      {/* Left Header label */}
                      <div 
                        onClick={() => setSelectedWordIdx(rowIdx)}
                        className={`w-[70px] shrink-0 font-mono text-[10px] font-bold text-stone-700 truncate text-right pr-2 cursor-pointer hover:text-rose-500 transition-colors ${
                          selectedWordIdx === rowIdx ? "text-rose-600" : ""
                        }`}
                      >
                        {rowTok}
                      </div>

                      {/* Cells */}
                      {tokens.map((colTok, colIdx) => {
                        const score = attentionMatrix[rowIdx][colIdx];
                        
                        // Highlights based on selections
                        const isMainFocused = selectedWordIdx === rowIdx && targetWordIdx === colIdx;
                        const isRowFocused = selectedWordIdx === rowIdx;
                        const isColFocused = targetWordIdx === colIdx;

                        return (
                          <div
                            key={colIdx}
                            onClick={() => {
                              setSelectedWordIdx(rowIdx);
                              setTargetWordIdx(colIdx);
                              handleAskAttentionInspector(rowIdx, colIdx);
                            }}
                            title={`"${rowTok}" ➔ "${colTok}" attention: ${score}`}
                            style={{
                              opacity: isRowFocused || isMainFocused || (selectedWordIdx === null) ? 1 : 0.4
                            }}
                            className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-mono text-[9px] font-semibold cursor-pointer border transition-all ${
                              isMainFocused
                                ? "bg-amber-400 border-amber-500 text-stone-950 scale-110 z-10 font-bold ring-2 ring-rose-500"
                                : score > 0.4
                                ? "bg-rose-600 border-rose-700 text-white"
                                : score > 0.2
                                ? "bg-rose-400 border-rose-500 text-white"
                                : score > 0.1
                                ? "bg-rose-200 border-rose-300 text-rose-900"
                                : score > 0.05
                                ? "bg-rose-50 border-rose-100 text-rose-800"
                                : "bg-stone-100 border-stone-200 text-stone-400"
                            }`}
                          >
                            {score.toFixed(2)}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right column: Dynamic Attention Inspector Speech Bubble */}
        <div className="xl:col-span-4 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-stone-900 text-sm">
                  Inspector Attention
                </h4>
                <p className="text-[10px] font-mono text-stone-400">Gemini Live Inspector</p>
              </div>
            </div>

            <hr className="border-stone-150" />

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 min-h-[300px] flex flex-col justify-between">
              
              {/* Output log */}
              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[310px] pr-1.5">
                {selectedWordIdx !== null && targetWordIdx !== null ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] bg-white border px-2.5 py-1.5 rounded-lg font-mono">
                      <span className="text-stone-500">
                        "{tokens[selectedWordIdx]}" ➔ "{tokens[targetWordIdx]}"
                      </span>
                      <span className="font-bold text-rose-600">
                        Weight: {attentionMatrix[selectedWordIdx]?.[targetWordIdx]?.toFixed(2)}
                      </span>
                    </div>

                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-stone-400 text-xs font-mono">
                        <Loader2 className="animate-spin text-rose-500" size={24} />
                        <span>Querying parameters...</span>
                      </div>
                    ) : aiExplanation ? (
                      <div className="text-xs text-stone-700 leading-relaxed bg-white border p-3 rounded-xl shadow-sm border-stone-100/40">
                        {aiExplanation}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAskAttentionInspector(selectedWordIdx, targetWordIdx)}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={13} className="text-amber-400" /> Explain attention link
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-2 text-stone-400">
                    <Info size={28} className="text-stone-300" />
                    <p className="text-xs font-medium max-w-[200px]">
                      Select any word or click a cell on the map to inspect its attention mechanics!
                    </p>
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="text-[10px] font-mono text-stone-400 pt-2 border-t border-stone-100 flex items-center gap-1.5 mt-4">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Ready for custom input commands.</span>
              </div>

            </div>
          </div>

          <div className="text-[11px] text-stone-500 leading-snug bg-amber-50 p-3 rounded-xl border border-amber-200/50 mt-4">
            💡 **Nicky's Protip**: Type unrelated sentences like "Python is a snake vs python is a coding language" to observe how focus shifts based on vocabulary.
          </div>
        </div>

      </div>
    </div>
  );
}
