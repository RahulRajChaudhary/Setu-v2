"use client";

import { useState } from "react";
import AIChatSidebar from "./AIChatSidebar";
import AIConversationPanel from "./AIConversationPanel";
import type { ChatStatus, Conversation } from "@/lib/mock-data/assistant-chats";

export type AssistantMode = "closed" | "compact" | "fullscreen";

export default function AssistantRegion({
  mode,
  conversations,
  activeId,
  activeConversation,
  activeStatus,
  onSelect,
  onNewChat,
  onSend,
  onRegenerate,
  onExpand,
  onCollapse,
  onClose,
}: {
  mode: AssistantMode;
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  activeStatus: ChatStatus;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onSend: (text: string) => void;
  onRegenerate: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
}) {
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const isFullscreen = mode === "fullscreen";

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
        !isFullscreen ? "border-l border-[var(--divider)] shadow-[-0.5rem_0_1.5rem_rgba(15,23,42,0.06)]" : ""
      }`}
      style={{
        flexGrow: isFullscreen ? 1 : 0,
        flexBasis: mode === "closed" ? "0px" : "clamp(20rem,28vw,26rem)",
        flexShrink: 0,
      }}
    >
      {isFullscreen && (
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
        variant={isFullscreen ? "workspace" : "docked"}
        conversation={activeConversation}
        onPrimaryAction={isFullscreen ? onCollapse : onExpand}
        onOpenHistory={!isFullscreen ? onExpand : undefined}
        onClose={onClose}
        onSend={onSend}
        onRegenerate={onRegenerate}
        status={activeStatus}
        onToggleMobileHistory={isFullscreen ? () => setMobileHistoryOpen(true) : undefined}
      />

      {isFullscreen && mobileHistoryOpen && (
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
