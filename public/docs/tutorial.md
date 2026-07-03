# CRVJA Tutorial: Creating Your First Visual Programs

Welcome to CRVJA! This tutorial is designed for beginners who want to learn how to create simple visual programs and games using AMOS, a programming language originally created for the Amiga computer and now brought to the modern web.

In this tutorial, you will learn the basics of setting up a screen, changing colors, printing text, and drawing shapes. You can test all the code examples by running CRVJA in your browser (usually at `https://crvja.reanimate.school/`), typing the code into the editor.

![CRVJA Code Editor](/docs/crvja_editor.png)

---

## 1. Setting up the Screen

Before we can draw anything, we need to create a canvas (or screen) to draw on. In AMOS, we do this using the `Screen Open` command.

Here is the simplest way to start a program:

```amos
Screen Open 1, 600, 400, 8, Hires
```


**What does this mean?**
- `1`: The ID of the screen. We use `1` for our main screen.
- `600, 400`: The width and height of the screen in pixels. Here, our screen is 600 pixels wide and 400 pixels tall.
- `8`: The number of colors we want to be able to use.
- `Hires`: High resolution mode.

For some games we don't want the cursor to be visible, we usually add the `Curs Off` command right after opening the screen:

```amos
Screen Open 1, 600, 400, 8, Hires
Curs Off
```

---

## 2. Changing the Background Color

By default, the screen might look plain. Let's make it black! 
We use the `Paper` command to select a background color, and the `Cls` (Clear Screen) command to paint the entire screen with that color.

```amos
Screen Open 1, 600, 400, 8, Hires
Curs Off

' Set the background color to 0 (which is black) and clear the screen
Paper 0
Cls
```

*Note: In AMOS, lines starting with an apostrophe `'` are comments. They are ignored by the computer and are just there to help humans understand the code.*

---

## 3. Printing Text on the Screen

We can use the `Text` command to place words anywhere on the screen. 

First, we need to pick a color for our text using the `Ink` command. Colors are represented by numbers (for example, `1`, `2`, `3`).

```amos
Screen Open 1, 600, 400, 8, Hires
Curs Off
Paper 0
Cls

' Pick color #2 for our text
Ink 2

' Write "Hello World!" at X=10, Y=20
Text 10, 20, "Hello World!"
```

**How coordinates work (X and Y):**
- **X (10)**: How far from the left edge of the screen.
- **Y (20)**: How far from the top edge of the screen.

---

## 4. Drawing Shapes: A Simple Circle

Drawing shapes is just as easy as writing text. Let's draw a circle. We will use the `Circle` command, which needs three pieces of information: the X position, the Y position, and the radius (how big the circle is).

```amos
Screen Open 1, 600, 400, 8, Hires
Curs Off

' 2. Setup the background
Paper 0
Cls

' 3. Write a title
Ink 2
Text 150, 30, "My First CRVJA Program!"

' 4. Draw a big circle in the middle
Ink 5
Circle 300, 200, 80

```

Since our screen is 600 pixels wide and 400 pixels tall, placing the circle at X=300 and Y=200 puts it right in the middle!

---

# Sprites and Controls

By the end of this tutorial, you will understand how sprites work in CRVJA, how to use the built-in Bank Editor to design your own graphics, and how to write a simple AMOS BASIC game from scratch!

---

## 1. What are Sprites?

In retro game development (specifically on the Commodore Amiga), **sprites** are graphics that can move around the screen independently of the background. They are ideal for players, enemies, items, and projectiles.

In CRVJA, sprites are managed through **Sprite Banks** (binary files with the `.abk` extension, short for Amiga Bank). A sprite bank contains:
1. **Planar Pixel Data**: The raw graphics frames.
2. **Hotspots**: The anchor/origin point (X, Y) of the sprite for positioning and rotation.
3. **Color Palette**: An array of 32 colors.
   * **Note on Transparency**: In AMOS, **Palette Index 0** is always reserved for transparency. Any pixel painted with the first color in the palette will be invisible in the game.

### Technical Concept: Bitplanes and Planar Data
Unlike modern images (PNG/JPG) which store red, green, and blue values for each pixel sequentially (chunky format), the Amiga stores graphics in **bitplanes** (planar format). 

For a sprite with a color **depth of 4** (which means 4 bitplanes), each pixel's color is defined by a 4-bit index (supporting $2^4 = 16$ colors). To determine a pixel's color, CRVJA reads 1 bit from each of the 4 planes and combines them (using bitwise OR operations) to get a number between 0 and 15, which is then mapped to the 32-color palette. 

---

## 2. Using the Built-in Bank Editor (Sprite Editor)

CRVJA includes a built-in sprite editor so you can draw your sprites directly in your browser.

### How to Open the Editor
1. Open the CRVJA Workbench interface in your browser (usually at `https://crvja.reanimate.school/`).
2. Double-click the **Sprites** icon on the desktop. This opens the **Bank Editor** window.

### Anatomy of the Bank Editor

![Sprites Editor](/docs/sprites_editor.png)

#### A. The Palette (Left Column)
* **Select active color**: Left-click any color box to set it as your current drawing color.
* **Edit a color**: Right-click a color box to open a color picker. Pick a new color and click **Close** to update the palette.
* **Transparency**: Remember, the first color box (Index 0) is transparent in the game.

#### B. The Pixel Editor (Middle Column)
* **Width and Height**: Set the dimensions of the selected sprite frame.
  * *Important*: In AMOS, sprite width is measured in **16-bit words** (units of 16 pixels). A width of `1` means 16 pixels; `2` means 32 pixels. Height is measured in actual pixels (e.g., `16`, `24`).
* **Canvas Grid**: Left-click or click-and-drag across the grid to paint pixels.
* **Save/Delete**: Click **Save** to apply your changes to the active frame, or **Delete** to delete it.

#### C. Sprites Bank (Right Column)
* **Add New Sprite**: Creates a blank sprite frame (default 16x16 pixels).
* **Duplicate Sprite selected**: Clones the active sprite. This is extremely useful for drawing running or spinning animations frame-by-frame.
* **Clear Bank**: Resets all sprites and clears the palette.
* **Save Bank to Local Storage**: Saves your work to the browser's storage so you don't lose it if you refresh the page.
* **Load Bank**: Lets you select and load an existing `.abk` file from your computer.

### Exporting Your Sprites
Once you are done drawing, click the **GENERATE BANK FILE** button at the top-left of the editor. This compiles your sprites into a binary `.abk` file (e.g., `AmosBank_test4.abk`) and downloads it to your computer.

---

## 3. Loading and Drawing Sprites in AMOS Code

To use your sprites in a game, you must write code in the CRVJA code editor.

### Step 1: Assign the Sprite Bank to a Slot
1. At the bottom of the CRVJA code editor, locate the **Bank Manager** panel.
2. Select **Bank 1**'s file input and upload your `.abk` file. The sandbox will now make this file available to your code.

### Step 2: Write the Loading Code
To load the sprites into memory in your program, use the `Load` command:

```amos
Load "sprites.abk"
```
*Note: By default, this loads the bank into Bank Slot 1. If you need to specify a slot, you can append it: `Load "sprites.abk", 1`.*

### Step 3: Draw a Sprite Frame on Screen
To render a sprite on the screen, use the `Sprite` command:

```amos
Sprite SpriteID, X, Y, BankIndex
```
* **`SpriteID`**: A unique number (e.g., `1`, `2`, `3`) representing this sprite instance on screen. 
* **`X`**: The horizontal position on screen (in pixels).
* **`Y`**: The vertical position on screen (in pixels).
* **`BankIndex`**: The index of the frame inside your `.abk` file (0-based: `0` is the first sprite, `1` is the second, etc.).

For example, to draw sprite ID `1` at coordinates `100, 150` using the first frame of your bank:
```amos
Sprite 1, 100, 150, 0
```

---

## 4. Game Tutorial: Creating "Catch the Fruit"

Let's write a complete, playable video game! In this game, you control a character (Sprite ID 1) and try to collect a fruit (Sprite ID 2) that spawns randomly. Every time you catch it, the fruit relocates and a sound plays.

### Step 1: Draw Your Sprites
Open the **Sprites Editor** (Bank Editor) and create a bank with two sprites:
1. **Frame 0 (Player)**: Draw a character (e.g., a yellow circle, a space invader, or a face).
2. **Frame 1 (Fruit)**: Click **Add New Sprite** and draw a fruit (e.g., red pixels with a green stem).
3. **Palette**: Ensure you have some vibrant colors set.
4. Click **GENERATE BANK FILE** and rename the downloaded file to `game.abk`.

### Step 2: Upload `game.abk`
In the CRVJA editor under **Bank 1**, select your `game.abk` file.

### Step 3: Write the Code
Copy and paste the following AMOS BASIC code into the CRVJA code editor:

```amos
'Tutorial: Catch the Fruit Game
Screen Open 1, 600, 400, 8, Hires
Curs Off
Paper 0 : Cls

' 2. Load Visual Assets
Load "game.abk"

' 3. Initialize Variables
PLAYER_X = 100
PLAYER_Y = 150
PLAYER_SPEED = 6

' Spawn the Fruit
FRUIT_X = 300
FRUIT_Y = 200

' 4. Main Game Loop
Do
   ' Read Keyboard Controls (W/S/A/D or Arrow Keys)
   ' A Key ($1E) or Left Arrow ($70)
   If Key State($1E)
      PLAYER_X = PLAYER_X - PLAYER_SPEED
   End If
   If Key State($70)
      PLAYER_X = PLAYER_X - PLAYER_SPEED
   End If

   ' D Key ($20) or Right Arrow ($71)
   If Key State($20)
      PLAYER_X = PLAYER_X + PLAYER_SPEED
   End If
   If Key State($71)
      PLAYER_X = PLAYER_X + PLAYER_SPEED
   End If

   ' W Key ($11) or Up Arrow ($6E)
   If Key State($11)
      PLAYER_Y = PLAYER_Y - PLAYER_SPEED
   End If
   If Key State($6E)
      PLAYER_Y = PLAYER_Y - PLAYER_SPEED
   End If

   ' S Key ($1F) or Down Arrow ($73)
   If Key State($1F)
      PLAYER_Y = PLAYER_Y + PLAYER_SPEED
   End If
   If Key State($73)
      PLAYER_Y = PLAYER_Y + PLAYER_SPEED
   End If
   
   ' Clamp Player to Screen Boundary (assuming 16x16 sprite size)
   If PLAYER_X < 10
      PLAYER_X = 10
   End If
   If PLAYER_X > 570
      PLAYER_X = 570
   End If
   If PLAYER_Y < 30
      PLAYER_Y = 30
   End If
   If PLAYER_Y > 370
      PLAYER_Y = 370
   End If
   
   ' 5. Draw Sprites on Screen
   ' Draw Player (Sprite ID 1, using frame 0)
   Sprite 1, PLAYER_X, PLAYER_Y, 0
   
   ' Draw Fruit (Sprite ID 2, using frame 1)
   Sprite 2, FRUIT_X, FRUIT_Y, 1
   
   ' 6. Collision Detection (Overlap within 16 pixels)
   ' Check if player and fruit overlap
   If PLAYER_X > FRUIT_X - 16
      If PLAYER_X < FRUIT_X + 16
         If PLAYER_Y > FRUIT_Y - 16
            If PLAYER_Y < FRUIT_Y + 16
               ' Collision! Relocate Fruit inside boundaries
               FRUIT_X = 10 + Rnd(560)
               FRUIT_Y = 30 + Rnd(340)
               
               ' Play note 37 (middle C area) for 1 second as sound effect
               Play 37, 1
            End If
         End If
      End If
   End If
   
   ' 7. Control Frame Rate (Ticks)
   ' Wait 2 ticks (~40ms) to keep controls responsive and smooth
   Wait 2
Loop
```

### Step 4: Run the Game!
Click the **Run code** button. Use the arrow keys or **W, A, S, D** to move your character. Go catch that fruit!

---
