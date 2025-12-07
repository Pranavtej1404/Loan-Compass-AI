// app/products/ProductsClient.tsx
"use client";

import { useState } from "react";
import ProductCard from "../components/ProductCard";
import ChatSheet from "../components/ChatSheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

export function useAnonId() {
  useEffect(() => {
    if (!localStorage.getItem("anonId")) {
      localStorage.setItem("anonId", uuidv4());
    }
  }, []);

  return localStorage.getItem("anonId");
}
export default function ProductsClient({ data }: { data: { products: Product[]; error?: boolean } }) {
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  function handleAsk(product: Product) {
    setActiveProduct(product);
    setOpen(true);
  }

  // ❌ Error state
  if (data.error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Couldn't load products. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const products = data.products;

  // 🟡 Empty state
  if (!products || products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  // 🟢 Success
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">All Loan Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAsk={handleAsk} />
        ))}
      </div>

      {activeProduct && (
        <ChatSheet product={activeProduct} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}
