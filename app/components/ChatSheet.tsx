// app/products/components/ChatSheet.tsx
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadges } from "@/lib/getBadges";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatMessage } from "@/lib/schemas";

type ChatSheetProps = {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChatSheet({ product, open, onOpenChange }: ChatSheetProps) {
  const productId = product?.id;

  // anonymous id
  const [anonId, setAnonId] = useState<string | null>(null);
  useEffect(() => {
    let id = localStorage.getItem("anonId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("anonId", id);
    }
    setAnonId(id);
  }, []);

  const {
    messages,
    appendMessage,
    replaceMessage,
    clearMessages,
    replaceMessages,
  } = useChatHistory(productId);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const innerScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    clearMessages();
    setInput("");
    setError(null);
  }, [productId]);

  async function loadServerHistory() {
    if (!productId || !open || !anonId) return;
    const params = new URLSearchParams({ productId });
    params.set("anonId", anonId);
    const res = await fetch(`/api/chat/history?${params.toString()}`);
    if (!res.ok) return;
    const { messages } = await res.json();
    replaceMessages(messages || []);
  }

  useEffect(() => {
    if (open) loadServerHistory();
  }, [open, productId, anonId]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      innerScrollRef.current?.scrollTo({
        top: innerScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      const isInput = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
      }
      if (e.key === "Enter" && isInput && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        handleSend();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, input]);

  async function handleSend() {
    if (!input.trim() || !anonId) return;
    const text = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
      pending: false,
    };

    appendMessage(userMsg);
    setSending(true);
    setError(null);

    const assistantId = uuidv4();
    const pendingAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      pending: true,
    };

    appendMessage(pendingAssistant);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          productId,
          message: text,
          history: messages,
          anonId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI error");

      replaceMessage(assistantId, {
        content: json.answer || "No reply.",
        pending: false,
      });
    } catch (err: any) {
      replaceMessage(assistantId, {
        pending: false,
        error: err?.message ?? "Failed to get assistant response",
      });
      setError("Failed to get assistant response. Try again.");
    } finally {
      setSending(false);
    }
  }

  const badges = getBadges(product);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 flex h-full flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b bg-white sticky top-0 z-20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-medium leading-snug truncate">
                {product.name}
              </SheetTitle>
              <div className="text-sm text-muted-foreground truncate">{product.bank}</div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <SheetClose className="text-sm text-muted-foreground hover:text-gray-900">
                Close
              </SheetClose>
            </div>
          </div>
        </div>

        {/* Chat area wrapper to clip scrollbars */}
        <div ref={scrollRef} className="flex-1 p-4 bg-gray-50">
          <div
            ref={innerScrollRef}
            className="
              max-h-[calc(100vh-260px)] overflow-y-auto pr-2
              space-y-4
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:shadow-sm
              transition-all
            "
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-8">
                Start a conversation about this product.
              </p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[78%] rounded-2xl px-4 py-3 shadow-sm
                    ${m.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-white text-gray-900 rounded-bl-none border border-gray-100"}
                    animate-[fadeIn_220ms_ease]
                  `}
                >
                  {m.pending ? (
                    <Skeleton className="h-4 w-28" />
                  ) : m.error ? (
                    <p className="text-red-600 text-sm">{m.error}</p>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  )}

                  <div className="mt-2 flex items-center justify-end">
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t bg-white p-3 sticky bottom-0 z-30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about interest, eligibility, docs..."
              className="flex-1 rounded-lg"
              aria-label="Type your message"
            />
            <Button
              type="submit"
              disabled={sending || !input.trim()}
              className="whitespace-nowrap"
            >
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
