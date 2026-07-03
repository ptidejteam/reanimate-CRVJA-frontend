# AMOS to JavaScript Translation Engine

This document details the architectural design, core translation mechanics, and execution runtime of the CRVJA compilation engine. It serves as a comprehensive guide for developers extending the translation capabilities of the project.

---

## 1. Compiler Design & Architectural Pattern

The CRVJA compiler is a **source-to-source compiler (transpiler)** that maps the syntax structure of AMOS Pro to execution-ready modern JavaScript. Instead of compiling code into an Intermediate Representation (IR) or machine bytecode, it translates the AST directly into Javascript.

The core transpiler logic resides in [AmosToJavaScriptTranslator.js](../src/transpiler/AmosToJavaScriptTranslator.js), which extends `AMOSListener` (found in the generated [AMOSListener.js](../grammar/generated/AMOSListener.js)).

### The Listener Pattern Execution Flow
As the ANTLR4 `ParseTreeWalker` performs a depth-first traversal of the AST, it triggers two hooks for each node corresponding to a grammar rule:
1. `enterRule(ctx)`: Fired when entering the node.
2. `exitRule(ctx)`: Fired when exiting the node.

The transpiler overrides these hooks to translate AMOS commands into JS on the fly, appending code snippets to a central output buffer (`this.output`).

```
       [AST Node: cls]
              │
              ├───> ParseTreeWalker enters node
              │        │
              │        └──> Calls enterCls(ctx)
              │                │
              │                └──> Appends JS code to this.output
              │
              └───> ParseTreeWalker exits node
```

---

## 2. Organization of `AmosToJavaScriptTranslator.js`

The transpiler class is structured into three main layers:

### A. The Prelude / Runtime Injection
In the class constructor, `this.output` is pre-populated with a runtime environment containing polyfills and libraries simulating the Amiga hardware environment:
* **Color Palette Mapper (`colorMapping`)**: Resolves Amiga color indices to CSS hex or web-safe color strings.
* **Keyboard Driver (`keyMapping`)**: Maps browser keyboard event codes (`e.code`) to the standard Amiga key matrix layout.
* **Sound Synthesizer (`soundPlayer`)**: A Web Audio API wrapper that plays notes via frequency mapping and customizable waveforms (sine, triangle, custom).
* **Buffer and Sprite Engines**: Standard JS functions for handling coordinate conversions, screen divisions, and sprite planar graphic unpacking.

### B. Indentation Management
To generate readable, debuggable JavaScript, the class monitors code indentation dynamically:
* `this.indentLevel`: Tracks nesting depth.
* `this.indent()`: Helper method returning double-space strings matching the current depth.
* Control flow rules (like loops and branches) increment the indent level on entry and decrement it on exit.

### C. Emulator State Tracking
Unlike stateless transpilers, CRVJA keeps track of context-specific emulator states inside the translator constructor, such as:
* Active screens and layers.
* Current foreground ink color (`Ink`).
* System timers (`Timer`).
* Active procedure stack scopes.

---

## 3. Context Traversals & AST Parameter Extraction

To translate statements that have arguments (e.g., numbers, variables, or expressions), the transpiler must inspect the child nodes of the parser rule context (`ctx`).

ANTLR provides two key approaches for extracting these arguments:

### A. Positional Indexing (`ctx.children[i]`)
For simple rules with strict, fixed token structures, child nodes can be accessed by index.
```javascript
enterScreen_open(ctx) {
  const width = ctx.children[3]?.getText();  // Captures the width token
  const height = ctx.children[5]?.getText(); // Captures the height token
}
```

### B. Rule-Specific Accessor Methods (`ctx.expression1()`)
For rules that wrap other recursive parser sub-rules (like arithmetic expressions), ANTLR generates named accessor helper methods. For example, if a rule contains multiple `expression1` nodes:
```javascript
enterBlitter_clear(ctx) {
  // Accesses instances of expression1 by index
  const x1 = ctx.expression1(0)?.getText();
  const y1 = ctx.expression1(1)?.getText();
}
```

---

## 4. Asynchronous Loop Translation: The Loop Challenge

In native retro games, logic runs inside synchronous, blocking loops (e.g. `Do ... Loop`, `While ... Wend`). However, modern browsers are single-threaded and event-driven; running a blocking loop in JavaScript will freeze the browser tab and prevent DOM rendering.

### The Solution: Asynchronous Frame Simulation
CRVJA solves this by compiling synchronous AMOS loops into asynchronous interval timers (`setInterval` or `setTimeout`) running at a 60 FPS refresh rate (16.6ms per frame):

For example, when compiling a `Do ... Loop` statement, the transpiler generates the following:
```javascript
let allowLoop = true; // Control flag to pause/resume execution
setInterval(() => {
  if (!allowLoop) return; // Prevent loop cycle execution if paused
  
  // Loop body content goes here...
  
}, 16);
```
This asynchronous design allows the browser to process inputs, render graphics, and play sounds concurrently without blocking the main browser thread.

---

## 5. Case Studies in Command Translation

### Case 1: Parameterless Commands (`Cls`)
For simple statements without arguments, the transpiler appends a static JavaScript block targeting the web sandbox DOM:
```javascript
enterCls(ctx) {
  this.output += `
${this.indent()}const amosScreen = document.getElementById('amos-screen');
${this.indent()}if (amosScreen) {
${this.indent()}  amosScreen.innerHTML = '';
${this.indent()}}
  `;
}
```

### Case 2: Parameterized Commands (`Screen Open`)
For statements with variables and expressions, the transpiler extracts values from the AST context and embeds them into a template string:
```javascript
enterScreen_open(ctx) {
  const width = ctx.children[3]?.getText();
  const height = ctx.children[5]?.getText();
  const color = ctx.children[7]?.getText();

  this.output += `
${this.indent()}const screenDiv = document.createElement('div');
${this.indent()}screenDiv.style.width = '${width}px';
${this.indent()}screenDiv.style.height = '${height}px';
${this.indent()}screenDiv.style.position = 'relative';
${this.indent()}screenDiv.id = 'amos-screen';
${this.indent()}document.getElementById('game-container').appendChild(screenDiv);
${this.indent()}document.getElementById('amos-screen').style.backgroundColor = colorMapping[${color}];
  `;
}
```

---

## 6. Integration with React and Next.js

The compiler is integrated into the web client through the custom React hook [useAMOSParser.js](../app/hooks/useAMOSParser.js).

When the user types AMOS code:
1. **Debouncing**: The hook waits 250ms after the last keystroke to avoid CPU spikes.
2. **AST Parsing**: The raw AMOS text is compiled into an AST using the generated parser:
   ```javascript
   const chars = new antlr4.InputStream(amosCode);
   const lexer = new AMOSLexer(chars);
   const tokens = new antlr4.CommonTokenStream(lexer);
   const parser = new AMOSParser(tokens);
   const tree = parser.program();
   ```
3. **AST Walking**: The hook walks the tree using a new `AmosToJavaScriptTranslator` instance:
   ```javascript
   const translator = new AmosToJavaScriptTranslator();
   const walker = new antlr4.tree.ParseTreeWalker();
   walker.walk(translator, tree);
   const translatedJs = translator.getJavaScript();
   ```
4. **Formatting**: The generated JavaScript is passed to **Prettier** using the Babel plugin, ensuring clean, readable output code before rendering it in the code preview or executing it inside the sandboxed `iframe`.
