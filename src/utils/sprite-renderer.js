export function renderSpritePixels(
  planarGraphicData,
  width,
  height,
  depth,
  palette
) {
  const pixels = [];
  const bytesPerRow = width / 8;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let colorIndex = 0;

      // Build colorIndex by combining bits across planes
      for (let plane = 0; plane < depth; plane++) {
        const byteIndex =
          y * bytesPerRow +
          plane * (height * bytesPerRow) +
          Math.floor(x / 8);
        const bitPos = 7 - (x % 8);
        const bit = (planarGraphicData[byteIndex] >> bitPos) & 1;

        colorIndex |= bit << plane;
      }

      const hexColor = palette[colorIndex];
      pixels.push(hexColor);
    }
  }
  return pixels;
}
