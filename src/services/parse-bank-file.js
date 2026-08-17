const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function parseBankFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file); // Append the actual File object

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/parse-bank-file`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to parse bank file via API:', error);
    throw error;
  }
}
