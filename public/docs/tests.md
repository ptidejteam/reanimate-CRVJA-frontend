# Testing in CRVJA

This document details the testing architecture, validation patterns, and writing guidelines for the CRVJA transpiler test suite.

---

## 1. Overview of the Testing Strategy

To ensure correctness and prevent regressions, CRVJA uses unit tests to assert that AMOS Pro statements compile into correct, functional JavaScript blocks.

In compiler development, tests are critical. Even small changes in the grammar or transpiler hooks can have ripple effects (regressions) that break translations of other unrelated statements.

### The Parsing & Compilation Testing Pipeline
```
  [Mock AMOS Code] -> [translateAmos Helper] -> [InputStream] -> [Lexer] -> [TokenStream] -> [Parser] -> [AST Tree]
                                                                                                      │
                                                                                              [ParseTreeWalker]
                                                                                                      │
                                                                                              [Listener Traversal]
                                                                                                      │
    [Jest Assertions] <----------------- [Assert JS Output] <-------------------------- [Translated JS Code]
```

To keep tests clean and DRY, we use a shared helper [translate.js](../tests/helpers/translate.js) inside the `tests/helpers` folder which automates the ANTLR lexer, parser, walker, and translator setup.

---

## 2. Test Environment Configuration

* **Test Framework**: Jest
* **Environment**: Node/jsdom, configured in [jest.config.js](../jest.config.js).
* **Test Location**: All test files are located in the [tests/](../tests) directory and follow the naming convention `*.spec.js`.

---

## 3. Template: How to Write a New Test

When implementing a new AMOS command (e.g., `Cls`), you should write a matching unit test to verify its compilation. Here is the standard template using the shared helper:

```javascript
import { translateAmos } from "./helpers/translate";

test("cls translation", () => {
  // 1. Mock AMOS Code
  const amosBasicCode = `
        Cls
    `;

  // 2. Translate AMOS code using the shared helper
  const translatedJsCode = translateAmos(amosBasicCode);

  // 3. Run Assertions (using normalized whitespace)
  const normalizedTranslated = translatedJsCode.replace(/\s+/g, " ").trim();
  expect(normalizedTranslated).toContain("const amosScreen = document.getElementById('amos-screen');");
  expect(normalizedTranslated).toContain("amosScreen.innerHTML = '';");
});
```

---

## 4. Best Practices: Handling Formatting & Whitespace Sensitivity

Direct string comparisons (e.g., matching indentation or carriage returns exactly) are fragile. If you adjust block formatting in the compiler, minor spacing modifications will break tests.

To write resilient tests, use **whitespace normalization** to collapse multiple spaces, tabs, and line breaks into single spaces before comparing strings:

```javascript
// Normalize spaces and linebreaks for comparison
const normalizedTranslated = translatedJsCode.replace(/\s+/g, " ").trim();
const normalizedExpected = "const printDiv = document.createElement('div');".replace(/\s+/g, " ").trim();

expect(normalizedTranslated).toContain(normalizedExpected);
```

---

## 5. Critical Troubleshooting: The Walker Mismatch Bug

During the project's development, a subtle issue was uncovered where AST walking would succeed in the React client, but silently fail during Jest tests (not triggering any translator hooks).

### Root Cause
Because of legacy file duplicates, the transpiler files were importing `AMOSListener` and `AMOSParser` from different locations:
* The transpiler (`AmosToJavaScriptTranslator`) imported `AMOSListener` from the root directory `./` (or `@/`).
* The test suites imported `AMOSParser` and `AMOSLexer` from `/grammar/generated/`.

When Node's module loader resolves these imports, they are instantiated as two separate class prototypes in memory. Consequently, inside the ANTLR runtime, the `ParseTreeWalker` checks if the listener extends the expected listener type:
```javascript
// Internal ANTLR4 walk check
if (listener instanceof AMOSListener) { ... }
```
Because the prototypes came from separate files, the check returned `false`, and the walker silently skipped every listener rule.

### Solution
1. **Unify all imports**: Update all compiler and test imports to point strictly to the `/grammar/generated/` folder.
2. **Remove duplicates**: Clean up and delete any duplicate ANTLR output files in the root folder, ensuring only the unified `/grammar/generated/` files exist.

---

## 6. Running the Test Suite

You can run test commands directly from the repository root:

* **Run all tests**:
  ```bash
  npx jest
  ```
* **Run a specific test suite**:
  ```bash
  npx jest tests/cls.spec.js
  ```
* **Run tests in watch mode** (automatically reruns when code files are modified):
  ```bash
  npx jest --watch
  ```

---

## 7. Untested AMOS Statements (Future Work)

While the core functionality and commonly used statements have robust test coverage, several complex graphics, logical, and specific AMOS statements are not yet covered by the test suite. We plan to write tests for these in the future as their behavior stabilizes:

* **Graphics & Rendering**: \`Bar\`, \`Box\`, \`Circle\`, \`Flash Off/On\`, \`Hide\`, \`Paper\`, \`Palette\`, \`Pen\`, \`Double Buffer\`, \`Autoback\`, \`Blitter Copy/Fill/Clear\`, \`Locate\`, \`Turbo Draw\`, \`Set Buffer\`, \`Screen Offset/Swap\`, \`Choose Screen\`.
* **Logic & Flow Control**: \`If/Then\` and \`If\` with complex logic, \`While...Wend\`, \`Gosub/On Gosub\`, \`Goto\`, \`Data/Read\`, \`Repeat/Until\`.
* **Hardware & Sound**: \`Play\` (complex usages), \`Wait Vbl\`, \`Wait\`, \`Key Speed\`, \`Clear Key\`, \`Led Off\`.
* **Sprites & Effects**: \`LoadBankImgToSprite\` (Sprite commands), \`Sam Bank/Loop\`, \`Bob Off/Update On\`, \`Set/Use Rainbow\`.
* **State & Data**: \`Ink\`, \`Global\`, \`Btst\`, \`Degree\`, \`Add\`.

When implementing these missing tests, please follow the guidelines defined in section 3 of this document.
