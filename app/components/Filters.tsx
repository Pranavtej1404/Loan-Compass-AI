"use client";

import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Filters({ searchParams }: { searchParams: any }) {
  const router = useRouter();

  const [bank, setBank] = useState(searchParams.bank || "");
  const [aprMin, setAprMin] = useState(searchParams.aprMin || "");
  const [aprMax, setAprMax] = useState(searchParams.aprMax || "");
  const [minIncome, setMinIncome] = useState(searchParams.minIncome || "");
  const [minCreditScore, setMinCreditScore] = useState(
    searchParams.minCreditScore || ""
  );
  const [loanType, setLoanType] = useState(searchParams.type || "");

  const debouncedBank = useDebounce(bank, 400);

  useEffect(() => {
  const hasFilters =
    bank || aprMin || aprMax || minIncome || minCreditScore || loanType;

  if (!hasFilters) return; // prevent redirect on mount

  const params = new URLSearchParams();

  if (bank) params.set("bank", bank);
  if (aprMin) params.set("aprMin", aprMin);
  if (aprMax) params.set("aprMax", aprMax);
  if (minIncome) params.set("minIncome", minIncome);
  if (minCreditScore) params.set("minCreditScore", minCreditScore);
  if (loanType) params.set("type", loanType);

  router.push(`/products?${params.toString()}`);
}, [debouncedBank, aprMin, aprMax, minIncome, minCreditScore, loanType]);


  const clearFilters = () => {
    setBank("");
    setAprMin("");
    setAprMax("");
    setMinIncome("");
    setMinCreditScore("");
    setLoanType("");
    router.push("/products");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filters</Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-4">
        <h4 className="text-sm font-semibold mb-2">Filters</h4>

        {/* Bank Filter */}
        <div className="space-y-2 mb-3">
          <Label>Bank Name</Label>
          <Input
            placeholder="Search bank..."
            value={bank}
            onChange={(e) => setBank(e.target.value)}
          />
        </div>

        {/* APR Min */}
        <div className="space-y-2 mb-3">
          <Label>APR (Min)</Label>
          <Input
            type="number"
            placeholder="e.g. 5"
            value={aprMin}
            onChange={(e) => setAprMin(e.target.value)}
          />
        </div>

        {/* APR Max */}
        <div className="space-y-2 mb-3">
          <Label>APR (Max)</Label>
          <Input
            type="number"
            placeholder="e.g. 20"
            value={aprMax}
            onChange={(e) => setAprMax(e.target.value)}
          />
        </div>

        {/* Min Income */}
        <div className="space-y-2 mb-3">
          <Label>Minimum Income</Label>
          <Input
            type="number"
            placeholder="e.g. 30000"
            value={minIncome}
            onChange={(e) => setMinIncome(e.target.value)}
          />
        </div>

        {/* Min Credit Score */}
        <div className="space-y-2 mb-3">
          <Label>Minimum Credit Score</Label>
          <Input
            type="number"
            placeholder="e.g. 700"
            value={minCreditScore}
            onChange={(e) => setMinCreditScore(e.target.value)}
          />
        </div>

        {/* Loan Type */}
        <div className="space-y-2 mb-3">
          <Label>Loan Type</Label>
          <Input
            placeholder="e.g. personal"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
          />
        </div>

        <Button variant="destructive" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      </PopoverContent>
    </Popover>
  );
}
