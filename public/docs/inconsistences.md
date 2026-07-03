# CRVJA vs. AMOS Pro Syntax Inconsistencies

This document lists known syntax and behavior inconsistencies between the CRVJA transpiler and the official AMOS Pro specification for Amiga.

---

## 1. Type Enforcement in `Text` Command
* **Real AMOS Pro**: The `Text` command requires a string expression for its third parameter: `Text X, Y, String$`. Passing a numeric variable (e.g., `Text 10, 20, A`) causes a `Type Mismatch` error. In real AMOS, you must convert the number to a string using the `Str$` function:
  ```amos
  Text 10, 20, Str$(A)
  ```
* **CRVJA**: The grammar's `text` rule accepts either `STRING` or `IDENTIFIER` (which includes both string and numeric variables). The transpiler outputs Javascript that maps directly to HTML element `.innerText`, relying on JavaScript's implicit type coercion to display the number without error.

---

## 2. Variable String Assignments
* **Real AMOS Pro**: You can assign any string literal to a string variable:
  ```amos
  A$ = "Twins"
  ```
* **CRVJA**: The `variable_starter` rule only allows assigning `expression1` (which does not match the `STRING` token) or empty double quotes `""`. Consequently, assigning a non-empty string literal to a variable is currently syntactically invalid in the parser.

---

## 3. Procedure Call Parameter Types
* **Real AMOS Pro**: You can pass string literals directly as arguments in procedure calls:
  ```amos
  TWINS["Twins"]
  ```
* **CRVJA**: The `procedure_call` rule expects arguments to be of type `expression1` (which does not match the `STRING` token). Only numbers and identifiers (variable names) can be passed inside the bracket parameters.

---

## 4. Lack of String Conversion Functions
* **Real AMOS Pro**: Functions like `Str$(A)` (convert integer to string), `Val(A$)` (convert string to number), or string concatenation `A$ + B$` are fully supported.
* **CRVJA**: These built-in AMOS functions are not implemented in the transpiler or grammar.

---

## 5. Dynamic JavaScript Arrays vs. Fixed AMOS Arrays
* **Real AMOS Pro**: Arrays are strictly bound by their dimension limits declared via `Dim`. Assigning or reading an index outside the declared bounds (e.g., accessing index `5` on a `Dim C(2)`) throws an out-of-bounds error.
* **CRVJA**: Since JavaScript arrays are dynamically sized, assigning elements outside the initial allocated bounds will succeed and automatically expand the array. For example, the following program works in CRVJA despite `Dim C(2)` allocating only indices 0 to 2:
  ```amos
  Screen Open 1,720,720,8,Hires
  Dim C(2)
  Global C()

  For I=0 To 5
    C(I)=I*10
    Text 0, I*10, "oi"
  Next I

  Print C
  ```

---

## 6. The `Print` Command
* **Real AMOS Pro**: The `Print` command prints text or variables to the standard output/screen console, respecting cursor positions, and scrolling the screen if necessary.
* **CRVJA**: The `Print` command is not well implemented yet and its behavior might differ significantly or lack features compared to real AMOS.

## 7. AMCAF Commands
* We have implemented a few AMCAF commands directly in CRVJA, they should not be implemented as they are not part of the official AMOS Pro specification. For future work, we should remove these commands from the transpiler and grammar to maintain consistency with the official AMOS Pro language. Also, we need to add the possibility of loading extensions (like AMCAF) in the transpiler, so users can choose to use them if they want to.