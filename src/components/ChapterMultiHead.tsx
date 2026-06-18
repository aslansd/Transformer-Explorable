import React, { useState } from "react";
import { HelpCircle, ChevronRight, CheckCircle, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AttentionHead } from "../types";

const HEADS: AttentionHead[] = [
  {
    id: 1,
    name: "Descriptor Head (H1)",
    description: "Focuses on Adjective-Noun modifications. Connects descriptions to the entities they modify.",
    color: "pink",
    focusType: "BROWN ➔ FOX, LAZY ➔ DOG"
  },
  {
    id: 2,
    name: "Action Connector (H2)",
    description: "Searches for Verb-Subject relations. Connects activities to the nouns completing them.",
    color: "sky",
    focusType: "JUMPS ➔ FOX, JUMPS ➔ DOG"
  },
  {
    id: 3,
    name: "Structural Bridge (H3)",
    description: "Tracks grammatical layout anchors. Links prepositions and articles to stabilize syntax.",
    color: "teal",
    focusType: "THE ➔ FOX, OVER ➔ DOG"
  }
];

export default function ChapterMultiHead() {
  const [activeHeadId, setActiveHeadId] = useState<number | "all">("all");
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const sentence = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"];

  // Helper to determine line links representation
  // Returns list of [fromIndex, toIndex] for active head
  const getLinksForHead = (headId: number | "all"): { from: number; to: number; headId: number; color: string }[] => {
    const linksMap: Record<number, { from: number; to: number }[]> = {
      1: [
        { from: 1, to: 3 }, // quick -> fox
        { from: 2, to: 3 }, // brown -> fox
        { from: 7, to: 8 }  // lazy -> dog
      ],
      2: [
        { from: 4, to: 3 }, // jumps -> fox
        { from: 4, to: 8 }  // jumps -> dog
      ],
      3: [
        { from: 0, to: 3 }, // The -> fox
        { from: 5, to: 8 }, // over -> dog
        { from: 6, to: 8 }  // the -> dog
      ]
    };

    if (headId === "all") {
      return [
        ...linksMap[1].map(l => ({ ...l, headId: 1, color: "stroke-pink-400" })),
        ...linksMap[2].map(l => ({ ...l, headId: 2, color: "stroke-sky-400" })),
        ...linksMap[3].map(l => ({ ...l, headId: 3, color: "stroke-teal-400" }))
      ];
    } else {
      const activeColor = headId === 1 ? "stroke-pink-500" : headId === 2 ? "stroke-sky-500" : "stroke-teal-500";
      return linksMap[headId].map(l => ({ ...l, headId, color: activeColor }));
    }
  };

  const activeLinks = getLinksForHead(activeHeadId);

  return (
    <div className="space-y-6">
      {/* Learning info card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🕵️‍♂️ Division of Labor (Multi-Head Attention)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Human sentences have layers. In the sentence: <span className="font-semibold text-stone-800">"The quick brown fox jumps over the lazy dog."</span>, we have several relationships co-existing at the same time:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600 text-xs">
            <li>Where is the **verb** and who completed the action? (Fox jumped)</li>
            <li>Which **adjectives** describe which nouns? (Brown fox, lazy dog)</li>
            <li>Which **prepositions** coordinate the physical structure? (Jumps over dog)</li>
          </ul>
          <p>
            Just like a single detective can't investigate three leads at once, inside the Transformer, **one attention head is not enough!** 
          </p>
          <p>
            So we launch 8, 12, or even 96 distinct **Attention Heads** in parallel. They split the task, specialize, and then orchestrate their reports back together!
          </p>
        </div>
      </div>

      {/* Interactive dashboard block */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
        
        {/* Head selector bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-display font-semibold text-stone-900 text-base">
              The Sub-Inspector Orchestra
            </h4>
            <p className="text-xs text-stone-500">
              Select specific Heads below to witness their custom attention projections light up!
            </p>
          </div>

          {/* Quick Head buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 relative z-10 shrink-0">
            <button
              onClick={() => setActiveHeadId("all")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeHeadId === "all" ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              All Heads Combined
            </button>
            {HEADS.map((head) => (
              <button
                key={head.id}
                onClick={() => setActiveHeadId(head.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 border border-transparent ${
                  activeHeadId === head.id
                    ? head.id === 1 ? "bg-pink-100 text-pink-800 border-pink-200" :
                      head.id === 2 ? "bg-sky-100 text-sky-800 border-sky-200" :
                      "bg-teal-100 text-teal-800 border-teal-200"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {head.name}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Drawing Canvas of Parallel Links */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 relative min-h-[180px] flex flex-col justify-between items-center overflow-hidden">
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 relative z-10 w-full max-w-2xl pt-2">
            {sentence.map((word, wIdx) => {
              const isHovered = hoveredWord === word;
              return (
                <div
                  key={wIdx}
                  onMouseEnter={() => setHoveredWord(word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  className={`bg-white border-2 px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer transition-all duration-300 relative z-20 ${
                    isHovered ? "border-stone-500 shadow scale-105" : "border-stone-200 text-stone-700 hover:border-stone-400"
                  }`}
                  id={`multihead-node-${wIdx}`}
                >
                  {word}
                </div>
              );
            })}
          </div>

          {/* SVG line arcs representing parallel head attentions */}
          <svg className="absolute inset-x-0 top-0 w-full h-[140px] pointer-events-none z-0">
            {activeLinks.map((link, lIndex) => {
              // Retrieve elements bounding box coordinates relative to parent canvas
              const elFrom = document.getElementById(`multihead-node-${link.from}`);
              const elTo = document.getElementById(`multihead-node-${link.to}`);
              
              if (!elFrom || !elTo) return null;

              // Simple simulation of horizontal positions
              const rectFrom = elFrom.getBoundingClientRect();
              const rectTo = elTo.getBoundingClientRect();
              
              // Find coordinates relative to layout parent element
              const canvasEl = elFrom.parentElement;
              if (!canvasEl) return null;
              const canvasRect = canvasEl.getBoundingClientRect();

              const x1 = rectFrom.left - canvasRect.left + (rectFrom.width / 2);
              const y1 = rectFrom.bottom - canvasRect.top - 15;
              const x2 = rectTo.left - canvasRect.left + (rectTo.width / 2);
              const y2 = rectTo.bottom - canvasRect.top - 15;

              // Arc logic
              const midX = (x1 + x2) / 2;
              const arcY = y1 - Math.abs(x1 - x2) * 0.35; // control curve height

              return (
                <path
                  key={lIndex}
                  d={`M ${x1} ${y1} Q ${midX} ${arcY} ${x2} ${y2}`}
                  className={`${link.color} fill-none`}
                  strokeWidth="2.5"
                  strokeDasharray={activeHeadId === "all" ? "2 2" : "none"}
                />
              );
            })}
          </svg>

          <p className="text-[10px] font-mono text-center text-stone-400 pt-16 relative z-10">
            *Heads pay attention in parallel matrices, allowing the model to compile different contextual layers at the same millisecond.*
          </p>
        </div>

        {/* Detailed reports per head listed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADS.map((head) => {
            const isActive = activeHeadId === "all" || activeHeadId === head.id;
            
            return (
              <div
                key={head.id}
                onClick={() => setActiveHeadId(head.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? head.id === 1 ? "bg-pink-50/50 border-pink-300 text-pink-900" :
                      head.id === 2 ? "bg-sky-50/50 border-sky-300 text-sky-900" :
                      "bg-teal-50/50 border-teal-300 text-teal-900"
                    : "bg-stone-50 border-stone-200/50 text-stone-400 opacity-50"
                }`}
              >
                <div className="flex justify-between items-center font-bold mb-1.5 text-xs">
                  <span>{head.name}</span>
                  <Layers size={13} />
                </div>
                <p className="text-[11px] leading-relaxed mb-3">{head.description}</p>
                <div className="font-mono text-[9px] font-bold bg-white px-2 py-1 rounded border border-stone-100/65 block uppercase tracking-wider">
                  Active connection: {head.focusType}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
