const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result = await response.json();

  return result.data;
}

export async function getProductBySlug(slug) {
  const response = await fetch(`${API_URL}/products/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const result = await response.json();

  return result.data;
}

export async function getRelatedProducts(slug) {
  const response = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}/related`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch related products");
  }

  const result = await response.json();

  return result.data ?? [];
}
