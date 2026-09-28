"use client";

import { useState } from "react";
import {
  INITIAL_CONVERSATIONS,
  type ChatMessage,
  type ChatStatus,
  type Conversation,
} from "@/lib/mock-data/assistant-chats";

const ASSISTANT_REPLY =
  "Here's a quick summary based on what's currently in the dashboard — let me know if you'd like me to go deeper on any part of it.";

// Simulated occasional failure, matching the stale/failure convention used
// elsewhere for mocked async UI (see CLAUDE.md — Control Room tile refresh).
const SIMULATED_FAILURE_RATE = 0.1;

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAssistantChats() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [statusById, setStatusById] = useState<Record<string, ChatStatus>>({});

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeStatus: ChatStatus = (activeId && statusById[activeId]) || "idle";

  function handleNewChat() {
    setActiveId(null);
  }

  function handleSelect(id: string) {
    setActiveId(id);
  }

  function requestAssistantReply(targetId: string) {
    setStatusById((prev) => ({ ...prev, [targetId]: "pending" }));

    window.setTimeout(() => {
      const failed = Math.random() < SIMULATED_FAILURE_RATE;

      if (failed) {
        setStatusById((prev) => ({ ...prev, [targetId]: "error" }));
        return;
      }

      const assistantMessage: ChatMessage = { id: makeId("m"), role: "assistant", content: ASSISTANT_REPLY };
      setConversations((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, messages: [...c.messages, assistantMessage] } : c))
      );
      setStatusById((prev) => ({ ...prev, [targetId]: "idle" }));
    }, 700);
  }

  function handleSend(text: string) {
    if (activeId && statusById[activeId] === "pending") return;

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
    requestAssistantReply(targetId);
  }

  function handleRegenerate() {
    if (!activeId || !activeConversation) return;
    if (activeStatus === "pending") return;

    const lastUserIndex = [...activeConversation.messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;
    const cutIndex = activeConversation.messages.length - 1 - lastUserIndex;

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: c.messages.slice(0, cutIndex + 1) } : c))
    );
    requestAssistantReply(activeId);
  }

  return {
    conversations,
    activeId,
    activeConversation,
    statusById,
    activeStatus,
    handleNewChat,
    handleSelect,
    handleSend,
    handleRegenerate,
  };
}
