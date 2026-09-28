"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send, Maximize2, Minimize2, X, PanelLeft, Menu, ChevronLeft, RotateCw } from "lucide-react";
import type { ChatStatus, Conversation } from "@/lib/mock-data/assistant-chats";
import LoadingDots from "./LoadingDots";

export default function AIConversationPanel({
  variant,
  conversation,
  status,
  onPrimaryAction,
  onToggleHistory,
  historyOpen = false,
  onClose,
  onSend,
  onRegenerate,
  onToggleMobileHistory,
}: {
  variant: "docked" | "workspace";
  conversation: Conversation | null;
  status: ChatStatus;
  onPrimaryAction: () => void;
  onToggleHistory?: () => void;
  /** Compact (docked) history pane is open — swaps the header to "Back / Close" and
   *  condenses the composer (drops regenerate/attach) so the narrowed chat column
   *  never squeezes the message input to zero width. */
  historyOpen?: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  onRegenerate: () => void;
  onToggleMobileHistory?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAttachPulsing, setIsAttachPulsing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isWorkspace = variant === "workspace";
  const widthClass = isWorkspace ? "mx-auto w-full max-w-3xl" : "w-full";
  // Compact history pane narrows the chat column enough that the full icon set
  // (mic/regenerate/attach/send) would squeeze the input to zero width — drop the
  // two non-essential actions in that state only. Both stay reachable once history
  // is closed (regenerate also has the "Try again" affordance on error messages).
  const condensedComposer = !isWorkspace && historyOpen;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage("");
  }

  function handleMicClick() {
    setIsRecording(true);
    window.setTimeout(() => setIsRecording(false), 1200);
  }

  function handleAttachClick() {
    setIsAttachPulsing(true);
    window.setTimeout(() => setIsAttachPulsing(false), 900);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[var(--assistant-panel-from)] via-[var(--assistant-panel-via)] to-[var(--assistant-panel-to)]">
      {/* Header */}
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b border-[var(--divider)] px-4 py-3">
        {!isWorkspace && historyOpen ? (
          <>
            <button
              type="button"
              onClick={onToggleHistory}
              title="Back to chat"
              aria-label="Back to chat"
              className="tap-pop flex h-8 min-w-0 flex-1 items-center gap-1 rounded-full pl-1.5 pr-3 text-sm font-medium text-[var(--text-heading)] transition-colors hover:bg-[var(--search-bg)]"
            >
              <ChevronLeft size={16} className="shrink-0" />
              <span className="truncate">Conversations</span>
            </button>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              aria-label="Close assistant"
              className="tap-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)]"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {!isWorkspace && onToggleHistory && (
                <button
                  type="button"
                  title="Open chat history"
                  aria-label="Open chat history"
                  onClick={onToggleHistory}
                  className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)]"
                >
                  <Menu size={16} />
                </button>
              )}
              {isWorkspace && onToggleMobileHistory && (
                <button
                  type="button"
                  title="Chat history"
                  aria-label="Open chat history"
                  onClick={onToggleMobileHistory}
                  className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] screen-sm:hidden"
                >
                  <PanelLeft size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title={isWorkspace ? "Collapse" : "Expand"}
                aria-label={isWorkspace ? "Collapse assistant" : "Expand assistant"}
                onClick={onPrimaryAction}
                className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)]"
              >
                {isWorkspace ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <span className="h-4 w-px bg-[var(--divider)]" />
              <button
                type="button"
                title="Close"
                onClick={onClose}
                aria-label="Close assistant"
                className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)]"
              >
                <X size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-5">
        <div className={`flex flex-1 flex-col ${widthClass}`}>
          {!conversation ? (
            <div className="relative flex flex-1 flex-col items-center justify-center py-6">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.18),transparent)]"
              />
              <Image src="/bot-icon.svg" alt="" width={92} height={124} className="relative drop-shadow-lg" priority />
              <p className="relative mt-3 text-sm text-[var(--text-secondary)]">
                Hello! I&rsquo;m <span className="font-bold text-[var(--text-heading)]">Sahayogi</span>
              </p>
              <p className="relative text-sm text-[var(--text-muted)]">How can I help you today?</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3 py-4">
              {conversation.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-[0_1px_0.25rem_rgba(15,23,42,0.06)] ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white"
                        : "bg-[var(--surface)] text-[var(--text-heading)]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {status === "pending" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[var(--surface)] px-3 py-1 shadow-[0_1px_0.25rem_rgba(15,23,42,0.06)]">
                    <LoadingDots />
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] flex-col items-start gap-2 rounded-2xl border border-[var(--status-critical-fg)]/20 bg-[var(--status-critical-bg)] px-4 py-2.5 text-sm text-[var(--status-critical-fg)]">
                    <span>Unable to generate a response.</span>
                    <button
                      type="button"
                      onClick={onRegenerate}
                      className="tap-pop rounded-full border border-[var(--status-critical-fg)]/30 px-3 py-1 text-xs font-medium text-[var(--status-critical-fg)] transition-colors hover:bg-[var(--status-critical-fg)]/10"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="flex min-w-0 justify-center p-4">
        <div
          className={`flex min-w-0 items-center gap-2 rounded-full border border-[var(--assistant-border)] bg-[var(--surface)]/90 py-2 pl-4 pr-2 shadow-[0_2px_0.625rem_rgba(99,102,241,0.15)] ${widthClass}`}
        >
          <button
            type="button"
            title="Voice input"
            aria-label="Voice input"
            onClick={handleMicClick}
            className={`tap-pop flex h-6 w-6 shrink-0 items-center justify-center transition-transform hover:scale-110 ${
              isRecording ? "text-[#7C3AED]" : "text-[var(--text-muted)]"
            }`}
          >
            <Mic size={16} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && status !== "pending") handleSend(message);
            }}
            placeholder="Ask anything..."
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--search-placeholder)]"
          />
          {!condensedComposer && (
            <button
              type="button"
              title="Regenerate response"
              aria-label="Regenerate response"
              onClick={onRegenerate}
              disabled={status === "pending" || !conversation || conversation.messages.length === 0}
              className="tap-pop flex h-6 w-6 shrink-0 items-center justify-center text-[var(--text-muted)] transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
            >
              <RotateCw size={16} className={status === "pending" ? "animate-spin" : ""} />
            </button>
          )}
          {!condensedComposer && (
            <button
              type="button"
              title="Attach a file"
              aria-label="Attach a file"
              onClick={handleAttachClick}
              className={`tap-pop flex h-6 w-6 shrink-0 items-center justify-center transition-transform hover:scale-110 ${
                isAttachPulsing ? "text-[#7C3AED]" : "text-[var(--text-muted)]"
              }`}
            >
              <Paperclip size={16} />
            </button>
          )}
          <button
            type="button"
            title="Send"
            aria-label="Send message"
            onClick={() => handleSend(message)}
            disabled={message.trim().length === 0 || status === "pending"}
            className="tap-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
