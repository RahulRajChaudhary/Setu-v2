"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageTransition from "./PageTransition";
import AssistantButton from "./AssistantButton";
import AssistantRegion, { type AssistantMode } from "./assistant/AssistantRegion";
import { useAssistantChats } from "./assistant/useAssistantChats";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AssistantMode>("closed");
  const chat = useAssistantChats();

  const isOpen = mode !== "closed";

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--shell-bg)]">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />

        {/* Dashboard stays mounted (just shrinks) so its state survives opening/expanding the assistant.
            flex-grow animates in lockstep with AssistantRegion's flex-grow so the reveal/retract is symmetric.
            Opacity fades alongside it so fixed-position header children (e.g. the search bar) don't keep
            painting at viewport-center once the column has zero width. */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden transition-[flex-grow,opacity] duration-300 ease-out ${
            mode === "expanded" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ flexGrow: mode === "expanded" ? 0 : 1, flexBasis: 0 }}
        >
          <Header />
          <main
            className="
              min-h-0 flex-1 overflow-y-auto overflow-x-hidden
              pl-3 pr-[var(--page-pad-x)] pb-20 pt-[var(--page-pad-y)]

              screen-sm:pb-[var(--page-pad-y)]
              screen-sm:pl-4
              screen-sm:pr-[2.1rem]
              screen-2xl:pr-[2.5rem]
            "
          >
            {/* No max-width/centering here on purpose: the dashboard's left edge must
                track the sidebar and its right edge must track the header's right-side
                icon cluster (profile/apps/notifications) at every viewport size and
                zoom level — see screen-sm:pr-[2.1rem]/screen-2xl:pr-[2.5rem] above,
                which match Header's screen-sm:mr-[2.1rem]/screen-2xl:mr-[2.5rem] and
                the right-edge strip's width below, so all three stay pixel-aligned. */}
            <div className="w-full min-w-0">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>

        <AssistantRegion
          mode={mode}
          conversations={chat.conversations}
          activeId={chat.activeId}
          activeConversation={chat.activeConversation}
          activeStatus={chat.activeStatus}
          onSelect={chat.handleSelect}
          onNewChat={chat.handleNewChat}
          onSend={chat.handleSend}
          onRegenerate={chat.handleRegenerate}
          onExpand={() => setMode("expanded")}
          onCollapse={() => setMode("docked")}
          onClose={() => setMode("closed")}
        />
      </div>
      {!isOpen && (
        <>
          <div
            aria-hidden="true"
            className="
              hidden shrink-0 w-full bg-[var(--shell-bg)] z-20
              screen-sm:block
              screen-sm:h-[2.2rem]
              screen-2xl:h-[2.6rem]
            "
          />
          {/* Right-edge strip, spanning full height */}
          <div
            aria-hidden="true"
            className="
              hidden
              screen-sm:block screen-sm:fixed screen-sm:right-0 screen-sm:top-0 screen-sm:z-20
              screen-sm:h-full screen-sm:w-[2.1rem]
              screen-sm:bg-[var(--shell-bg)]
              screen-2xl:w-[2.5rem]
            "
          />
          <AssistantButton onClick={() => setMode("docked")} />
        </>
      )}
    </div>
  );
}
