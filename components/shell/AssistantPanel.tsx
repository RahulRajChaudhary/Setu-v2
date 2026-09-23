"use client";

import Image from "next/image";
import { useState } from "react";

const SUGGESTIONS = [
  "What do the dashboard KPIs mean?",
  "How can I customize the dashboard view?",
  "How do I drill into pending approvals?",
  "Can I filter incidents by their current status?",
];

export default function AssistantPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sahayogi assistant"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[26rem] flex-col overflow-hidden bg-gradient-to-b from-[#EEF1FF] via-[#F1F6FF] to-white shadow-2xl transition-transform duration-300 ease-out screen-sm:rounded-l-3xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-end gap-2 p-3">
          <button
            type="button"
            title="Restart conversation"
            onClick={() => setMessage("")}
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-black/5"
          >
            <RefreshIcon />
          </button>
          <span className="h-4 w-px bg-black/10" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-black/5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-y-auto px-5">
          {/* Robot + greeting */}
          <div className="relative flex flex-col items-center py-4">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.18),transparent)]"
            />
            <Image src="/robot-icon.svg" alt="" width={110} height={116} className="relative drop-shadow-lg" priority />
            <p className="relative mt-3 text-sm text-[var(--text-secondary)]">
              Hello! I&rsquo;m <span className="font-bold text-[var(--text-heading)]">Sahayogi</span>
            </p>
          </div>

          {/* Suggestions */}
          <div className="mb-4 flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMessage(s)}
                className="tap-pop card-interactive flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-left text-sm text-[var(--text-heading)] shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
              >
                <span className="truncate">{s}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="p-4">
          <div className="flex items-center gap-2 rounded-full border border-[#C7CAFF] bg-white/90 py-2 pl-4 pr-2 shadow-[0_2px_10px_rgba(99,102,241,0.15)]">
            <button type="button" title="Voice input" className="tap-pop flex h-6 w-6 shrink-0 items-center justify-center text-[var(--text-muted)] transition-transform hover:scale-110">
              <MicIcon />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--search-placeholder)]"
            />
            <button type="button" title="Attach a file" className="tap-pop flex h-6 w-6 shrink-0 items-center justify-center text-[var(--text-muted)] transition-transform hover:scale-110">
              <PaperclipIcon />
            </button>
            <button
              type="button"
              title="Send"
              disabled={message.trim().length === 0}
              className="tap-pop flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8.5L13.5 3L9 14L7 9.5L2 8.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 8a5.5 5.5 0 0 1-9.4 3.9L2.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 13.5v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 7.5V8.5C3.5 10.98 5.52 13 8 13C10.48 13 12.5 10.98 12.5 8.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 13V14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 5L5.7 9.8a1.7 1.7 0 0 0 2.4 2.4l5-5a3 3 0 0 0-4.2-4.2l-5 5a4.2 4.2 0 0 0 6 6L14.5 9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
