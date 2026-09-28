"use client";

import { useEffect, useState } from "react";
import AIChatSidebar from "./AIChatSidebar";
import AIConversationPanel from "./AIConversationPanel";
import type { ChatStatus, Conversation } from "@/lib/mock-data/assistant-chats";

export type AssistantMode = "closed" | "compact" | "fullscreen";

function getFlexBasis(mode: AssistantMode) {
  if (mode === "closed") return "0px";
  // Compact keeps this width whether or not its internal history pane is open —
  // history shares the docked box instead of growing it. Fullscreen ignores this
  // (flexGrow: 1 below).
  return "clamp(20rem,28vw,26rem)";
}

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
  // Fullscreen sidebar open/collapsed — independent of compact history, never exits fullscreen.
  const [fullscreenHistoryCollapsed, setFullscreenHistoryCollapsed] = useState(false);
  // Compact (docked) history pane — shares the docked box's fixed width, closed by default.
  const [compactHistoryOpen, setCompactHistoryOpen] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const isFullscreen = mode === "fullscreen";
  const isCompact = mode === "compact";

  // History is always closed the next time the assistant is reopened.
  useEffect(() => {
    if (mode === "closed") setCompactHistoryOpen(false);
  }, [mode]);

  function handleSelect(id: string) {
    onSelect(id);
    setMobileHistoryOpen(false);
    if (isCompact) setCompactHistoryOpen(false);
  }

  function handleNewChat() {
    onNewChat();
    setMobileHistoryOpen(false);
    if (isCompact) setCompactHistoryOpen(false);
  }

  function handleToggleCompactHistory() {
    setCompactHistoryOpen((v) => !v);
  }

  return (
    <div
      aria-hidden={mode === "closed"}
      className={`flex h-full min-w-0 overflow-hidden transition-[flex-grow,flex-basis] duration-300 ease-out ${
        !isFullscreen ? "border-l border-[var(--divider)] shadow-[-0.5rem_0_1.5rem_rgba(15,23,42,0.06)]" : ""
      }`}
      style={{
        flexGrow: isFullscreen ? 1 : 0,
        flexBasis: getFlexBasis(mode),
        flexShrink: 0,
      }}
    >
      {isCompact && (
        <div className="hidden h-full screen-sm:flex">
          <AIChatSidebar
            variant="embedded"
            open={compactHistoryOpen}
            conversations={conversations}
            activeId={activeId}
            collapsed={false}
            onToggleCollapse={handleToggleCompactHistory}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {isFullscreen && (
        <div className="hidden h-full screen-sm:flex">
          <AIChatSidebar
            variant="rail"
            conversations={conversations}
            activeId={activeId}
            collapsed={fullscreenHistoryCollapsed}
            onToggleCollapse={() => setFullscreenHistoryCollapsed((v) => !v)}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      <AIConversationPanel
        variant={isFullscreen ? "workspace" : "docked"}
        conversation={activeConversation}
        onPrimaryAction={isFullscreen ? onCollapse : onExpand}
        onToggleHistory={!isFullscreen ? handleToggleCompactHistory : undefined}
        historyOpen={compactHistoryOpen}
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
              variant="rail"
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
