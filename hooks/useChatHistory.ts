// src/hooks/useChatHistory.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { ChatMessage } from "@/lib/schemas";

const STORAGE_KEY_PREFIX = "loan_compass_chat_history:";

function storageKey(productId: string) {
  return `${STORAGE_KEY_PREFIX}${productId}`;
}

export function useChatHistory(productId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const loadedRef = useRef(false);

  // ----------------------------
  // Load from localStorage
  // ----------------------------
  useEffect(() => {
    if (!productId) return;
    try {
      const raw = localStorage.getItem(storageKey(productId));
      const parsed: ChatMessage[] = raw ? JSON.parse(raw) : [];
      setMessages(parsed);
    } catch (e) {
      console.error("Failed to load chat history", e);
      setMessages([]);
    } finally {
      loadedRef.current = true;
    }
  }, [productId]);

  // ----------------------------
  // Save to localStorage
  // ----------------------------
  useEffect(() => {
    if (!productId || !loadedRef.current) return;
    try {
      localStorage.setItem(storageKey(productId), JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [productId, messages]);

  // Append a single new message
  const appendMessage = (m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  };

  // Replace a single message by ID
  const replaceMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  // ----------------------------
  // ✅ FIX: Add replaceMessages()
  // ----------------------------
  const replaceMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  };

  // Clear history
  const clearMessages = () => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey(productId));
    } catch (e) {}
  };

  return {
    messages,
    appendMessage,
    replaceMessage,
    clearMessages,
    replaceMessages, // ✅ make available to ChatSheet
  };
}
