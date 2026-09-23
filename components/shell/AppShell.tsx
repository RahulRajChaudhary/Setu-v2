"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageTransition from "./PageTransition";
import AssistantButton from "./AssistantButton";
import AssistantPanel from "./AssistantPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--shell-bg)]">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main
            className="
              min-h-0 flex-1 overflow-auto
              px-[var(--page-pad-x)] pb-20 pt-[var(--page-pad-y)]

              screen-sm:pb-[var(--page-pad-y)]
              screen-sm:pr-[13px]

              screen-lg:pr-[21px]
              screen-xl:pr-[27px]
              screen-1366:pr-[28px]
              screen-1440:pr-[30px]
              screen-2xl:pr-[40px]
            "
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="
          hidden shrink-0 w-full bg-white z-20
          screen-sm:block
          screen-sm:h-[28px]

          screen-lg:h-[32px]
          screen-xl:h-[40px]
          screen-1366:h-[42px]
          screen-1440:h-[45px]
          screen-2xl:h-[56px]
        "
      />
      <AssistantButton onClick={() => setAssistantOpen(true)} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
