# Reanimate-CRVJA

Reanimate-CRVJA is a web-based environment that brings retro Amiga AMOS BASIC games and applications to the modern web. It provides an Amiga Workbench-styled UI where users can load, edit, and run AMOS code.

> **Note:** The core AMOS to JavaScript transpiler is no longer in this frontend repository; it has been moved to the [Reanimate-CRVJA Backend](https://github.com/ptidejteam/reanimate-CRVJA-backend). Eventually, the sprite bank decoding logic will also be moved to the backend.

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
The frontend sends your AMOS code to the backend API to be transpiled into JavaScript. Once the transpiled code is returned, the frontend injects it into a sandboxed `iframe`. The frontend provides all necessary polyfills—such as simulating Amiga screens with DOM elements, drawing graphics, mapping keyboard inputs, and playing audio via the Web Audio API—to seamlessly execute the retro game logic.
