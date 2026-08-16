import { translateAmos } from '../helpers/translate';

function translate(code) {
  const [lexErrs, parseErrs, normalizedJS] = translateAmos(code);
  expect(lexErrs.errors).toEqual([]);
  expect(parseErrs.errors).toEqual([]);
  return normalizedJS.replace(/\s+/g, ' ').trim();
}

test('procedures', () => {
  const amosBasicCode = `
  Procedure P_DRAWKEYS[PRESSEDKEYNUMBER]
  End Proc
    `;

  const normalizedJS = translate(amosBasicCode);

  const expectedJsCode = `let lastTimeP_DRAWKEYS = 0; 
  let timeoutIdP_DRAWKEYS = null;
  function P_DRAWKEYS(PRESSEDKEYNUMBER) {
    const currentTime = Date.now();
    const timeSinceLastCall = currentTime - lastTimeP_DRAWKEYS;
    if (timeSinceLastCall < 16) {
      if (timeoutIdP_DRAWKEYS) {
        clearTimeout(timeoutIdP_DRAWKEYS);
      }
      timeoutIdP_DRAWKEYS = setTimeout(() => { P_DRAWKEYS(PRESSEDKEYNUMBER); }, 100 - timeSinceLastCall);
      return;
    }
    lastTimeP_DRAWKEYS = currentTime;
    timeoutIdP_DRAWKEYS = null; 
`;

  const normalizedExpectedJsCode = expectedJsCode.replace(/\s+/g, ' ').trim();

  expect(normalizedJS).toContain(normalizedExpectedJsCode);
});

test('procedure calls translation with and without parameters', () => {
  const amosBasicCode = `
  Procedure HELLO
    Text 10,10,"Hello World"
  End Proc
  
  Procedure TWINS[A,B]
    Text A,B,"Twins"
  End Proc
  
  HELLO
  TWINS[6,9]
  `;

  const normalizedJS = translate(amosBasicCode);

  // Assert that HELLO was called
  expect(normalizedJS).toContain('HELLO();');

  // Assert that TWINS was called with arguments 6 and 9
  expect(normalizedJS).toContain('TWINS(6, 9);');
});
