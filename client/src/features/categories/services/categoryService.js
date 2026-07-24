const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const result = await response.json();

  return result.data;
}
