"use client";
import React from 'react';

export default function CodeEditor({
  value,
  onChange,
  errors = [], // [{ line: 1-based, column: 0-based, msg }]
  style,
  className,
  fontFamily = "'Amiga4Ever', monospace",
  fontSize = 12,
  lineHeight = 1.4,
  tabColumns = 4,
}) {
  const taRef = React.useRef(null);
  const innerRef = React.useRef(null);

  const [tip, setTip] = React.useState(null);
  const cursorPos = (e) => ({ x: e.clientX + 12, y: e.clientY + 12 });
  // ❶ Error lookup: line -> Map<col,msg>
  const byLine = React.useMemo(() => {
    const map = new Map();
    for (const e of errors || []) {
      const line = Number(e.line) | 0;
      const col = Number(e.column);
      if (!map.has(line)) map.set(line, new Map());
      if (Number.isFinite(col)) {
        if (!map.get(line).has(col))
          map.get(line).set(col, e.msg || "Syntax error");
      } else {
        map.get(line).set(-1, e.msg || "Syntax error"); // whole‑line
      }
    }
    return map;
  }, [errors]);

  // ❷ Expand tabs only for the overlay; textarea keeps real tabs
  const expandTabs = React.useCallback(
    (s) => {
      if (!s || !s.includes("\t")) return s ?? "";
      const tab = " ".repeat(tabColumns);
      return s.replace(/\t/g, tab);
    },
    [tabColumns]
  );

  // ❸ Compute absolute string index from (line, col) for caret placement
  const indexFromLineCol = React.useCallback(
    (src, lineOneBased, colZeroBased) => {
      const lines = src.split("\n");
      const li = Math.max(0, Math.min(lines.length - 1, lineOneBased - 1));
      let idx = 0;
      for (let i = 0; i < li; i++) idx += lines[i].length + 1; // +1 for \n
      return idx + Math.max(0, Math.min(colZeroBased, lines[li].length));
    },
    []
  );

  // ❹ Render overlay (no own scroll; we translate inside)
  const renderHighlights = React.useMemo(() => {
    const lines = expandTabs(value ?? "").split("\n");
    return lines.map((ln, i) => {
      const lineNo = i + 1;
      const colMap = byLine.get(lineNo);
      if (!colMap)
        return (
          <div key={i}>
            {ln || " "}
            {"\n"}
          </div>
        );

      const hasWholeLineError = colMap.has(-1);
      const parts = [];
      const maxCols = Math.max(ln.length + 1, 1); // include EOL

      for (let c = 0; c < maxCols; c++) {
        const ch = ln[c] ?? " ";
        const msg = colMap.get(c);

        if (msg) {
          // pass line/col to handler for caret setting
          parts.push(
            <span
              key={c}
              className="err-ch"
              title={msg}
              data-line={lineNo}
              data-col={c}
              onMouseEnter={(e) => setTip({ ...cursorPos(e), msg })}
              onMouseMove={(e) =>
                setTip((t) => (t ? { ...cursorPos(e), msg } : t))
              }
              onMouseLeave={() => setTip(null)}
              onMouseDown={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(msg);
                const ta = taRef.current;
                if (!ta) return;
                const line = Number(e.currentTarget.dataset.line);
                const col = Number(e.currentTarget.dataset.col);
                const pos = indexFromLineCol(value ?? "", line, col);
                ta.focus();
                ta.setSelectionRange(pos, pos);
              }}
            >
              {ch}
            </span>
          );
        } else {
          parts.push(<span key={c}>{ch}</span>);
        }
      }

      return (
        <div
          key={i}
          className={hasWholeLineError ? "err-line line-soft" : "err-line"}
        >
          {parts}
          {"\n"}
        </div>
      );
    });
  }, [value, byLine, expandTabs, indexFromLineCol]);

  // ❺ Translate overlay to match textarea scroll, with a small vertical fix
  React.useLayoutEffect(() => {
    const ta = taRef.current;
    const inner = innerRef.current;
    if (!ta || !inner) return;

    const Y_ADJUST = -5; // ← move overlay UP by 5px; tweak if you change font/lineHeight

    const sync = () => {
      inner.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop + Y_ADJUST}px)`;
    };
    sync();
    ta.addEventListener("scroll", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(ta);
    return () => {
      ta.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [value]);

  // Shared metrics—must be identical on both layers
  const metrics = {
    fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight,
    letterSpacing: "0",
    tabSize: tabColumns,
  };

  const wrapStyle = { position: "relative", ...style };

  // Overlay wrapper: pointer-events:none so clicks fall through EXCEPT error spans
  const overlayWrapStyle = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    padding: 8,
    boxSizing: "border-box",
    zIndex: 2,
    ...metrics,
    color: "transparent",
    whiteSpace: "pre",
    pointerEvents: "none", // ← allow click-through by default
  };

  const overlayInnerStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    willChange: "transform",
  };

  const textareaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    padding: 8,
    boxSizing: "border-box",
    background: "#222",
    color: "#0f0",
    border: "none",
    resize: "none",
    whiteSpace: "pre",
    overflow: "auto",
    outline: "none",
    zIndex: 1,
    ...metrics,
  };

  const tooltipStyle = tip && {
    position: "fixed", // ← fixed to the viewport, unaffected by scroll
    left: tip.x,
    top: tip.y,
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 6,
    padding: "8px 10px",
    maxWidth: 360,
    fontSize: 12,
    lineHeight: 1.3,
    zIndex: 9999,
    boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
    pointerEvents: "none",
  };

  return (
    <div className={className} style={wrapStyle}>
      {/* Overlay (no scroll; translated inner) */}
      <div
        style={overlayWrapStyle}
        onWheel={(e) => {
          const ta = taRef.current;
          if (!ta) return;
          e.preventDefault();
          ta.scrollTop += e.deltaY;
          ta.scrollLeft += e.deltaX;
          setTip(null); // hide while scrolling (optional)
        }}
      >
        <pre ref={innerRef} style={overlayInnerStyle} className="overlay-pre">
          {renderHighlights}
        </pre>
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        style={textareaStyle}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false}
        placeholder="Enter AMOS BASIC code here"
      />

      {tip && <div style={tooltipStyle}>{tip.msg}</div>}

      <style>{`
        .overlay-pre {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .overlay-pre::-webkit-scrollbar { display: none; }

        /* Error cell: re-enable pointer events so we can show tooltip + set caret */
        .err-line .err-ch {
          display: inline-block;
          background: rgba(255, 0, 0, 0.45);
          color: transparent;
          border-radius: 2px;
          outline: 1px solid rgba(255,0,0,0.8);
          pointer-events: auto;   /* ← active over errors only */
          cursor: text;
        }
        .err-line.line-soft {
          background: rgba(255, 0, 0, 0.10);
        }
      `}</style>
    </div>
  );
}
