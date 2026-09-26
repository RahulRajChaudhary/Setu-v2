"use client";

import Image from "next/image";

export default function AssistantButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      title="Ask Sahayogi"
      onClick={onClick}
      className="
        tap-pop fixed bottom-24 right-0 z-30 flex h-14 w-14 items-center justify-center
        overflow-hidden rounded-tl-[0.65rem] rounded-bl-[0.65rem]
        bg-gradient-to-b from-[#F5F9FF] to-[#CCE1FF]
        shadow-[-0.25rem_0.125rem_0.9rem_rgba(15,23,42,0.18)]
        transition-transform hover:-translate-x-0.5
        screen-sm:bottom-0
        screen-sm:h-[2.2rem] screen-sm:w-[2.1rem]
        screen-2xl:h-[2.6rem] screen-2xl:w-[2.5rem]
      "
    >
      <Image
        src="/robot-icon.svg"
        alt="Open Sahayogi assistant"
        width={38}
        height={40}
        className="h-[85%] w-auto"
        priority
      />
    </button>
  );
}
