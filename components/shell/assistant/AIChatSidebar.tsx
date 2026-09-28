"use client";

import { Plus, PanelLeftClose, PanelLeftOpen, MessageSquare } from "lucide-react";
import { CHAT_GROUP_ORDER, type Conversation } from "@/lib/mock-data/assistant-chats";

export default function AIChatSidebar({
  conversations,
  activeId,
  collapsed,
  onToggleCollapse,
  onSelect,
  onNewChat,
}: {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  const grouped = CHAT_GROUP_ORDER.map((group) => ({
    group,
    items: conversations.filter((c) => c.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      aria-label="Chat history"
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--divider)] bg-[var(--assistant-sidebar-bg)] transition-[width] duration-300 ease-out ${
        collapsed ? "w-[4rem]" : "w-[16rem]"
      }`}
    >
      <div className={`flex flex-col items-stretch gap-2 p-3 ${collapsed ? "items-center" : ""}`}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <button
              type="button"
              onClick={onNewChat}
              title="New chat"
              aria-label="Start a new chat"
              className="tap-pop flex h-8 min-w-0 items-center gap-1.5 rounded-full border border-[var(--assistant-border)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--text-heading)] shadow-[0_1px_0.25rem_rgba(15,23,42,0.06)] transition-colors hover:bg-[var(--assistant-hover)]"
            >
              <Plus size={16} className="shrink-0" />
              <span className="truncate">New chat</span>
            </button>
          )}
          <button
            type="button"
            title={collapsed ? "Expand chat history" : "Collapse chat history"}
            aria-label={collapsed ? "Expand chat history" : "Collapse chat history"}
            onClick={onToggleCollapse}
            className="tap-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)]"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={onNewChat}
            title="New chat"
            aria-label="Start a new chat"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-full border border-[var(--assistant-border)] bg-[var(--surface)] text-[var(--text-heading)] shadow-[0_1px_0.25rem_rgba(15,23,42,0.06)] transition-colors hover:bg-[var(--assistant-hover)]"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {!collapsed && (
        <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-3">
          {grouped.map(({ group, items }) => (
            <div key={group} className="mb-3">
              <p className="px-2 pb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.title}
                      aria-label={c.title}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => onSelect(c.id)}
                      className={`tap-pop flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-[var(--surface)] font-medium text-[var(--text-heading)] shadow-[0_1px_0.25rem_rgba(15,23,42,0.06)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
                      }`}
                    >
                      <MessageSquare size={15} className="shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      )}
    </aside>
  );
}
