"use client";

import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import ChatSheet from "./components/ChatSheet";
import { Product } from "@/lib/schemas";
import AuthModal from "./components/AuthModel";
import { supabaseBrowser } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

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

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthOpen(!session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  function handleAsk(product: Product) {
    setActiveProduct(product);
    setOpen(true);
  }

  return (
    <div className="space-y-10 animate-fade-up">

      <div className="animate-fade-up">
        <ProductCard product={bestMatch} onAsk={handleAsk} />
      </div>

      <h2 className="text-2xl font-semibold">Top Matches</h2>

      <div className="
        grid gap-6 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        auto-rows-fr
      ">
        {products.map((p, i) => (
          <div 
            key={p.id} 
            className="
              bg-white border rounded-3xl 
              shadow-[0_4px_20px_rgba(0,0,0,0.05)]
              hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]
              transition-all p-6 flex flex-col 
              justify-between gap-5
              h-[540px]                 // ← ADD FIXED HEIGHT
            "
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ProductCard product={p} onAsk={handleAsk} />
          </div>
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
