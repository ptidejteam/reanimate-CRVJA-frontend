export function generateAmosBankFile(bankCreator, filename = "AmosBank_test4.abk") {
  const { sprites, palette } = bankCreator;
  const identifier = "AmSp"; // 4-byte identifier for sprites

  // Create an array to hold the binary data
  let binaryData = [];

  // Add the 4-byte identifier
  for (let i = 0; i < identifier.length; i++) {
    binaryData.push(identifier.charCodeAt(i));
  }

  // Add the 2-byte number of sprites
  const spriteCount = sprites.length;
  binaryData.push((spriteCount >> 8) & 0xff); // High byte
  binaryData.push(spriteCount & 0xff); // Low byte
  // Add each sprite's data
  sprites.forEach((sprite) => {
    const { width, height, depth, hotspotX, hotspotY, planarGraphicData } =
      sprite;

    let object = [];
    // Width and height are each 2 bytes
    object.push((width >> 8) & 0xff);
    object.push(width & 0xff);
    object.push((height >> 8) & 0xff);
    object.push(height & 0xff);

    // Depth, hotspot X, and hotspot Y are each 2 bytes
    object.push((depth >> 8) & 0xff);
    object.push(depth & 0xff);
    object.push((hotspotX >> 8) & 0xff);
    object.push(hotspotX & 0xff);
    object.push((hotspotY >> 8) & 0xff);
    object.push(hotspotY & 0xff);
    if (Array.isArray(planarGraphicData)) {
      object.push(...planarGraphicData);
    } else {
      console.error("planarGraphicData is not an array", planarGraphicData);
    }

    binaryData.push(...object);
  });
  let newPalette = [...palette];
  function rgbTo16Bit(rgbColor) {
    // Extract the red, green, and blue components from the hex color
    const red = parseInt(rgbColor.slice(1, 3), 16) >> 4; // Red channel (top 4 bits)
    const green = parseInt(rgbColor.slice(3, 5), 16) >> 4; // Green channel (middle 4 bits)
    const blue = parseInt(rgbColor.slice(5, 7), 16) >> 4; // Blue channel (bottom 4 bits)

    // Combine red, green, and blue components into a 16-bit color value
    const color16Bit = (red << 8) | (green << 4) | blue;

    return color16Bit;
  }
  let binaryPalette = [];
  // Convert the palette into 16-bit color values and then add to binaryData
  newPalette.forEach((color) => {
    const rgb = rgbTo16Bit(color); // Convert to 16-bit color
    binaryData.push((rgb >> 8) & 0xff); // High byte
    binaryData.push(rgb & 0xff); // Low byte

    binaryPalette.push((rgb >> 8) & 0xff); // High byte
    binaryPalette.push(rgb & 0xff); // Low byte
  });

  console.log(binaryPalette);

  console.log(binaryData);
  const blob = new Blob([new Uint8Array(binaryData)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
}
