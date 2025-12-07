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

export default function ChatSheet({
  product,
  open,
  onOpenChange,
}: ChatSheetProps) {
  const productId = product?.id;

  // -------------------------------------
  // ANONYMOUS USER ID (localStorage)
  // -------------------------------------
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("anonId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("anonId", id);
    }
    setAnonId(id);
  }, []);

  // -------------------------------------
  // CHAT HISTORY HOOK (LOCAL)
  // -------------------------------------
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

  // -------------------------------------
  // RESET WHEN SWITCHING PRODUCT
  // -------------------------------------
  useEffect(() => {
    clearMessages();
    setInput("");
    setError(null);
  }, [productId]);

  // -------------------------------------
  // LOAD SERVER CHAT HISTORY WHEN OPENED
  // -------------------------------------
  async function loadServerHistory() {
    if (!productId || !open || !anonId) return;

    const params = new URLSearchParams({ productId });

    // If user is not authenticated, allow anon fetch
    params.set("anonId", anonId);

    const res = await fetch(`/api/chat/history?${params.toString()}`);
    if (!res.ok) return;

    const { messages } = await res.json();
    replaceMessages(messages || []);
  }

  useEffect(() => {
    if (open) loadServerHistory();
  }, [open, productId, anonId]);

  // -------------------------------------
  // AUTO SCROLL
  // -------------------------------------
  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  // -------------------------------------
  // KEYBOARD HANDLER
  // -------------------------------------
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      const isInput =
        active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";

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

  // -------------------------------------
  // SEND MESSAGE
  // -------------------------------------
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
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          productId,
          message: text,
          history: messages,
          anonId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
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

  // -------------------------------------
  // RENDER UI
  // -------------------------------------
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 flex h-full flex-col bg-white">
        {/* HEADER */}
        <SheetHeader className="p-4 pb-2 border-b bg-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-lg font-semibold">
                {product.name}
              </SheetTitle>
              <div className="text-sm text-muted-foreground">{product.bank}</div>

              <div className="flex gap-2 mt-2 flex-wrap">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <SheetClose className="text-sm text-muted-foreground hover:text-foreground">
              Close
            </SheetClose>
          </div>
        </SheetHeader>

        {/* CHAT AREA */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50"
        >
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Start a conversation about this product.
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none"
                }`}
              >
                {m.pending ? (
                  <Skeleton className="h-4 w-24" />
                ) : m.error ? (
                  <p className="text-red-600 text-sm">{m.error}</p>
                ) : (
                  <p className="text-sm leading-relaxed">{m.content}</p>
                )}

                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BAR */}
        <div className="border-t bg-white p-3 flex gap-2 items-center sticky bottom-0 z-20">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className=""
          >
            {sending ? "..." : "Send"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
