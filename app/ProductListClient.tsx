'use client';

import { useState } from "react";
import ProductCard from "./components/ProductCard";
import ChatSheet from "./components/ChatSheet";
import { Product } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import AuthModal from "./components/AuthModel";
import { supabaseBrowser } from "@/lib/supabase/client";

export function useAnonId() {
  useEffect(() => {
    if (!localStorage.getItem("anonId")) {
      localStorage.setItem("anonId", uuidv4());
    }
  }, []);

  return localStorage.getItem("anonId");
}
export default function ProductListClient({ products, bestMatch }: {
  products: Product[];
  bestMatch: Product;
}) {
  const [session, setSession] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) setAuthOpen(true);
      setSession(data.session);
    };
    checkSession();
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthOpen(!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function handleAsk(product: Product) {
    console.log("ASK CLICKED!", product);
    setActiveProduct(product);
    setOpen(true);
  }

  return (
    <div className="space-y-8">
      <ProductCard product={bestMatch} onAsk={handleAsk} />
    
      <h2 className="text-2xl font-semibold">Top Matches</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAsk={handleAsk} />
        ))}
      </div>

      {activeProduct && (
        <ChatSheet
          product={activeProduct}
          open={open}
          onOpenChange={setOpen}
        />
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        
    </div>
  );
}
