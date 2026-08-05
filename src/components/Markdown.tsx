import type { ReactNode } from "react";

/**
 * A deliberately tiny markdown renderer.
 *
 * The server prompts Gemini to reply "using markdown", but the old UI dropped
 * that text straight into a <div>, so users saw literal **asterisks** and
 * `backticks`. This renders the small subset the guide actually produces
 * (bold, italics, inline code, bullet lists, headings) as real React nodes -
 * no dangerouslySetInnerHTML, so there is no injection surface.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // bold | italic | inline code
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(
        <strong key={key} className="font-semibold text-stone-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="font-mono text-[0.9em] bg-stone-200/70 text-stone-800 px-1 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface MarkdownProps {
  text: string;
  className?: string;
}

export default function Markdown({ text, className = "" }: MarkdownProps) {
  const lines = (text ?? "").split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc pl-4 space-y-1">
        {listBuffer.map((item, idx) => (
          <li key={idx}>{renderInline(item, `${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);

    if (bullet) {
      listBuffer.push(bullet[1]);
      return;
    }
    flushList(`ul-${idx}`);

    if (line.trim() === "") return;

    if (heading) {
      blocks.push(
        <p key={`h-${idx}`} className="font-semibold text-stone-900">
          {renderInline(heading[1], `h-${idx}`)}
        </p>,
      );
      return;
    }

    blocks.push(<p key={`p-${idx}`}>{renderInline(line, `p-${idx}`)}</p>);
  });

  flushList("ul-end");

  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
}
