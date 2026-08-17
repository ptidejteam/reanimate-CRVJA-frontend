const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function parseBankFileAPI(file) {
  try {
    const formData = new FormData();
    formData.append('file', file); // Append the actual File object

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/parse-bank-file`, {
      method: "POST",
      body: formData,
      // Content-Type seted by browser (FormData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch API:", error);
    throw error;
  }
}