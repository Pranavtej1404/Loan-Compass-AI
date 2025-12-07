// app/products/components/Filters.tsx
"use client";

import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Filters({ searchParams }: { searchParams: any }) {
  const router = useRouter();

  const [bank, setBank] = useState(searchParams.bank || "");
  const [aprMin, setAprMin] = useState(searchParams.aprMin || "");
  const [aprMax, setAprMax] = useState(searchParams.aprMax || "");
  const [minIncome, setMinIncome] = useState(searchParams.minIncome || "");
  const [minCreditScore, setMinCreditScore] = useState(searchParams.minCreditScore || "");
  const [loanType, setLoanType] = useState(searchParams.type || "");

  const debouncedBank = useDebounce(bank, 400);

  useEffect(() => {
    const hasFilters = bank || aprMin || aprMax || minIncome || minCreditScore || loanType;
    if (!hasFilters) return;

    const params = new URLSearchParams();
    if (bank) params.set("bank", bank);
    if (aprMin) params.set("aprMin", aprMin);
    if (aprMax) params.set("aprMax", aprMax);
    if (minIncome) params.set("minIncome", minIncome);
    if (minCreditScore) params.set("minCreditScore", minCreditScore);
    if (loanType) params.set("type", loanType);

    router.push(`/products?${params.toString()}`);
  }, [debouncedBank, aprMin, aprMax, minIncome, minCreditScore, loanType, router]);

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
        <Button variant="outline" className="rounded-full px-4 py-2">
          Filters
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-4 rounded-xl border border-gray-100 shadow-md">
        <div className="space-y-4">

  <div className="flex flex-col space-y-1.5">
    <Label>Bank</Label>
    <Input
      placeholder="Search bank..."
      value={bank}
      onChange={(e) => setBank(e.target.value)}
      className="rounded-lg"
    />
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col space-y-1.5">
      <Label>APR min</Label>
      <Input
        type="number"
        placeholder="e.g. 5"
        value={aprMin}
        onChange={(e) => setAprMin(e.target.value)}
        className="rounded-lg"
      />
    </div>

    <div className="flex flex-col space-y-1.5">
      <Label>APR max</Label>
      <Input
        type="number"
        placeholder="e.g. 20"
        value={aprMax}
        onChange={(e) => setAprMax(e.target.value)}
        className="rounded-lg"
      />
    </div>
  </div>

  <div className="flex flex-col space-y-1.5">
    <Label>Min income</Label>
    <Input
      type="number"
      placeholder="e.g. 30000"
      value={minIncome}
      onChange={(e) => setMinIncome(e.target.value)}
      className="rounded-lg"
    />
  </div>

  <div className="flex flex-col space-y-1.5">
    <Label>Min credit score</Label>
    <Input
      type="number"
      placeholder="e.g. 700"
      value={minCreditScore}
      onChange={(e) => setMinCreditScore(e.target.value)}
      className="rounded-lg"
    />
  </div>

  <div className="flex flex-col space-y-1.5">
    <Label>Loan type</Label>
    <Input
      placeholder="e.g. personal"
      value={loanType}
      onChange={(e) => setLoanType(e.target.value)}
      className="rounded-lg"
    />
  </div>

</div>


        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={clearFilters}>
            Clear
          </Button>
          <Button className="flex-1" onClick={() => {
            // apply by re-using effect — updating state already triggers it
          }}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
