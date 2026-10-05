import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BankEditor from '../src/app/components/bank/bank-editor';
import { parseBankFile } from '../src/services/parse-bank-file';
import { generateAmosBankFile } from '../src/services/generate-bank-file';

jest.mock('../src/services/parse-bank-file');
jest.mock('../src/services/generate-bank-file');
jest.mock('@uiw/react-color', () => ({
  Sketch: ({ onChange }) => (
    <button onClick={() => onChange({ hex: '#ff0000' })}>Choose red</button>
  ),
}));

const makeBank = (withSprite = false) => ({
  palette: Array.from({ length: 32 }, (_, index) => (index === 1 ? '#00aaaa' : '#000000')),
  sprites: withSprite
    ? [
        {
          width: 1,
          height: 16,
          depth: 4,
          hotspotX: 0,
          hotspotY: 0,
          planarGraphicData: Array(128).fill(0),
        },
      ]
    : [],
});

function Editor({ initialBank = makeBank() }) {
  const [bank, setBank] = useState(initialBank);
  return <BankEditor bankCreator={bank} setBankCreator={setBank} />;
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => jest.restoreAllMocks());

test('empty banks explain the next step and disable selection-dependent actions', () => {
  render(<Editor />);
  expect(screen.getByText('Load a bank or add a sprite to begin.')).toBeInTheDocument();
  for (const name of ['Duplicate', 'Delete Sprite', 'Clear Bank', 'Export .ABK']) {
    expect(screen.getByRole('button', { name })).toBeDisabled();
  }
  expect(screen.getByLabelText('Width (px)')).toBeDisabled();
  expect(screen.getByLabelText('Height (px)')).toBeDisabled();
  expect(
    screen.getByRole('group', { name: 'Palette colors' }).querySelectorAll('button'),
  ).toHaveLength(32);
  expect(screen.getByLabelText('Load sprite bank')).not.toHaveAttribute('multiple');
});

test('Save Bank includes current palette, painted pixels, and resized dimensions after reopening', () => {
  const bank = makeBank();
  const { unmount } = render(<Editor initialBank={bank} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Sprite' }));
  fireEvent.click(screen.getByRole('button', { name: 'Color 1, #00aaaa' }));
  fireEvent.click(screen.getByTitle('Pixel 0, 0'));
  fireEvent.change(screen.getByLabelText('Width (px)'), { target: { value: '32' } });
  fireEvent.change(screen.getByLabelText('Height (px)'), { target: { value: '24' } });
  fireEvent.click(screen.getByRole('button', { name: 'Edit Color' }));
  fireEvent.click(screen.getByRole('button', { name: 'Choose red' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Bank' }));
  expect(screen.getByRole('status')).toHaveTextContent('Bank saved locally.');
  const saved = JSON.parse(localStorage.getItem('bankCreator'));
  expect(saved.palette[1]).toBe('#ff0000');
  expect(saved.sprites[0]).toMatchObject({ width: 2, height: 24, depth: 4 });
  expect(saved.sprites[0].planarGraphicData[0]).toBe(128);
  unmount();
  render(<Editor initialBank={saved} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sprite 1, 32 by 24 pixels' }));
  expect(screen.getByTitle('Pixel 0, 0')).toHaveStyle({ backgroundColor: '#ff0000' });
});

test('palette edits preserve the committed bank until saving and Escape restores focus', () => {
  const bank = makeBank(true);
  render(<Editor initialBank={bank} />);
  const swatch = screen.getByRole('button', { name: 'Color 1, #00aaaa' });
  fireEvent.contextMenu(swatch);
  const dialog = screen.getByRole('dialog', { name: 'Edit Color 1' });
  expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Choose red' }));
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(swatch).toHaveFocus();
  expect(bank.palette[1]).toBe('#00aaaa');
  fireEvent.click(screen.getByRole('button', { name: 'Sprite 1, 16 by 16 pixels' }));
  fireEvent.click(screen.getByTitle('Pixel 0, 0'));
  expect(bank.sprites[0].planarGraphicData[0]).toBe(0);
});

test('duplication makes an independent sprite; deletion and clearing require confirmation', () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  render(<Editor initialBank={makeBank(true)} />);
  const first = screen.getByRole('button', { name: 'Sprite 1, 16 by 16 pixels' });
  fireEvent.contextMenu(first);
  expect(confirm).not.toHaveBeenCalled();
  fireEvent.click(first);
  fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
  fireEvent.click(screen.getByRole('button', { name: 'Color 1, #00aaaa' }));
  fireEvent.click(screen.getByTitle('Pixel 0, 0'));
  fireEvent.click(screen.getByRole('button', { name: 'Save Bank' }));
  const saved = JSON.parse(localStorage.getItem('bankCreator'));
  expect(saved.sprites[0].planarGraphicData[0]).toBe(0);
  expect(saved.sprites[1].planarGraphicData[0]).toBe(128);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Sprite' }));
  expect(screen.getByRole('button', { name: 'Sprite 2, 16 by 16 pixels' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear Bank' }));
  expect(screen.getByRole('button', { name: 'Sprite 2, 16 by 16 pixels' })).toBeInTheDocument();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Sprite' }));
  expect(
    screen.queryByRole('button', { name: 'Sprite 2, 16 by 16 pixels' }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete Sprite' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Clear Bank' }));
  expect(screen.getByText('Load a bank or add a sprite to begin.')).toBeInTheDocument();
});

test('loading disables competing actions and displays errors with a working retry', async () => {
  let rejectLoad;
  parseBankFile.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectLoad = reject;
      }),
  );
  render(<Editor />);
  const input = screen.getByLabelText('Load sprite bank');
  const file = new File(['bank'], 'example.abk');
  fireEvent.change(input, { target: { files: [file] } });
  expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save Bank' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add Sprite' })).toBeDisabled();
  await act(async () => rejectLoad(new Error('Server unavailable')));
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load bank: Server unavailable');
  parseBankFile.mockResolvedValueOnce(makeBank(true));
  fireEvent.change(input, { target: { files: [file] } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Loaded example.abk.'));
  expect(screen.getByRole('button', { name: 'Sprite 1, 16 by 16 pixels' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Load Bank' })).toBeEnabled();
});

test('export uses current edits, blocks repeat submissions, and reports failure and success', async () => {
  let rejectExport;
  generateAmosBankFile.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectExport = reject;
      }),
  );
  render(<Editor initialBank={makeBank(true)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sprite 1, 16 by 16 pixels' }));
  fireEvent.click(screen.getByRole('button', { name: 'Color 1, #00aaaa' }));
  fireEvent.click(screen.getByTitle('Pixel 0, 0'));
  fireEvent.click(screen.getByRole('button', { name: 'Export .ABK' }));
  expect(generateAmosBankFile.mock.calls[0][0].sprites[0].planarGraphicData[0]).toBe(128);
  expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled();
  await act(async () => rejectExport(new Error('Server unavailable')));
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to export bank: Server unavailable');
  generateAmosBankFile.mockResolvedValueOnce(undefined);
  fireEvent.click(screen.getByRole('button', { name: 'Export .ABK' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Bank exported.'));
});

test('local storage failures show an error instead of claiming the bank was saved', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full');
  });
  render(<Editor />);
  fireEvent.click(screen.getByRole('button', { name: 'Save Bank' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to save bank locally: Storage full');
});
