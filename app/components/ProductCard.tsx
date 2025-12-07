// src/components/ProductCard.tsx
"use client";

import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/schemas";
import { on } from "events";

type ProductCardProps = {
  product: Product;
  onAsk?: (product: Product) => void; 
};
export default function ProductCard({ product,onAsk }:ProductCardProps) {
  return (
    <article
      className="rounded-xl shadow-sm border bg-white focus-within:ring-2 focus-within:ring-primary/70 focus-within:outline-none"
      aria-label={`Loan product: ${product.name}`}
    >
      <Card>

        <CardHeader>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-sm text-muted-foreground">{product.bank}</p>
        </CardHeader>

        <CardContent className="space-y-2">

          <p className="text-sm">
            <span className="font-medium">Loan Type:</span> {product.loan_type}
          </p>

          <p className="text-sm">
            <span className="font-medium">APR:</span> {product.rate_apr}%
          </p>

          <p className="text-sm">
            <span className="font-medium">Min Income:</span> ₹{product.min_income}
          </p>

          <p className="text-sm">
            <span className="font-medium">Credit Score:</span> {product.min_credit_score}+
          </p>

          {/* Badges */}
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">{product.disbursal_speed}</Badge>
            <Badge variant="outline">{product.docs_level}</Badge>
            {product.limited_offer && <Badge className="bg-red-500 text-white">Limited</Badge>}
          </div>

          <p className="text-sm text-muted-foreground mt-3">{product.summary}</p>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full focus:ring-2 focus:ring-primary focus-visible:outline-none"
            aria-label={`Ask about ${product.name} from ${product.bank}`}
            onClick={()=>{onAsk?.(product) }}
          >
            Ask About Product
          </Button>
        </CardFooter>

      </Card>
    </article>
  );
}
