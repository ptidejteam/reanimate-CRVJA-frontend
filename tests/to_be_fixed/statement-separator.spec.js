import { translateAmos } from "../helpers/translate";

function translate(code) {
  const [lexErrs, parseErrs, normalizedJS] = translateAmos(code);
  expect(lexErrs.errors).toEqual([]);
  expect(parseErrs.errors).toEqual([]);
  return normalizedJS.replace(/\s+/g, " ").trim();
}

test("statement_separator", () => {
  const amosBasicCode = `
       Screen Open 1,600,400,8,Hires : Curs Off : Text 10,10,"ReAnimate(d) Piano"
    `;

  const normalizedJS = translate(amosBasicCode);

  // Screen Open assertions
  expect(normalizedJS).toContain("const screenDiv = document.createElement('div');");
  expect(normalizedJS).toContain("screenDiv.style.width = '600px';");
  expect(normalizedJS).toContain("screenDiv.style.height = '400px';");
  expect(normalizedJS).toContain("screenDiv.id = 'amos-screen';");
  expect(normalizedJS).toContain("screenDiv.style.zIndex = 1;");
  expect(normalizedJS).toContain("document.getElementById('game-container').appendChild(screenDiv);");
  expect(normalizedJS).toContain("document.getElementById('amos-screen').style.backgroundColor = colorMapping[8];");

  // Curs Off assertion
  expect(normalizedJS).toContain("document.getElementById('amos-screen').style.cursor = 'none';");

  // Text assertions (matching current translator output)
  expect(normalizedJS).toContain("const textDiv1010 = document.createElement('div');");
  expect(normalizedJS).toContain("textDiv1010.innerText = 'ReAnimate(d) Piano';");
  expect(normalizedJS).toContain("textDiv1010.id = 'textDiv' + '10' + '10';");
  expect(normalizedJS).toContain("textDiv1010.style.color = Ink;");
  expect(normalizedJS).toContain("textDiv1010.style.position = \"Relative\";");
  expect(normalizedJS).toContain("textDiv1010.style.zIndex = 99;");
  expect(normalizedJS).toContain("document.getElementById('amos-screen').appendChild(textDiv1010);");
});


