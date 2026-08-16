import antlr4 from 'antlr4';
import AmosToJavaScriptTranslator from '@/src/transpiler/AmosTranspiler';
import AMOSParser from '@/src/grammar/generated/AMOSParser';
import AMOSLexer from '@/src/grammar/generated/AMOSLexer';
import CollectingErrorListener from '@/src/transpiler/ErrorListener';

/**
 * Helper to translate AMOS BASIC code into JavaScript.
 * @param {string} amosBasicCode
 * @returns {string}
 */
export function translateAmos(amosBasicCode) {
  const chars = new antlr4.InputStream(amosBasicCode);
  const lexer = new AMOSLexer(chars);

  const lexErr = new CollectingErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexErr);

  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new AMOSParser(tokens);

  const parseErr = new CollectingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parseErr);

  const tree = parser.program();

  const translator = new AmosToJavaScriptTranslator();
  const walker = new antlr4.tree.ParseTreeWalker();
  walker.walk(translator, tree);

  const translatedJS = translator.getJavaScript();
  return [lexErr, parseErr, translatedJS];
}
