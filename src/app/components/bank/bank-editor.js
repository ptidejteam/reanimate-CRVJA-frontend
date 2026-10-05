'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sketch } from '@uiw/react-color';
import { generateAmosBankFile } from '@/src/services/generate-bank-file';
import { renderSpritePixels } from '@/src/utils/sprite-renderer';
import { parseBankFile } from '@/src/services/parse-bank-file';
import ActionButton from '@/src/app/components/ui/action-button';
import styles from './bank-editor.module.css';

export default function BankEditor({ bankCreator, setBankCreator }) {
  const [palette, setPalette] = useState(bankCreator.palette || Array(32).fill('#000000'));
  const [sprites, setSprites] = useState(bankCreator.sprites || []);
  const [spriteSelected, setSpriteSelected] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [operation, setOperation] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [pickerHeight, setPickerHeight] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);
  const pickerTriggerRef = useRef(null);
  const isBusy = operation !== null;
  const selectedSprite = spriteSelected !== null ? sprites[spriteSelected] : null;

  useEffect(() => {
    if (!showColorPicker) return;
    pickerRef.current?.querySelector('button')?.focus();
    const scrollArea = editorRef.current.parentElement;
    const updatePickerHeight = () => {
      const { paddingTop, paddingBottom } = window.getComputedStyle(scrollArea);
      // Leave room for the Workbench scrollbar and content padding.
      setPickerHeight(
        Math.max(
          80,
          scrollArea.clientHeight -
            (parseFloat(paddingTop) || 0) -
            (parseFloat(paddingBottom) || 0) -
            20,
        ),
      );
    };
    updatePickerHeight();
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePickerHeight) : null;
    observer?.observe(scrollArea);
    return () => {
      observer?.disconnect();
      pickerTriggerRef.current?.focus();
    };
  }, [showColorPicker]);

  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (bankCreator) {
      setPalette(bankCreator.palette || Array(32).fill('#000000'));
      const newSprites = bankCreator.sprites || [];
      setSprites(newSprites);
      setSpriteSelected((prev) => {
        if (prev !== null && prev < newSprites.length) {
          return prev;
        }
        return null;
      });
    }
  }, [bankCreator]);

  const handleParseBankFile = async (file) => {
    setOperation('load');
    setFeedback(null);
    try {
      const response = await parseBankFile(file);
      if (!Array.isArray(response?.sprites) || !Array.isArray(response?.palette)) {
        throw new Error('The file did not contain a sprite bank.');
      }
      setSpriteSelected(null);
      setShowColorPicker(false);
      setCurrentColorIndex(0);
      setBankCreator((prev) => ({
        ...prev,
        sprites: response.sprites,
        palette: response.palette,
      }));
      setFeedback({ type: 'success', text: `Loaded ${file.name}.` });
    } catch (error) {
      setFeedback({ type: 'error', text: `Unable to load bank: ${error.message}` });
    } finally {
      setOperation(null);
    }
  };

  const handlePixelPaint = (index) => {
    if (selectedSprite && !isBusy) {
      const spriteToPaint = {
        ...selectedSprite,
        planarGraphicData: [...selectedSprite.planarGraphicData],
      };
      const actualWidth = selectedSprite.width * 16;
      const bytesPerRow = Math.ceil(actualWidth / 8);

      const x = index % actualWidth;
      const y = Math.floor(index / actualWidth);

      for (let plane = 0; plane < selectedSprite.depth; plane++) {
        const bit = (currentColorIndex >> plane) & 1;
        const byteIndex =
          y * bytesPerRow + plane * (selectedSprite.height * bytesPerRow) + Math.floor(x / 8);
        const bitPos = 7 - (x % 8);

        if (bit) {
          spriteToPaint.planarGraphicData[byteIndex] |= 1 << bitPos;
        } else {
          spriteToPaint.planarGraphicData[byteIndex] &= ~(1 << bitPos);
        }
      }

      const updatedSprites = sprites.map((sprite, i) =>
        i === spriteSelected ? spriteToPaint : sprite,
      );
      setSprites(updatedSprites);
      setFeedback(null);
    }
  };

  const openColorPicker = (index, trigger) => {
    pickerTriggerRef.current = trigger;
    setCurrentColorIndex(index);
    setSelectedColorIndex(index);
    setShowColorPicker(true);
  };

  const handleColorChange = (color) => {
    const newPalette = [...palette];
    newPalette[selectedColorIndex] = color.hex;
    setPalette(newPalette);
    setFeedback(null);
  };

  const addNewSprite = () => {
    const newSprite = {
      width: 1,
      height: 16,
      depth: 4, // Default depth (4 color planes for 16 colors)
      hotspotX: 0,
      hotspotY: 0,
      planarGraphicData: Array(128).fill(0), // Initialize planarGraphicData with zeros for 16x16 sprite
    };
    const updatedSprites = [...sprites, newSprite];
    setSprites(updatedSprites);
    setBankCreator({ ...bankCreator, sprites: updatedSprites, palette });
    setSpriteSelected(updatedSprites.length - 1);
    setFeedback(null);
  };

  const updateSpriteSize = (dimension, value) => {
    if (spriteSelected !== null) {
      const newSize = Number(value);
      const selectedSprite = sprites[spriteSelected];

      if (Number.isInteger(newSize) && newSize > 0) {
        const newSprite = {
          ...selectedSprite,
          [dimension]: newSize,
        };

        const oldWidthPixels = selectedSprite.width * 16;
        const newWidthPixels = newSprite.width * 16;
        const oldHeight = selectedSprite.height;
        const newHeight = newSprite.height;
        const depth = selectedSprite.depth;

        const newPlanarData = Array(newSprite.width * newHeight * depth * 2).fill(0);

        const oldBytesPerRow = Math.ceil(oldWidthPixels / 8);
        const newBytesPerRow = Math.ceil(newWidthPixels / 8);

        for (let plane = 0; plane < depth; plane++) {
          for (let y = 0; y < Math.min(oldHeight, newHeight); y++) {
            for (let xBytes = 0; xBytes < Math.min(oldBytesPerRow, newBytesPerRow); xBytes++) {
              const oldByteIndex =
                y * oldBytesPerRow + plane * (oldHeight * oldBytesPerRow) + xBytes;
              const newByteIndex =
                y * newBytesPerRow + plane * (newHeight * newBytesPerRow) + xBytes;
              newPlanarData[newByteIndex] = selectedSprite.planarGraphicData[oldByteIndex] || 0;
            }
          }
        }
        newSprite.planarGraphicData = newPlanarData;

        const updatedSprites = sprites.map((sprite, i) =>
          i === spriteSelected ? newSprite : sprite,
        );
        setSprites(updatedSprites);
        setFeedback(null);
      }
    }
  };

  const duplicateSprite = () => {
    if (spriteSelected !== null) {
      const original = sprites[spriteSelected];

      // Deep copy of planarGraphicData
      const copiedPlanarData = [...original.planarGraphicData];

      const duplicatedSprite = {
        ...original,
        planarGraphicData: copiedPlanarData,
      };

      const updatedSprites = [...sprites, duplicatedSprite];
      setSprites(updatedSprites);
      setBankCreator({ ...bankCreator, sprites: updatedSprites, palette });
      setSpriteSelected(updatedSprites.length - 1);
      setFeedback(null);
    }
  };

  const deleteSprite = () => {
    if (!selectedSprite || !window.confirm(`Delete Sprite ${spriteSelected + 1}?`)) return;
    const updatedSprites = sprites.filter((_, index) => index !== spriteSelected);
    setSpriteSelected(null);
    setSprites(updatedSprites);
    setBankCreator({ ...bankCreator, sprites: updatedSprites, palette });
    setFeedback({ type: 'success', text: 'Sprite deleted.' });
  };

  const clearBank = () => {
    if (sprites.length && !window.confirm('Clear this bank and its palette?')) return;
    const emptyBank = { sprites: [], palette: Array(32).fill('#000000') };
    setSpriteSelected(null);
    setCurrentColorIndex(0);
    setShowColorPicker(false);
    setSprites(emptyBank.sprites);
    setPalette(emptyBank.palette);
    setBankCreator(emptyBank);
    setFeedback({ type: 'success', text: 'Bank cleared.' });
  };

  // Save bank data to local storage
  const saveBankToLocalStorage = () => {
    try {
      const currentBank = { ...bankCreator, sprites, palette };
      localStorage.setItem('bankCreator', JSON.stringify(currentBank));
      setBankCreator(currentBank);
      setFeedback({ type: 'success', text: 'Bank saved locally.' });
    } catch (error) {
      setFeedback({ type: 'error', text: `Unable to save bank locally: ${error.message}` });
    }
  };

  const exportBank = async () => {
    setOperation('export');
    setFeedback(null);
    try {
      const currentBank = { ...bankCreator, sprites, palette };
      setBankCreator(currentBank);
      await generateAmosBankFile(currentBank);
      setFeedback({ type: 'success', text: 'Bank exported. Your .ABK download is ready.' });
    } catch (error) {
      setFeedback({ type: 'error', text: `Unable to export bank: ${error.message}` });
    } finally {
      setOperation(null);
    }
  };

  const handlePickerKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setShowColorPicker(false);
    } else if (event.key === 'Tab') {
      const controls = Array.from(
        pickerRef.current.querySelectorAll('button, input, [tabindex="0"]'),
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div ref={editorRef} className={styles.editor}>
      <div className={styles.surface} inert={showColorPicker ? '' : undefined}>
        <div className={styles.toolbar} role="toolbar" aria-label="Bank actions">
          <ActionButton
            icon="/icons/upload-button.png"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {operation === 'load' ? 'Loading…' : 'Load Bank'}
          </ActionButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".abk"
            aria-label="Load sprite bank"
            className={styles.fileInput}
            disabled={isBusy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file && !isBusy) await handleParseBankFile(file);
            }}
          />
          <ActionButton
            icon="/icons/file-button.png"
            disabled={isBusy}
            onClick={saveBankToLocalStorage}
          >
            Save Bank
          </ActionButton>
          <ActionButton
            icon="/icons/download-button.png"
            disabled={isBusy || !sprites.length}
            onClick={exportBank}
          >
            {operation === 'export' ? 'Exporting…' : 'Export .ABK'}
          </ActionButton>
          <span className={styles.bankCount}>
            {sprites.length} {sprites.length === 1 ? 'sprite' : 'sprites'}
          </span>
        </div>
        <div
          className={`${styles.feedback} ${feedback?.type === 'error' ? styles.error : ''}`}
          role={feedback?.type === 'error' ? 'alert' : 'status'}
          aria-live={feedback?.type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          {feedback?.text ||
            (isBusy
              ? 'Please wait…'
              : 'Save Bank keeps a local copy. Export downloads an .ABK file.')}
        </div>

        <div className={styles.layout}>
          <section className={styles.panel} aria-labelledby="palette-heading">
            <div className={styles.panelHeader}>
              <h2 id="palette-heading">Palette</h2>
              <span>{palette.length} colors</span>
            </div>
            <div className={`${styles.panelBody} ${styles.paletteBody}`}>
              <div className={styles.currentColor}>
                <span
                  aria-hidden="true"
                  className={`${styles.colorSample} ${currentColorIndex === 0 ? styles.checkerboard : ''}`}
                  style={
                    currentColorIndex === 0
                      ? undefined
                      : { backgroundColor: palette[currentColorIndex] }
                  }
                />
                <div>
                  <strong>Color {currentColorIndex}</strong>
                  <span className={styles.colorValue}>{palette[currentColorIndex]}</span>
                </div>
              </div>
              <div className={styles.paletteGrid} role="group" aria-label="Palette colors">
                {palette.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.swatchButton} ${currentColorIndex === index ? styles.selected : ''}`}
                    aria-label={`Color ${index}, ${color}${index === 0 ? ', transparent' : ''}`}
                    aria-pressed={currentColorIndex === index}
                    title={`Color ${index}: ${color}${index === 0 ? ' (transparent)' : ''}`}
                    disabled={isBusy}
                    onClick={() => setCurrentColorIndex(index)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      if (!isBusy) openColorPicker(index, event.currentTarget);
                    }}
                  >
                    <span
                      className={`${styles.swatch} ${index === 0 ? styles.checkerboard : ''}`}
                      style={index === 0 ? undefined : { backgroundColor: color }}
                      aria-hidden="true"
                    >
                      {index === 0 && <span className={styles.transparentMark}>T</span>}
                    </span>
                    <span className={styles.swatchIndex}>{index}</span>
                  </button>
                ))}
              </div>
              <ActionButton
                disabled={isBusy}
                onClick={(event) => openColorPicker(currentColorIndex, event.currentTarget)}
              >
                Edit Color
              </ActionButton>
              <p className={styles.hint}>0 = transparent. Right-click a color to edit.</p>
            </div>
          </section>

          <section
            className={`${styles.panel} ${styles.pixelPanel}`}
            aria-labelledby="pixel-heading"
          >
            <div className={styles.panelHeader}>
              <h2 id="pixel-heading">Pixel Editor</h2>
              <span>{selectedSprite ? `Sprite ${spriteSelected + 1}` : 'No selection'}</span>
            </div>
            <div className={styles.dimensions}>
              <div className={styles.field}>
                <label htmlFor="sprite-width">Width (px)</label>
                <input
                  id="sprite-width"
                  type="number"
                  step="16"
                  min="16"
                  disabled={!selectedSprite || isBusy}
                  value={selectedSprite ? selectedSprite.width * 16 : ''}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (value >= 16 && value % 16 === 0) updateSpriteSize('width', value / 16);
                  }}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="sprite-height">Height (px)</label>
                <input
                  id="sprite-height"
                  type="number"
                  min="1"
                  step="1"
                  disabled={!selectedSprite || isBusy}
                  value={selectedSprite ? selectedSprite.height : ''}
                  onChange={(event) => updateSpriteSize('height', event.target.value)}
                />
              </div>
            </div>
            <div className={styles.canvasViewport} tabIndex={0} aria-label="Pixel workspace">
              {selectedSprite ? (
                <div
                  className={styles.pixelGrid}
                  role="group"
                  aria-label={`Sprite ${spriteSelected + 1} pixel canvas`}
                  style={{ gridTemplateColumns: `repeat(${selectedSprite.width * 16}, 20px)` }}
                >
                  {renderSpritePixels(
                    selectedSprite.planarGraphicData,
                    selectedSprite.width * 16,
                    selectedSprite.height,
                    selectedSprite.depth,
                    palette,
                  ).map((color, index) => (
                    <div
                      key={index}
                      className={styles.pixel}
                      style={{ backgroundColor: color }}
                      title={`Pixel ${index % (selectedSprite.width * 16)}, ${Math.floor(index / (selectedSprite.width * 16))}`}
                      onClick={() => handlePixelPaint(index)}
                      onMouseDown={(event) => {
                        if (event.button !== 0 || isBusy) return;
                        event.preventDefault();
                        setIsMouseDown(true);
                        handlePixelPaint(index);
                      }}
                      onMouseEnter={() => {
                        if (isMouseDown) handlePixelPaint(index);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <img src="/icons/sprite.png" alt="" width="48" height="48" />
                  <p>
                    {sprites.length
                      ? 'Select a sprite to edit its pixels.'
                      : 'Load a bank or add a sprite to begin.'}
                  </p>
                </div>
              )}
            </div>
            <div className={styles.canvasFooter}>
              {selectedSprite
                ? 'Click or drag to paint. Save Bank keeps your edits.'
                : 'Choose a color from the palette to paint.'}
            </div>
          </section>

          <section
            className={`${styles.panel} ${styles.spritesPanel}`}
            aria-labelledby="sprites-heading"
          >
            <div className={styles.panelHeader}>
              <h2 id="sprites-heading">Sprites</h2>
              <span>{sprites.length}</span>
            </div>
            <div className={styles.spriteActions}>
              <ActionButton disabled={isBusy} onClick={addNewSprite}>
                Add Sprite
              </ActionButton>
              <ActionButton disabled={!selectedSprite || isBusy} onClick={duplicateSprite}>
                Duplicate
              </ActionButton>
            </div>
            <div
              className={`${styles.panelBody} ${styles.spriteList}`}
              role="group"
              aria-label="Bank sprites"
            >
              {!sprites.length && <p className={styles.hint}>Your sprites will appear here.</p>}
              {sprites.map((sprite, index) => {
                const width = sprite.width * 16;
                const scale = Math.min(80 / width, 64 / sprite.height);
                const pixels = renderSpritePixels(
                  sprite.planarGraphicData,
                  width,
                  sprite.height,
                  sprite.depth,
                  palette,
                );
                return (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.thumbnail} ${spriteSelected === index ? styles.selected : ''}`}
                    aria-label={`Sprite ${index + 1}, ${width} by ${sprite.height} pixels`}
                    aria-pressed={spriteSelected === index}
                    disabled={isBusy}
                    onClick={() => setSpriteSelected(index)}
                  >
                    <span
                      className={`${styles.previewStage} ${styles.checkerboard}`}
                      aria-hidden="true"
                    >
                      <span
                        className={styles.thumbnailPixels}
                        style={{
                          width: width * scale,
                          height: sprite.height * scale,
                          gridTemplateColumns: `repeat(${width}, 1fr)`,
                          gridTemplateRows: `repeat(${sprite.height}, 1fr)`,
                        }}
                      >
                        {pixels.map((color, pixelIndex) => (
                          <span
                            key={pixelIndex}
                            style={{
                              backgroundColor: color === palette[0] ? 'transparent' : color,
                            }}
                          />
                        ))}
                      </span>
                    </span>
                    <span className={styles.thumbnailName}>Sprite {index + 1}</span>
                    <span className={styles.thumbnailSize}>
                      {width} × {sprite.height}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.dangerActions}>
              <ActionButton disabled={!selectedSprite || isBusy} onClick={deleteSprite}>
                Delete Sprite
              </ActionButton>
              <ActionButton disabled={!sprites.length || isBusy} onClick={clearBank}>
                Clear Bank
              </ActionButton>
            </div>
          </section>
        </div>
      </div>

      {showColorPicker && (
        <div className={styles.pickerOverlay} style={{ height: pickerHeight ?? undefined }}>
          <div
            ref={pickerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="color-picker-heading"
            className={styles.picker}
            onKeyDown={handlePickerKeyDown}
          >
            <div className={styles.pickerHeader}>
              <h2 id="color-picker-heading">Edit Color {selectedColorIndex}</h2>
              <ActionButton onClick={() => setShowColorPicker(false)}>Close</ActionButton>
            </div>
            <Sketch color={palette[selectedColorIndex]} onChange={handleColorChange} />
            <p className={styles.hint}>Changes update the palette. Save Bank to keep them.</p>
          </div>
        </div>
      )}
    </div>
  );
}
