"use client";

import { useState } from "react";
import AIChatSidebar from "./AIChatSidebar";
import AIConversationPanel from "./AIConversationPanel";
import type { Conversation } from "@/lib/mock-data/assistant-chats";

export type AssistantMode = "closed" | "docked" | "expanded";

export default function AssistantRegion({
  mode,
  conversations,
  activeId,
  activeConversation,
  onSelect,
  onNewChat,
  onSend,
  onExpand,
  onCollapse,
  onClose,
}: {
  mode: AssistantMode;
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onSend: (text: string) => void;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
}) {
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const isExpanded = mode === "expanded";

  function handleSelect(id: string) {
    onSelect(id);
    setMobileHistoryOpen(false);
  }

  function handleNewChat() {
    onNewChat();
    setMobileHistoryOpen(false);
  }

  return (
    <div
      aria-hidden={mode === "closed"}
      className={`flex h-full min-w-0 overflow-hidden transition-[flex-grow,flex-basis] duration-300 ease-out ${
        !isExpanded ? "border-l border-[var(--divider)] shadow-[-0.5rem_0_1.5rem_rgba(15,23,42,0.06)]" : ""
      }`}
      style={{
        flexGrow: isExpanded ? 1 : 0,
        flexBasis: mode === "closed" ? "0px" : "clamp(20rem,28vw,26rem)",
        flexShrink: 0,
      }}
    >
      {isExpanded && (
        <div className="hidden h-full screen-sm:flex">
          <AIChatSidebar
            conversations={conversations}
            activeId={activeId}
            collapsed={railCollapsed}
            onToggleCollapse={() => setRailCollapsed((v) => !v)}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      <AIConversationPanel
        variant={isExpanded ? "workspace" : "docked"}
        conversation={activeConversation}
        onPrimaryAction={isExpanded ? onCollapse : onExpand}
        onClose={onClose}
        onSend={onSend}
        onToggleMobileHistory={isExpanded ? () => setMobileHistoryOpen(true) : undefined}
      />

      {isExpanded && mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 flex screen-sm:hidden">
          <div aria-hidden="true" onClick={() => setMobileHistoryOpen(false)} className="absolute inset-0 bg-black/30" />
          <div className="relative h-full w-[80%] max-w-[18rem] shadow-2xl">
            <AIChatSidebar
              conversations={conversations}
              activeId={activeId}
              collapsed={false}
              onToggleCollapse={() => setMobileHistoryOpen(false)}
              onSelect={handleSelect}
              onNewChat={handleNewChat}
            />
          </div>
        </div>
      )}
    </div>
  );
}
