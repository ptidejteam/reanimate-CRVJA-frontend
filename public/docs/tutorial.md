# Build Coffee & Beer

Learn AMOS BASIC by building a small game, one working piece at a time. Move a face with **W, A, S, D**, collect coffee and beer, and watch its expression change. Three of either drink ends the game.

You will learn to load graphics from your computer, move sprites, display text, detect contact, make decisions, and organize code into procedures.

## How to follow these lessons

Work through the lessons in order. Each code block introduces a small change; the instructions tell you where it belongs. **Do not replace your whole program with a fragment.**

Each programming lesson also has a **checkpoint**: a complete, runnable `.asc` file containing everything learned so far. Download it and use **Load .ASC** in CINA if you want to compare your work or start that lesson again. The finished game is linked at the end, rather than presented all at once.

Screenshots show real CRVJA results. Select any image to open it at full size.

> Use transpiler **2.0** throughout this guide. Keep `tutorial_bank.abk` selected in **Bank 1** when running the sprite lessons.

## Lesson 1 — Bring sprites in from your computer

**Goal:** make the five tutorial images available to your program.

### Open the code editor

1. Double-click **CINA** on the CRVJA desktop.
2. Set **Version** to **2.0**.
3. Locate **Load .ASC**, **Save .ASC**, and **Run Code**. The editor is on the left; **Program Screen** is on the right.
4. Close the examples sidebar with **Menu** if you need more room.

![CINA toolbar showing Load .ASC, Save .ASC, Run Code, and Version 2.0](/docs/tutorial/01-cina-version.png)

*Use Run Code after changing a program. Later, click inside Program Screen before using the movement keys.*

### Download and inspect the sprite bank

1. [Download tutorial_bank.abk](/examples/Example5_Tutorial_Game/tutorial_bank.abk) to your computer. If your browser displays a file instead, use **Save link as...** on the download link.
2. Open **Sprites** from the desktop, then choose **Load Bank**.
3. Select the downloaded `tutorial_bank.abk`. You should see five thumbnails. Select the third thumbnail to inspect Normal Face.

![Sprite Editor with tutorial_bank.abk loaded, its five thumbnails, and Normal Face selected](/docs/tutorial/02-sprite-bank.png)

*This bank already contains the artwork. You do not need to draw or change any pixels for the tutorial.*

The editor labels its thumbnails **Sprite 1** through **Sprite 5**. The code uses image indexes starting at **0**:

- Thumbnail 1: image `0`: Coffee.
- Thumbnail 2: image `1`: Beer.
- Thumbnail 3: image `2`: Normal Face.
- Thumbnail 4: image `3`: Energy Face.
- Thumbnail 5: image `4`: Crazy Face.

### Select the file in CINA too

1. Return to CINA. If necessary, close the Sprite Editor using its top-left window control.
2. Scroll below the code editor to the bank file inputs.
3. At **Bank 1**, choose the same local `tutorial_bank.abk` file.
4. Confirm that its filename appears beside the input and in the loaded-bank list.

![CINA Bank 1 with the local tutorial_bank.abk file selected](/docs/tutorial/03-bank-slot.png)

*Opening a bank in the Sprite Editor does not select it for CINA. Bank 1 must contain the file your program will use.*

**Try it:** point out which thumbnail will become the player, and which image index the program needs for it.

## Lesson 2 — Open a screen and write text

**Goal:** run your first small program and understand coordinates.

Enter this complete program in CINA, then press **Run Code**:

```amos
Screen Open 0,320,256,16,Lowres
Text 8,8,"Coffee & Beer (WASD)"
Text 8,32,"Coffees 0/3"
Text 184,32,"Beers 0/3"
```

`Screen Open` creates screen `0`, with a width of `320`, a height of `256`, and `16` colors. We use `Lowres` for this game.

`Text x,y,"words"` places text at a position. **X increases to the right; Y increases downward.** Position `8,8` is near the top-left corner. Quotation marks distinguish literal text from a variable name.

![The first program displaying its title and two zero counters on a black screen](/docs/tutorial/04-screen-text.png)

*The text is placed above the area where the sprites will move.*

A line starting with an apostrophe is a comment. CRVJA ignores it; readers use it to understand the program:

```amos
' This is a comment about the next instruction.
Text 8,8,"Coffee & Beer (WASD)"
```

**Try it:** change the title, then run again. Change its X coordinate to move it sideways.

[Download checkpoint 01 — Screen and text](/examples/Example5_Tutorial_Game/lessons/01-screen-text.asc)

## Lesson 3 — Draw the player, coffee, and beer

**Goal:** use several images from one bank.

Keep your `Screen Open` line. Replace the text lines beneath it with the following setup:

```amos
Load "tutorial_bank.abk",1
PLAYER_X=144 : PLAYER_Y=144 : PLAYER_FACE=2
COFFEE_X=32 : BEER_X=256

Text 8,8,"Coffee & Beer (WASD)"
Sprite 1,PLAYER_X,PLAYER_Y,PLAYER_FACE
Sprite 2,COFFEE_X,96,0
Sprite 3,BEER_X,192,1
```

`Load` uses the file you selected in **Bank 1**. Typing its filename alone does not open your computer's Downloads folder.

Variables hold values that can change. `PLAYER_X=144` stores the horizontal position; `PLAYER_FACE=2` selects Normal Face. A colon separates instructions on the same line.

`Sprite` takes four values: **instance ID, X, Y, image index**.

- Sprite **1** is the player, using image **2**.
- Sprite **2** is coffee, using image **0**.
- Sprite **3** is beer, using image **1**.

The instance ID identifies an object on the screen. The image index chooses its appearance. Changing the player's image later will not change its instance ID.

![Normal Face in the playfield with Coffee near the upper left and Beer near the lower right](/docs/tutorial/05-first-sprites.png)

*Three screen objects share one bank. Each image is 32x32 pixels.*

**Try it:** change `PLAYER_FACE` from `2` to `3`, run, and inspect Energy Face. Restore `2` before continuing.

[Download checkpoint 02 — Load sprites](/examples/Example5_Tutorial_Game/lessons/02-load-sprites.asc)

## Lesson 4 — Make the character move

**Goal:** repeat input checks and update the player's position.

Keep the setup from Lesson 3. Append this loop below the three initial `Sprite` instructions:

```amos
Do
  If Key State($11)
    PLAYER_Y=Max(64,PLAYER_Y-2)
  End If
  If Key State($1F)
    PLAYER_Y=Min(224,PLAYER_Y+2)
  End If
  If Key State($1E)
    PLAYER_X=Max(0,PLAYER_X-2)
  End If
  If Key State($20)
    PLAYER_X=Min(288,PLAYER_X+2)
  End If
  Sprite 1,PLAYER_X,PLAYER_Y,PLAYER_FACE
Loop
```

Press **Run Code**, click **Program Screen**, then hold a movement key.

`Do...Loop` repeats its instructions. CRVJA lets the browser redraw between iterations. `If...End If` runs its enclosed instructions only when its condition is true.

`Key State` checks a key's scan code. The `$` prefix means hexadecimal: `$11` is **W**, `$1E` is **A**, `$1F` is **S**, and `$20` is **D** in CRVJA's keyboard mapping.

Each successful check changes a coordinate by `2`. The final `Sprite 1` instruction redraws the **same player**, now at the updated coordinates.

`Max` stops X or Y going below a lower boundary; `Min` prevents exceeding an upper boundary. A 32-pixel-wide image fits within this screen when X is between `0` and `288`. We keep Y between `64` and `224` to leave room for the text.

![The player moved to the right while Coffee and Beer remain in their original positions](/docs/tutorial/06-movement.png)

*Only the player's coordinates change. The two items stay still.*

**Try it:** change each movement step from `2` to `4`. Compare the speed, then restore `2`.

[Download checkpoint 03 — Movement](/examples/Example5_Tutorial_Game/lessons/03-movement.asc)

## Lesson 5 — Detect contact and choose a result

**Goal:** turn a collision result into an `If/Else` decision.

Inside the loop, immediately after the player's `Sprite` instruction and before `Loop`, add:

```amos
If Sprite Col(1,2 To 2)=-1
  Text 8,48,"Touching coffee"
Else
  Text 8,48,"Find the coffee"
End If
```

`Sprite Col` returns `-1` for a collision and `0` for no collision. The comparison `=-1` asks whether contact was detected. In a condition, `=` compares values; in an assignment such as `PLAYER_FACE=2`, it stores a value.

The first argument, `1`, is the player instance. `2 To 2` restricts the targets to coffee instance 2. These are **screen instance IDs**, not bank image indexes. The range includes both endpoints.

CRVJA tests overlapping opaque pixels. Transparent corners alone do not count as contact, and this version creates the collision mask automatically.

![Player separated from Coffee with the message Find the coffee](/docs/tutorial/07-collision-clear.png)

*The condition is false, so the Else branch displays its message.*

![Player touching Coffee with the message Touching coffee](/docs/tutorial/08-collision-touch.png)

*The same text position now shows the true branch. Updating Text at the same coordinates replaces that display instead of adding another label.*

**Try it:** change the target range to `3 To 3` and test beer. Restore the coffee range afterward.

[Download checkpoint 04 — Collision and decisions](/examples/Example5_Tutorial_Game/lessons/04-collision.asc)

## Lesson 6 — Collect coffee and change the face

**Goal:** count an event, update the text, and change the player's appearance.

Before the initial drawing instructions, initialize the counters:

```amos
COFFEE_COUNT=0 : BEER_COUNT=0
```

Remove the collision-message `If/Else` block from Lesson 5. In its place, use:

```amos
If Sprite Col(1,2 To 2)=-1
  COFFEE_COUNT=COFFEE_COUNT+1
  PLAYER_FACE=3
  Sprite Off 2
  Sprite 1,PLAYER_X,PLAYER_Y,PLAYER_FACE
End If
```

The counter increases by one. Image `3` gives the player Energy Face, while sprite ID `1` and its coordinates stay the same.

`Sprite Off 2` hides coffee by its sprite instance ID, `2`. `Sprite Col` skips hidden sprites, so holding the player at the pickup spot leaves the counter at one. At this stage, coffee stays hidden until you start the lesson again.

After this pickup block, still inside the loop, add the counter display:

```amos
COFFEE_TEXT$="Coffees "+COFFEE_COUNT+"/3"
BEER_TEXT$="Beers "+BEER_COUNT+"/3"
Text 8,32,COFFEE_TEXT$
Text 184,32,BEER_TEXT$
```

A variable ending in `$` holds text. Here `+` joins the label, current number, and limit into one string. Beer remains at zero until Lesson 8.

![Coffee collected once, Energy Face visible, and the coffee counter showing 1 out of 3](/docs/tutorial/09-coffee-pickup.png)

*Coffee has disappeared, its counter increased once, and the player still responds to WASD.*

**Try it:** stay where coffee used to be. Confirm the counter remains at 1, then move the Energy Face around.

[Download checkpoint 05 — Collect coffee](/examples/Example5_Tutorial_Game/lessons/05-coffee-pickup.asc)

## Lesson 7 — Bring coffee back after five seconds

**Goal:** schedule a future action without stopping the game loop.

Before the initial drawing instructions, add:

```amos
COFFEE_READY_AT=0
Timer=0
```

`Timer` counts in fiftieths of a second. Assigning `0` resets it. **250 ticks is five seconds.** We use `COFFEE_READY_AT=0` to mean coffee is currently available; a positive value records when it can return.

Replace the coffee pickup block with this guarded version:

```amos
If COFFEE_READY_AT=0
  If Sprite Col(1,2 To 2)=-1
    COFFEE_COUNT=COFFEE_COUNT+1
    PLAYER_FACE=3
    COFFEE_READY_AT=Timer+250
    Sprite Off 2
    Sprite 1,PLAYER_X,PLAYER_Y,PLAYER_FACE
  End If
End If
```

Then insert the following **before** that pickup block, after movement and the player's redraw:

```amos
If COFFEE_READY_AT>0
  If Timer>=COFFEE_READY_AT
    COFFEE_X=288-COFFEE_X
    COFFEE_READY_AT=0
    Sprite 2,COFFEE_X,96,0
  End If
End If
```

`>` means greater than, and `>=` means greater than or equal to. Once the deadline is reached, `Sprite 2` shows the coffee again on the opposite side. Its X position alternates between `32` and `256`, and its Y position stays at `96`.

The loop keeps moving the player and checking the clock. A `Wait 250` at pickup time would instead pause that sequence for five seconds. Here coffee returns on the first game update after its deadline.

![Coffee returned at the opposite side of the screen after the five-second delay](/docs/tutorial/10-coffee-respawn.png)

*The counter is still 1 and the player keeps Energy Face. Respawning an item is not another pickup.*

**Try it:** replace `250` with `100` to test a two-second delay. Restore `250` before the next lesson.

[Download checkpoint 06 — Coffee respawn](/examples/Example5_Tutorial_Game/lessons/06-coffee-respawn.asc)

## Lesson 8 — Give beer its own rules

**Goal:** reuse a pattern while keeping two independent pieces of state.

Initialize another deadline alongside the coffee deadline:

```amos
BEER_READY_AT=0
```

After the coffee respawn check, add the beer equivalent:

```amos
If BEER_READY_AT>0
  If Timer>=BEER_READY_AT
    BEER_X=288-BEER_X
    BEER_READY_AT=0
    Sprite 3,BEER_X,192,1
  End If
End If
```

After the coffee pickup check, but before the counter display, add:

```amos
If BEER_READY_AT=0
  If Sprite Col(1,3 To 3)=-1
    BEER_COUNT=BEER_COUNT+1
    PLAYER_FACE=4
    BEER_READY_AT=Timer+250
    Sprite Off 3
    Sprite 1,PLAYER_X,PLAYER_Y,PLAYER_FACE
  End If
End If
```

Beer is instance `3` and bank image `1`. Its pickup selects Crazy Face, image `4`, and `Sprite Off 3` hides the beer. After five seconds, `Sprite 3` shows it again on the opposite side. Beer has its own counter and deadline, so both cooldowns can run together.

The face records the **latest pickup**: coffee selects Energy Face; beer selects Crazy Face. Movement always uses the same coordinates and speed. There is no three-item ending yet; that comes in Lesson 10.

![Crazy Face after collecting Beer, with separate Coffee and Beer counters](/docs/tutorial/11-beer-pickup.png)

*After one of each drink, both counters show 1. A beer pickup changes the face without resetting the coffee counter.*

**Try it:** collect one coffee and then one beer within five seconds. Move while both items are hidden and watch them return independently.

[Download checkpoint 07 — Add beer](/examples/Example5_Tutorial_Game/lessons/07-beer-pickup.asc)

## Lesson 9 — Give the repeated work names

**Goal:** organize the working game into readable procedures.

A procedure is a named group of instructions. Its definition starts with `Procedure NAME` and ends with `End Proc`. Writing its name runs those instructions.

First, insert these declarations **after the variable initializations and before `Timer=0`**:

```amos
Global PLAYER_X,PLAYER_Y,PLAYER_FACE
Global COFFEE_X,COFFEE_COUNT,COFFEE_READY_AT
Global BEER_X,BEER_COUNT,BEER_READY_AT
```

These are the values the procedures need to share. Initialize them before declaring them `Global` in this CRVJA version.

Move the existing blocks out of the loop. Place the procedure definitions after the setup and before `Do`.

1. Wrap the four key checks and following player `Sprite` instruction in `Procedure MOVE_PLAYER` and `End Proc`.
2. Wrap both deadline/respawn checks in `Procedure RESPAWN_ITEMS` and `End Proc`.
3. Wrap both guarded pickup checks in `Procedure COLLECT_ITEMS` and `End Proc`.
4. Move the counter text into this complete procedure:

```amos
Procedure SHOW_COUNTERS
  COFFEE_TEXT$="Coffees "+COFFEE_COUNT+"/3"
  BEER_TEXT$="Beers "+BEER_COUNT+"/3"
  Text 8,32,COFFEE_TEXT$
  Text 184,32,BEER_TEXT$
End Proc
```

The two text variables are local to `SHOW_COUNTERS`: the rest of the game does not need them.

Once you have extracted all four blocks, put the **main loop** at the bottom of the file. The comment marks the code that repeats each turn.

```amos
' Main loop
Do
  MOVE_PLAYER
  RESPAWN_ITEMS
  COLLECT_ITEMS
  SHOW_COUNTERS
Loop
```

Read it as a short description of one turn. The main loop calls each procedure once per iteration. The definitions above it show how each part works. Keep waits out of these procedures.

**Check:** the game should look and behave like Lesson 8. This lesson changes its organization, so a new result screenshot is unnecessary.

**Try it:** rename `SHOW_COUNTERS` in both its definition and its call. Restore the name afterward.

[Download checkpoint 08 — Procedures](/examples/Example5_Tutorial_Game/lessons/08-procedures.asc)

## Lesson 10 — Decide when the game is over

**Goal:** leave the loop and show the right final message.

In the main loop, insert this line **between `COLLECT_ITEMS` and `SHOW_COUNTERS`**:

```amos
Exit If COFFEE_COUNT>=3 Or BEER_COUNT>=3
```

`Or` makes the condition true when **either** counter reaches three. `Exit If` leaves the enclosing `Do...Loop` immediately when that condition is true.

Our loop expresses “repeat while the game is active”: it repeats until an exit condition is met. Use this working CRVJA pattern throughout the guide; a general `While...Wend` loop is not part of these lessons.

Add the following **immediately after `Loop`**, at the end of the file.

```amos
Cls
If COFFEE_COUNT>=3
  Text 80,112,"Too many Coffees"
Else
  Text 80,112,"Too many Beers"
End If
```

`Cls` clears the sprites and counter labels. The `If/Else` selects the message. The game is outside the loop now, so movement and respawn checks have stopped.

![The cleared game screen showing Too many Coffees](/docs/tutorial/12-too-many-coffees.png)

*Three coffees end the game, even if fewer than three beers were collected.*

![The cleared game screen showing Too many Beers](/docs/tutorial/13-too-many-beers.png)

*Starting again and collecting three beers reaches the other ending.*

**Try it:** reach each ending in separate runs. Also try two coffees and two beers: the game should still be active.

[Download the completed Coffee & Beer game](/examples/Example5_Tutorial_Game/tutorial_game.asc)

## Save, restart, and troubleshoot

- **Save your changes:** use **Save .ASC** in CINA. Your downloaded file contains the current editor text.
- **Start the same lesson again:** save any changes you want to keep, refresh CRVJA, reopen CINA, choose `2.0`, select the bank in Bank 1, and use **Load .ASC** for your lesson file. Then press **Run Code**.
- **No sprites:** check Bank 1 contains `tutorial_bank.abk`, the code loads that name, and the selected version is `2.0`.
- **Keys do nothing:** click inside **Program Screen**, then use WASD. Clicking the code editor sends typing there instead.
- **An error is highlighted:** compare your code with the checkpoint. Check commas, quotation marks, `End If`, `Loop`, and `End Proc`.
- **An item disappeared:** that is expected during its five-second cooldown. It returns on the other side; movement should continue.
