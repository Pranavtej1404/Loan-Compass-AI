"use client";

import { motion } from "framer-motion";
import { MessageSquare, Timer, FileCheck, BadgePercent, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAsk: (product: Product) => void;
  className?: string;
}

export default function ProductCard({ product, onAsk, className }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        `
        bg-white border rounded-3xl shadow-sm 
        p-6 flex flex-col justify-between gap-6
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        hover:border-blue-300
        transition-all duration-300
        
        /* Responsive Height */
        h-auto sm:h-[480px] 
        
        /* Smooth hover glow */
        hover:ring-1 hover:ring-blue-200
        
        `,
        className
      )}
    >
      {/* Top Icon */}
      <div className="w-full flex items-center justify-center">
        <motion.div
          whileHover={{ rotate: 8 }}
          className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner"
        >
          <BadgePercent size={28} />
        </motion.div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1 text-center">
        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.bank}</p>
      </div>

      {/* Loan Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs">APR</p>
          <p className="font-semibold text-gray-900">{product.rate_apr}%</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Min Income</p>
          <p className="font-semibold text-gray-900">₹{product.min_income.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Min Credit Score</p>
          <p className="font-semibold text-gray-900">{product.min_credit_score}+</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Tenure</p>
          <p className="font-semibold text-gray-900">
            {product.tenure_min_months}–{product.tenure_max_months} months
          </p>
        </div>
      </div>

          {/* Detail Box */}
          
      <div
      className="
        bg-gray-50 p-4 rounded-2xl border 
        space-y-3 text-sm text-gray-700
        max-h-[150px] overflow-y-auto relative
        
        /* Smooth scrolling */
        scroll-smooth
        
        /* Hide native scrollbar but keep scrollability */
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
        [&::-webkit-scrollbar-thumb]:from-blue-400
        [&::-webkit-scrollbar-thumb]:to-blue-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.2)]
        [&::-webkit-scrollbar-thumb]:transition-all
        
        /* Hover effect: bigger + brighter */
        hover:[&::-webkit-scrollbar-thumb]:from-blue-500
        hover:[&::-webkit-scrollbar-thumb]:to-blue-700
        hover:[&::-webkit-scrollbar-thumb]:w-2
      "
    >
      <p className="flex items-center gap-2 capitalize">
        <Timer size={16} className="text-blue-600" />
        {product.disbursal_speed} disbursal
      </p>
        
      <p className="flex items-center gap-2 capitalize">
        <FileCheck size={16} className="text-blue-600" />
        Docs: {product.docs_level}
      </p>
        
      {product.processing_fee_pct > 0 && (
        <p>
          Processing Fee: <span className="font-medium">{product.processing_fee_pct}%</span>
        </p>
      )}
    
      {product.prepayment_allowed && (
        <p className="flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle2 size={16} />
          Prepayment Allowed
        </p>
      )}
    
      {product.limited_offer && (
        <p className="text-red-600 font-medium flex items-center gap-2">
          🔥 Limited-time offer
        </p>
      )}
    </div>
    

      {/* Bottom Ask Button */}
      <motion.div whileTap={{ scale: 0.96 }}>
        <Button
          className="
            w-full mt-auto rounded-2xl py-2 
            flex items-center justify-center gap-2 
            text-base font-medium
          "
          onClick={() => onAsk(product)}
        >
          <MessageSquare size={18} />
          Ask
        </Button>
      </motion.div>
    </motion.div>
  );
}
