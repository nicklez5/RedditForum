// QuoteRenderer.tsx
import React from "react";

function isQuoteLine(s: string) {
  return /^\s*>\s?/.test(s);
}

// Matches: "alice said:" or "alice wrote - Title:"
const headerRe = /^(.+?)\s+(?:said|wrote)(?:\s*[-–—]\s*(.+?))?:\s*$/i;

export function QuoteRenderer({ text }: { text: string }) {
  const lines = (text || "").split("\n");

  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let quote: string[] = [];
  let header: { author: string; title?: string } | null = null;

  const flushPara = () => {
    if (!para.length) return;
    out.push(
      <p key={`p-${out.length}`} className="mb-2">
        {para.join("\n")}
      </p>
    );
    para = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    out.push(
      <div key={`q-${out.length}`} className="xf-quote mb-3">
        {header && (
          <div className="xf-quote__hdr">
            <span className="fw-semibold">{header.author}</span>
            <span className="opacity-75">
              {" "}
              said{header.title ? ` — ${header.title}` : ""}:
            </span>
          </div>
        )}
        <div className="xf-quote__body">
          {quote.map((l, i) => (
            <div key={i}>{l.replace(/^>\s?/, "")}</div>
          ))}
        </div>
      </div>
    );
    quote = [];
    header = null;
  };

  for (const raw of lines) {
    const line = raw ?? "";

    // Header just before a quote block
    if (!quote.length && headerRe.test(line.trim())) {
      const [, author, title] = line.trim().match(headerRe)!;
      header = { author, title };
      continue;
    }

    if (isQuoteLine(line)) {
      if (para.length) flushPara();
      quote.push(line);
      continue;
    }

    if (line.trim() === "") {
      flushPara();
      flushQuote();
      continue;
    }

    if (quote.length) flushQuote();
    para.push(line);
  }
  flushPara();
  flushQuote();

  return <div className="post-content">{out}</div>;
}
