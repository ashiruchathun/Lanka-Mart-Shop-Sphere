const API_URL = "http://localhost:5000/api/products";

export async function getProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to retrieve products from the server.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Unable to retrieve products.");
  }

  return result.data;
}