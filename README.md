# Reanimate-CRVJA-frontend

Reanimate-CRVJA is a web-based environment that brings retro Amiga AMOS BASIC games and applications to the modern web. It provides an Amiga Workbench-styled UI where users can load, edit, and run AMOS code.

> **Note:** Compiler and binary-processing operations—including AMOS-to-JavaScript transpilation, binary AMOS detokenization, and sprite-bank parsing/generation—live in the [Reanimate-CRVJA Backend](https://github.com/ptidejteam/reanimate-CRVJA-backend).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build and start for production:**
   ```bash
   npm run build
   npm start
   ```

## Features
- **Workbench UI**: A retro desktop interface featuring draggable windows and icons.
- **Code Editor**: Write and load AMOS `.ASC` or `.txt` scripts directly in the browser.
- **Sprite Editor**: Load and edit `.abk` sprite banks, modify pixels, change palettes, and export.
- **Sandboxed Execution**: Runs the transpiled JavaScript safely within an isolated iframe.

## How It Works
The frontend sends AMOS source, binary programs, and sprite banks to the backend APIs for processing. Once transpiled JavaScript is returned, the frontend injects it into a sandboxed `iframe`. The frontend provides all necessary polyfills—such as simulating Amiga screens with DOM elements, drawing graphics, mapping keyboard inputs, and playing audio via the Web Audio API—to seamlessly execute the retro game logic.
