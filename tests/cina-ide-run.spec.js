import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CinaIDE from '../src/app/components/cina/cina-ide';
import { transpile } from '../src/services/transpile';

jest.mock('../src/services/transpile');
// The side menu fetches the examples on mount; the Run and Stop buttons don't need it.
jest.mock('../src/app/components/cina/side-navigation', () => () => null);

const program = 'Screen Open 0,640,256,16,Lowres';

// jsdom has no ResizeObserver; the code editor uses it to keep its line numbers in sync.
global.ResizeObserver = class {
  observe() {}
  disconnect() {}
};

beforeEach(() => {
  transpile.mockResolvedValue({
    data: {
      lexicalErrors: { errors: [] },
      syntaxErrors: { errors: [] },
      translatedCode: 'const PROGRAM = 1;',
    },
  });
});

function renderIDE() {
  render(<CinaIDE availableTranspilerVersions={['2.0']} />);
  return {
    run: screen.getByRole('button', { name: 'Run Code' }),
    stop: screen.getByRole('button', { name: 'Stop' }),
    gameContainer: () => document.getElementById('game-container'),
    programFrame: () => document.querySelector('#game-container iframe'),
  };
}

test('Stop is disabled before anything runs', () => {
  const { stop, programFrame } = renderIDE();
  expect(stop).toBeDisabled();
  expect(programFrame()).toBeNull();
});

test('Run Code restarts an unchanged program on every click', async () => {
  const { run, programFrame } = renderIDE();

  fireEvent.click(run);
  await waitFor(() => expect(programFrame()).not.toBeNull());
  const firstRun = programFrame();

  fireEvent.click(run);
  await waitFor(() => expect(programFrame()).not.toBe(firstRun));
  expect(programFrame()).not.toBeNull();
  expect(document.querySelectorAll('#game-container iframe')).toHaveLength(1);
  expect(transpile).toHaveBeenCalledTimes(2);
});

test('Stop clears the Program Screen until the next run', async () => {
  const { run, stop, gameContainer, programFrame } = renderIDE();

  fireEvent.click(run);
  await waitFor(() => expect(stop).toBeEnabled());
  expect(programFrame()).not.toBeNull();

  fireEvent.click(stop);
  expect(programFrame()).toBeNull();
  expect(gameContainer()).toBeEmptyDOMElement();
  expect(stop).toBeDisabled();

  fireEvent.click(run);
  await waitFor(() => expect(programFrame()).not.toBeNull());
  expect(stop).toBeEnabled();
});

test('sends the editor code and the selected version to the transpiler', async () => {
  const { run } = renderIDE();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: program } });
  fireEvent.click(run);
  await waitFor(() => expect(transpile).toHaveBeenCalledWith({ code: program, version: '2.0' }));
});
