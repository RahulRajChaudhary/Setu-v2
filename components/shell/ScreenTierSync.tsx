"use client";

import { useEffect } from "react";

// Must match the inline bootstrap script in app/layout.tsx.
function computeScreenTiers(): string {
  const width = window.screen.width;
  const tiers: string[] = [];
  if (width >= 420) tiers.push("420");
  if (width >= 640) tiers.push("sm");
  if (width >= 1024) tiers.push("lg");
  if (width >= 1280) tiers.push("xl");
  if (width >= 1366) tiers.push("1366");
  if (width >= 1440) tiers.push("1440");
  if (width >= 1536) tiers.push("2xl");
  return tiers.join(" ");
}

/**
 * Keeps `<html data-screen>` in sync with the physical monitor size
 * (`window.screen.width`) rather than the CSS viewport, so the shell
 * layout only changes breakpoint tier when the user is actually on a
 * different device/screen — not when they zoom the browser in or out.
 * The initial value is set synchronously by an inline script in
 * app/layout.tsx (before hydration) to avoid a flash of the wrong tier;
 * this component just keeps it updated (e.g. moving the window to an
 * external monitor with a different resolution).
 */
export default function ScreenTierSync() {
  useEffect(() => {
    function apply() {
      document.documentElement.setAttribute("data-screen", computeScreenTiers());
    }
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("load", apply);

    // Some embedded/automated browser contexts report `window.screen` as
    // 0x0 for a moment after script start before the real value lands —
    // a few short-lived retries catch that without any lasting cost on
    // browsers where it's correct from the start.
    const retryTimers = [100, 500, 1500].map((delay) => window.setTimeout(apply, delay));

    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("load", apply);
      retryTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return null;
}
