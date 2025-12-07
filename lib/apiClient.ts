// lib/apiClient.ts

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
