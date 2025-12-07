import { Product } from "@/lib/schemas";
import ProductListClient from "./ProductListClient";
import { apiRequest } from "@/lib/apiClient";
import userData from "@/mock/userContext.json";
import { getTopMatches } from "@/lib/matching";

async function fetchProducts() {
  const res = await apiRequest("/api/products");
  return res.products;
}

export default async function DashboardPage() {
  const user = userData;
  const products = await fetchProducts();
  const top5 = getTopMatches(products, user, 5);

  return (
    <ProductListClient
      products={top5}
      bestMatch={top5[0]}
    />
  );
}
