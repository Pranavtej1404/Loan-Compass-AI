// app/products/page.tsx (Server Component)

import ProductsClient from "./ProductsClient";

async function getProducts(queryString: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/products${queryString ? "?" + queryString : ""}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch {
    return { error: true, products: [] };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams; // unwrap the Promise

  const queryString = new URLSearchParams(params || {}).toString();
  const data = await getProducts(queryString);

  return <ProductsClient data={data} />;
}
  
