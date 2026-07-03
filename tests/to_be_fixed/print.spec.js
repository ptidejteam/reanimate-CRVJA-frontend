import { translateAmos } from "../helpers/translate";

function translate(code) {
  const [lexErrs, parseErrs, normalizedJS] = translateAmos(code);
  expect(lexErrs.errors).toEqual([]);
  expect(parseErrs.errors).toEqual([]);
  return normalizedJS.replace(/\s+/g, " ").trim();
}

test("print_something", () => {
  const amosBasicCode = `Print 500/Timer;" FPS"`;

  const normalizedJS = translate(amosBasicCode);

  // Print item 0 (expression 500/Timer)
  expect(normalizedJS).toContain("const finder_printDiv0 = document.getElementById('printDiv0' + '500/Timer');");
  expect(normalizedJS).toContain("const printDiv0 = document.createElement('div');");
  expect(normalizedJS).toContain("printDiv0.innerText = 500/Timer;");
  expect(normalizedJS).toContain("printDiv0.style.color = Ink;");
  expect(normalizedJS).toContain("printDiv0.style.zIndex = \"999\";");
  expect(normalizedJS).toContain("printDiv0.id = 'printDiv0' + '500/Timer';");

  // Print item 1 (string literal " FPS")
  expect(normalizedJS).toContain("const finder_printDiv1 = document.getElementById('printDiv1' + '\" FPS\"');");
  expect(normalizedJS).toContain("const printDiv1 = document.createElement('div');");
  expect(normalizedJS).toContain("printDiv1.innerText = \" FPS\";");
  expect(normalizedJS).toContain("printDiv1.style.color = Ink;");
  expect(normalizedJS).toContain("printDiv1.style.zIndex = \"999\";");
  expect(normalizedJS).toContain("printDiv1.id = 'printDiv1' + '\" FPS\"';");
});

test("print_something_2", () => {
  const amosBasicCode = `
  Open Out 1, TempFile
  Print #1,"Hello, World!"
  Close 1
  Open In 2, TempFile
  Input #2, A$
  Close 2
  Print A$`;

  const normalizedJS = translate(amosBasicCode);

  // Assert file channel operations
  expect(normalizedJS).toContain("openFile('TempFile', 1, 'w');");
  expect(normalizedJS).toContain("writeToChannel(#1, \"Hello, World!\");");
  expect(normalizedJS).toContain("closeChannel(1);");
  expect(normalizedJS).toContain("openFile('TempFile', 2, 'r');");
  expect(normalizedJS).toContain("closeChannel(2);");

  // File input assertions
  expect(normalizedJS).toContain("let A$ = '';");
  expect(normalizedJS).toContain("readFromChannel(#2, (data) => { A$ = data; });");

  // Print assertion
  expect(normalizedJS).toContain("printDiv0.innerText = A$;");
  expect(normalizedJS).toContain("printDiv0.style.color = Ink;");
  expect(normalizedJS).toContain("printDiv0.id = 'printDiv0' + 'A$';");
});


