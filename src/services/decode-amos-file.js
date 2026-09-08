const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function decodeAmosFile(file) {
  if (!file) throw new Error('No AMOS file selected.');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/decode-amos`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Unable to decode AMOS file (HTTP ${response.status}).`);
  }
  if (typeof data.sourceCode !== 'string') {
    throw new Error('The AMOS decoder returned an invalid response.');
  }

  return data.sourceCode;
}
