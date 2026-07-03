import { parseBankFile } from "../src/utils/parse-amos-bank";

describe("parseBankFile", () => {
  test("fails when no file is provided", async () => {
    await expect(parseBankFile(null)).rejects.toThrow("No file was selected");
  });

  test("fails when file header is invalid", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4, 5, 6])], "invalid.abk");
    await expect(parseBankFile(file)).rejects.toThrow(
      "Invalid bank file format",
    );
  });

  test("fails when file is too small", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "small.abk");
    await expect(parseBankFile(file)).rejects.toThrow(
      "File is too small to contain a header",
    );
  });

  test("fails when file is truncated", async () => {
    const data = new Uint8Array([
      0x41,
      0x6d,
      0x53,
      0x70, // AmSp
      0x00,
      0x01, // 1 sprite expected
      0x00,
      0x01, // width=1
      0x00,
      0x08, // height=8
      0x00,
      0x04, // depth=4. Missing hotspot and graphic data.
    ]);
    const file = new File([data], "truncated.abk");
    await expect(parseBankFile(file)).rejects.toThrow(
      "Unexpected end of file while reading header",
    );
  });

  test("fails when dimensions are invalid or excessive", async () => {
    const data = new Uint8Array([
      0x41,
      0x6d,
      0x53,
      0x70, // AmSp
      0x00,
      0x01, // 1 sprite expected
      0xff,
      0xff, // width = 65535
      0x00,
      0x08, // height = 8
      0x00,
      0x04, // depth = 4
      0x00,
      0x00, // hotspotX = 0
      0x00,
      0x00, // hotspotY = 0
    ]);
    const file = new File([data], "excessive.abk");
    await expect(parseBankFile(file)).rejects.toThrow(
      "Invalid dimensions for sprite/icon 1",
    );
  });
});

import { translateAmos } from "./helpers/translate";

function translate(code) {
  const [lexErrs, parseErrs, normalizedJS] = translateAmos(code);
  expect(lexErrs.errors).toEqual([]);
  expect(parseErrs.errors).toEqual([]);
  return normalizedJS.replace(/\s+/g, " ").trim();
}

const vm = require("vm");
describe("Transpiler JS syntax validation", () => {
  test("generates syntactically valid JS", () => {
    const [lexErrs, parseErrs, js] = translateAmos("Cls 2");
    expect(lexErrs.errors).toEqual([]);
    expect(parseErrs.errors).toEqual([]);
    try {
      new vm.Script(js);
    } catch (err) {
      console.error("VM Syntax Error Stack:\n", err.stack);
      throw err;
    }
  });
});


