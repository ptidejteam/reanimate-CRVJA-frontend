"use client";
import React, { useEffect, useRef } from "react";

export default function AmosRunner({ jsCode, runNonce, bankFiles }) {
  const bankFilesRef = useRef(bankFiles);
  
  useEffect(() => {
    bankFilesRef.current = bankFiles;
  }, [bankFiles]);
  // Put as full screen toggle on Shift+F1, since F11 is often taken by browsers and you might want an easy way to go fullscreen without it
  useEffect(() => {
  const handleKeyDown = async (event) => {
    if (event.shiftKey && event.key === 'F1') {
      event.preventDefault();
      event.stopPropagation();

      const gameContainer = document.getElementById('game-container');

      if (!gameContainer) return;

      try {
        if (!document.fullscreenElement) {
          await gameContainer.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, true);
  };
}, []);

  useEffect(() => {
    if (!jsCode) return;

    const host = document.getElementById("game-container");
    if (!host) {
      console.error('AMOS runner: host "#game-container" not found.');
      return;
    }
    console.log("[parent] AMOS runner: host found, injecting iframe…");
    host.replaceChildren();

    const token = Math.random().toString(36).slice(2);

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.width = "640px"; // initial; iframe will resize itself
    iframe.style.height = "480px";
    iframe.style.marginTop = "10px";
    host.style.display = "inline-block";

    // ---- PLAIN JS selector; find the bank file inputs in the PARENT ----
    const forwardBanks = async () => {
      // 1) existing: from real <input type="file">
      const inputs = Array.from(
        document.querySelectorAll(
          'input[type="file"][id^="bankStored"], input[type="file"][id^="Creator_bankStored"]'
        )
      );

      for (const input of inputs) {
        const file = input.files && input.files[0];
        if (!file) continue;
        const buffer = await file.arrayBuffer();
        const m = input.id.match(/(\d+)$/);
        const bankId = m ? m[1] : "";
        iframe.contentWindow?.postMessage(
          {
            type: "amos-bank",
            token,
            bankId,
            name: file.name,
            mime: file.type || "application/octet-stream",
            buffer,
          },
          "*",
          [buffer]
        );
      }

      // 2) NEW: also forward from React state (programmatically loaded files)
      const files = bankFilesRef.current || [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f) continue;
        const buffer = await f.arrayBuffer();
        iframe.contentWindow?.postMessage(
          {
            type: "amos-bank",
            token,
            bankId: String(i + 1),      // banks are 1-based in your IDs
            name: f.name,
            mime: f.type || "application/octet-stream",
            buffer,
          },
          "*",
          [buffer]
        );
      }
    };


    const onMessage = (e) => {
      const data = e.data || {};
      if (data.token !== token) return;

      if (data.type === "amos-size") {
        iframe.style.width = `${Math.max(1, Math.round(data.width))}px`;
        iframe.style.height = `${Math.max(1, Math.round(data.height))}px`;
        iframe.style.height = `${Math.max(1, Math.round(data.height))}px`;
      }

      if (data.type === "amos-ready") {
        Promise.resolve()
          .then(forwardBanks) // run on next tick to be safe
          .then(() => {
            console.log("[parent] banks forwarded, telling iframe we're done");
            iframe.contentWindow &&
              iframe.contentWindow.postMessage(
                { type: "amos-banks-done", token },
                "*"
              );
          });
      }
    };
    window.addEventListener("message", onMessage);

    const FONT_CSS = `
@font-face { font-family: 'Amiga4Ever';
  src: url('/fonts/amiga4ever.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Amiga4EverPro';
  src: url('/fonts/amiga4ever-pro.ttf') format('truetype'); font-display: swap; }
html, body, #game-container, #amos-screen, * { font-family: 'Amiga4Ever', sans-serif; }
`;

    iframe.srcdoc = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      ${FONT_CSS}
      html, body { margin:0; padding:0; height:100%; overflow:hidden; box-sizing:border-box; }
      *, *::before, *::after { box-sizing: inherit; }
      #game-container { position:relative; display:inline-block; }
      #amos-screen { box-sizing: content-box; }
      body { font: 14px/1.4 system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script>
      const TOKEN = ${JSON.stringify(token)};
      const EXTRA = 30;

      // Tell parent we're ready to receive banks
      window.parent && window.parent.postMessage({ type: "amos-ready", token: TOKEN }, "*");

      // Pipe console to parent (optional)
      (function () {
        const send = (level, args) => {
          try { parent.postMessage({ type: "amos-console", level, args, token: TOKEN }, "*"); } catch {}
        };
        ["log","warn","error","info"].forEach(level => {
          const orig = console[level];
          console[level] = function () { send(level, Array.from(arguments)); orig && orig.apply(console, arguments); };
        });
        window.onerror = function (msg, src, line, col, err) {
          send("error", [msg, { src, line, col, stack: err && err.stack }]);
        };
      })();

      // --- BANK STORE + RESOLVER ---
      const BANKS_BY_ID   = new Map();   // "1" -> rec
      const BANKS_BY_NAME = new Map();   // exact lowercased name -> rec
      const BANKS_BY_NORM = new Map();   // normalized key -> rec

      const clean = (s) => String(s || "").trim().replace(/['"]/g, "");
      const norm  = (s) => {
        s = clean(s).toLowerCase();
        s = s.replace(/^amosbank[_-]?/, "");     // drop "AmosBank_" prefix
        s = s.replace(/\.(abk|bank)$/i, "");     // drop extension
        s = s.replace(/[\\s._-]+/g, "");          // remove separators
        return s;
      };

      // IMPORTANT: define banksReady so we can await it later
      let resolveBanksReady;
      const banksReady = new Promise((res) => {
        resolveBanksReady = res;
        setTimeout(res, 500); // fallback if no banks are posted
      });

      window.__getBankFile = function (bankId, bankName) {
        const nameClean = clean(bankName);
        const nameKey   = nameClean.toLowerCase();
        const normKey   = norm(nameClean);

        let rec = null;
        if (bankId != null) rec = BANKS_BY_ID.get(String(bankId));
        if (!rec && nameKey) rec = BANKS_BY_NAME.get(nameKey);
        if (!rec && normKey) rec = BANKS_BY_NORM.get(normKey);

   
        if (!rec) return null;
        try {
          return new File([rec.buffer], rec.name || \`bank\${bankId||''}.abk\`, { type: rec.mime || "application/octet-stream" });
        } catch {
          const blob = new Blob([rec.buffer], { type: rec.mime || "application/octet-stream" });
          blob.name = rec.name || \`bank\${bankId||''}.abk\`;
          return blob; // FileReader works with Blob too
        }
      };

      // Receive banks from parent
      window.addEventListener("message", (e) => {
        const d = e.data || {};
        if (d.token !== TOKEN) return;

        if (d.type === "amos-bank") {
          const rec  = { name: d.name, mime: d.mime || "application/octet-stream", buffer: d.buffer };
          const nkey = norm(d.name);
          if (d.bankId) BANKS_BY_ID.set(String(d.bankId), rec);
          if (d.name)   BANKS_BY_NAME.set(clean(d.name).toLowerCase(), rec);
          if (nkey)     BANKS_BY_NORM.set(nkey, rec);
          console.log("[iframe] received bank", { bankId: d.bankId, name: d.name, norm: nkey, bytes: d.buffer && d.buffer.byteLength });
        }

        if (d.type === "amos-banks-done") {
          console.log("[iframe] banks done signal");
          if (typeof resolveBanksReady === "function") resolveBanksReady();
        }
      });

      // --- Size reporting (+30 px cushion) ---
      const postSize = () => {
        const screen = document.getElementById("amos-screen");
        if (!screen) return;
        const rect = screen.getBoundingClientRect();
        const w = Math.max(rect.width, screen.scrollWidth, screen.offsetWidth);
        const h = Math.max(rect.height, screen.scrollHeight, screen.offsetHeight);
        try {
          parent.postMessage({ type: "amos-size", token: TOKEN, width: Math.ceil(w) + EXTRA, height: Math.ceil(h) + EXTRA }, "*");
        } catch {}
      };
      const tryInitObservers = () => {
        const screen = document.getElementById("amos-screen");
        if (!screen) return false;
        postSize();
        const ro = new ResizeObserver(() => postSize());
        ro.observe(screen);
        const mo = new MutationObserver(() => postSize());
        mo.observe(screen, { childList: true, subtree: true, attributes: true, characterData: true });
        requestAnimationFrame(postSize);
        return true;
      };
      const moRoot = new MutationObserver(() => { if (tryInitObservers()) moRoot.disconnect(); });
      moRoot.observe(document, { childList: true, subtree: true });
      tryInitObservers();

      // Run generated code only after banks are in (or timeout)
      (async () => {
        try {
          await banksReady;
          ${jsCode}
        } catch (e) {
          console.error("Async error in dynamic JavaScript:", e);
        }
      })();
    </script>
  </body>
</html>`.trim();

    host.appendChild(iframe);

    // Re-forward banks if the user changes inputs later
    const changeHandler = () => forwardBanks();
    const bankInputs = Array.from(
      document.querySelectorAll(
        'input[type="file"][id^="bankStored"], input[type="file"][id^="Creator_bankStored"]'
      )
    );
    bankInputs.forEach((el) => el.addEventListener("change", changeHandler));

    return () => {
      window.removeEventListener("message", onMessage);
      bankInputs.forEach((el) =>
        el.removeEventListener("change", changeHandler)
      );
      try {
        iframe.remove();
      } catch { }
    };
  }, [jsCode, runNonce]);

  return <div id="game-container"></div>;
}
