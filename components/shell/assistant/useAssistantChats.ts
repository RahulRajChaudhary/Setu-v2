"use client";

import { useState } from "react";
import { INITIAL_CONVERSATIONS, type ChatMessage, type Conversation } from "@/lib/mock-data/assistant-chats";

const ASSISTANT_REPLY =
  "Here's a quick summary based on what's currently in the dashboard — let me know if you'd like me to go deeper on any part of it.";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAssistantChats() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  function handleNewChat() {
    setActiveId(null);
  }

  function handleSelect(id: string) {
    setActiveId(id);
  }

  function handleSend(text: string) {
    const userMessage: ChatMessage = { id: makeId("m"), role: "user", content: text };
    const targetId = activeId ?? makeId("conv");

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === targetId);
      if (exists) {
        return prev.map((c) => (c.id === targetId ? { ...c, messages: [...c.messages, userMessage] } : c));
      }
      const newConversation: Conversation = {
        id: targetId,
        title: text.length > 40 ? `${text.slice(0, 40)}…` : text,
        group: "Today",
        messages: [userMessage],
      };
      return [newConversation, ...prev];
    });
    setActiveId(targetId);

    window.setTimeout(() => {
      const assistantMessage: ChatMessage = { id: makeId("m"), role: "assistant", content: ASSISTANT_REPLY };
      setConversations((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, messages: [...c.messages, assistantMessage] } : c))
      );
    }, 700);
  }

  return { conversations, activeId, activeConversation, handleNewChat, handleSelect, handleSend };
}
