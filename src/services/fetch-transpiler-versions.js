const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchTranspilerVersions() {
  try {
    // Make the HTTP GET request
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/versions`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });

    // Handle HTTP errors (e.g., 404 or 500)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response.
    const data = await response.json();
    return data;
  } catch (error) {
    // Centralized error logging
    console.error("Failed to fetch API:", error);
    throw error;
  }
}
