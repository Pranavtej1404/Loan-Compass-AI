// app/products/ProductsClient.tsx
"use client";

import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ChatSheet from "../components/ChatSheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";

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

  // Error state
  if (data.error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
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

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">All Loan Products</h1>
        <p className="text-sm text-muted-foreground">Showing {products.length} products</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <article
            key={p.id}
            aria-labelledby={`product-${p.id}`}
            className="
              bg-white border border-gray-100 rounded-2xl
              shadow-[0_6px_18px_rgba(16,24,40,0.04)]
              hover:shadow-[0_12px_30px_rgba(16,24,40,0.06)]
              transition-shadow duration-200
              p-5 flex flex-col gap-4
              min-h-[420px]
            "
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <ProductCard product={p} onAsk={handleAsk} />
          </article>
        ))}
      </div>

      {activeProduct && (
        <ChatSheet product={activeProduct} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}
