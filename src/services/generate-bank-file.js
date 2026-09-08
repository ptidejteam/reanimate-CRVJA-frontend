const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Requests the backend to generate an AMOS .abk bank file and triggers browser download.
 *
 * @param {Object} bankCreator - Object containing sprites and palette arrays.
 * @param {string} [filename='AmosBank_test4.abk'] - The target filename to download.
 */
export async function generateAmosBankFile(bankCreator, filename = 'AmosBank_test4.abk') {
  try {
    const { sprites, palette } = bankCreator;

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/generate-bank-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sprites,
        palette,
        filename,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Create and trigger download link in browser
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();

    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Failed to generate bank file via API:', error);
    throw error;
  }
}
