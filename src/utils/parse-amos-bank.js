export async function parseBankFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file was selected"));
      return;
    }
    const reader = new FileReader();

    reader.onload = function (e) {
      const arrayBuffer = e.target.result; // The result is now an ArrayBuffer
      const buffer = new Uint8Array(arrayBuffer); // Convert to Uint8Array for easier byte manipulation
      
      if (buffer.length < 6) {
        reject(new Error("Invalid bank file: File is too small to contain a header."));
        return;
      }

      const header = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3]);
      if (header !== "AmSp" && header !== "AmIc") {
        reject(new Error(`Invalid bank file format: "${header}". Expected a Sprite bank (AmSp) or Icon bank (AmIc).`));
        return;
      }

      let offset = 6; // Adjust the starting offset as per the file format
      const numberExpected = (buffer[4] << 8) | buffer[5]; // Check this is correct

      let objectsArray = [];

      for (let i = 0; i < numberExpected; i++) {
        if (offset + 10 > buffer.length) {
          reject(new Error(`Corrupted bank file: Unexpected end of file while reading header for sprite/icon ${i + 1}.`));
          return;
        }

        const width = (buffer[offset] << 8) | buffer[offset + 1];
        const height = (buffer[offset + 2] << 8) | buffer[offset + 3];
        const depth = (buffer[offset + 4] << 8) | buffer[offset + 5];
        const hotspotX = (buffer[offset + 6] << 8) | buffer[offset + 7];
        const hotspotY = (buffer[offset + 8] << 8) | buffer[offset + 9];

        // Sanity check dimensions to prevent malicious/corrupted files allocating too much memory
        if (width < 0 || height < 0 || depth < 0 || depth > 8 || width > 1000 || height > 1000) {
          reject(new Error(`Corrupted bank file: Invalid dimensions for sprite/icon ${i + 1} (width: ${width}, height: ${height}, depth: ${depth}).`));
          return;
        }

        const dataSize = width * 2 * height * depth; // Ensure this calculation is correct

        if (offset + 10 + dataSize > buffer.length) {
          reject(new Error(`Corrupted bank file: Sprite/icon ${i + 1} data extends beyond the file boundary (needs ${dataSize} bytes, but only ${buffer.length - offset - 10} bytes remain).`));
          return;
        }

        const planarGraphicData = [];
        for (let j = 0; j < dataSize; j++) {
          planarGraphicData.push(buffer[offset + 10 + j]);
        }

        const objectBuilder = {
          width,
          height,
          depth,
          hotspotX,
          hotspotY,
          planarGraphicData,
        };

        objectsArray.push(objectBuilder);
        offset += 10 + dataSize;
      }

      if (offset + 64 > buffer.length) {
        reject(new Error(`Corrupted bank file: Unexpected end of file while reading color palette (needs 64 bytes, but only ${buffer.length - offset} bytes remain).`));
        return;
      }

      // Initialize colorPalette to hold 32 colors (64 bytes in total)
      let colorPalette = [];

      // Loop through each pair of bytes in the color palette section (32 colors x 2 bytes)
      for (let k = offset; k < offset + 64; k += 2) {
        const byte1 = buffer[k];
        const byte2 = buffer[k + 1];

        const color1 = (byte1 << 8) | byte2;

        // Extract the red, green, and blue components (4 bits each)
        const red = (color1 >> 8) & 0xf;
        const green = (color1 >> 4) & 0xf;
        const blue = color1 & 0xf;

        // Convert 4-bit values (0-15) to 8-bit values (0-255) by multiplying by 17
        const red8 = (red * 17).toString(16).padStart(2, "0");
        const green8 = (green * 17).toString(16).padStart(2, "0");
        const blue8 = (blue * 17).toString(16).padStart(2, "0");

        // Format as HTML color code #RRGGBB
        const color = "#" + red8 + green8 + blue8;
        colorPalette.push(color.toUpperCase());
      }
      
      resolve({ sprites: objectsArray, palette: colorPalette });
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file); // Use readAsArrayBuffer for binary data
  });
}
