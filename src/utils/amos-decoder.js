import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { parseExtensionToTable, printAMOSSource, TokenTable } from './amos-binary-parser';
function collectTableEntries(table) {
  const out = [];
  // common cases
  if (table.map && typeof table.map.entries === 'function') {
    for (const [k, v] of table.map.entries()) out.push([k >>> 0, v]);
    return out;
  }
  if (table._map && typeof table._map.entries === 'function') {
    for (const [k, v] of table._map.entries()) out.push([k >>> 0, v]);
    return out;
  }
  if (table.store && typeof table.store === 'object') {
    for (const k of Object.keys(table.store)) out.push([Number(k) >>> 0, table.store[k]]);
    return out;
  }
  if (typeof table.forEach === 'function') {
    table.forEach((v, k) => out.push([Number(k) >>> 0, v]));
    return out;
  }
  // last resort: iterator
  if (typeof table.entries === 'function') {
    const it = table.entries();
    if (it && typeof it[Symbol.iterator] === 'function') {
      for (const [k, v] of it) out.push([Number(k) >>> 0, v]);
      return out;
    }
  }
  console.warn('collectTableEntries: could not introspect TokenTable');
  return out;
}

function tableHas(table, key) {
  try {
    return table.get ? table.get(key >>> 0) != null : false;
  } catch {
    return false;
  }
}
function seedBuiltins(t) {
  const add = (code, name) => t.set(code, 'I', name);
  add(0x005c, ',');
  add(0x0054, ':');
  add(0x0064, ';');
  add(0x0074, '(');
  add(0x007c, ')');
  add(0x0094, 'To');
  add(0x0246, 'Next');
  add(0x0476, 'Print');
  add(0x0640, 'Dim');
  add(0x09ea, 'Screen Open');
  add(0x0c90, 'Lowres');
  add(0x0d34, 'Flash Off');
  add(0x1446, 'Curs Off');
  add(0x1de0, 'Hide');
  add(0x06ca, 'Degree');
  add(0x13dc, 'Paper');
  add(0x0bae, 'Cls');
  add(0x0cfc, 'Palette');
  add(0x13d2, 'Pen');
  add(0x012c, 'Double Buffer');
  add(0x0e2c, 'Autoback');
  // operators:
  add(0xffa2, '=');
  add(0xffca, '-');
  add(0xffc0, '+');
  add(0xffe2, '*');
  add(0xffec, '/');
  add(0x0652, "'");
  add(0x023c, 'For');
  add(0x027e, 'Do');
  add(0x0286, 'Loop');
  add(0x0458, 'Add');
  add(0x02be, 'If');
  add(0x02da, 'End If');
  add(0x1378, 'Locate');
  add(0x12ce, 'Timer');
  add(0x0462, 'Add');
  add(0x0ae2, 'Screen Swap');
  add(0x0cca, 'Wait Vbl');
  add(0x070c, 'Cos');
  add(0x0702, 'Sin');
}

const be32 = (b, i) => (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3];

function findExtSlots(code) {
  const be16 = (b, i) => (b[i] << 8) | b[i + 1];
  const slots = new Set();
  for (let p = 0; p + 2 <= code.length; ) {
    const nWords = code[p];
    if (!nWords) break;
    const end = p + nWords * 2;
    for (let q = p + 2; q + 2 <= end; ) {
      const t = be16(code, q);
      q += 2;
      if (t === 0x004e && q + 4 <= end) {
        // extension token
        const extNum = code[q]; // slot number
        slots.add(extNum);
        q += 4;
      }
    }
    p = end;
  }
  return [...slots];
}
const AMOSDecoder = forwardRef(({ onDecoded }, ref) => {
  const tableRef = useRef(null);
  const [ready, setReady] = useState(false); // <- gate UI
  const [log, setLog] = useState('');

  useEffect(() => {
    (async () => {
      const table = new TokenTable();

      // Core tokens (slot 0) — all defined in seedBuiltins()
      seedBuiltins(table);

      try {
        const libs = [{ file: '/extensions/AMOSPro_AMCAF.Lib', slot: 8 }];
        for (const { file, slot } of libs) {
          const res = await fetch(file);

          if (!res.ok) throw new Error(`Failed to fetch ${file}`);
          const buf = new Uint8Array(await res.arrayBuffer());

          // try both starts: 6 first, then 0
          let ok = parseExtensionToTable(buf, slot, 6, table);
          if (!ok) ok = parseExtensionToTable(buf, slot, 0, table);
        }
      } catch (e) {
        console.warn('Extension load warning:', e);
      }
      tableRef.current = table;

      setReady(true);
    })();
  }, []);

  useImperativeHandle(ref, () => ({
    handleFile: (file) => {
      if (!file || !tableRef.current) return;

      const r = new FileReader();
      r.onload = () => {
        const buf = new Uint8Array(r.result);
        const tokenizedLen = be32(buf, 16) >>> 0;
        const code = buf.subarray(20, 20 + tokenizedLen);
        console.log('Ext slots in this program:', findExtSlots(code)); // e.g. [8]
        const text = printAMOSSource(code, tableRef.current);
        onDecoded?.(text);
        setLog(''); // or keep a console log if you want
      };
      r.readAsArrayBuffer(file);
    },
  }));

  return (
    <div style={{ display: 'none' }}>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{log}</pre>
    </div>
  );
});

export default AMOSDecoder;
