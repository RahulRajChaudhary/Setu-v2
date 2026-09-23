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
        overflow-hidden rounded-tl-[10px] rounded-bl-[10px]
        bg-gradient-to-b from-[#F5F9FF] to-[#CCE1FF]
        shadow-[-4px_2px_14px_rgba(15,23,42,0.18)]
        transition-transform hover:-translate-x-0.5
        sm:bottom-[clamp(3px,0.36vw,7px)]
        sm:h-[clamp(34px,2.19vw,42px)] sm:w-[clamp(32px,2.08vw,40px)]
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
