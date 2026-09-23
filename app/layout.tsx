import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import ScreenTierSync from "@/components/shell/ScreenTierSync";

export const metadata: Metadata = {
  title: "Setu Dashboards",
  description: "Founder dashboard",
};

// Sets html[data-screen] before hydration so the shell renders at the right
// tier on first paint. Must stay in sync with computeScreenTiers() in
// ScreenTierSync.tsx, which takes over updates after mount.
const SCREEN_TIER_BOOTSTRAP = `(function(){
  var w = window.screen.width;
  var t = [];
  if (w >= 420) t.push("420");
  if (w >= 640) t.push("sm");
  if (w >= 1024) t.push("lg");
  if (w >= 1280) t.push("xl");
  if (w >= 1366) t.push("1366");
  if (w >= 1440) t.push("1440");
  if (w >= 1536) t.push("2xl");
  document.documentElement.setAttribute("data-screen", t.join(" "));
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="screen-tier-bootstrap" strategy="beforeInteractive">
          {SCREEN_TIER_BOOTSTRAP}
        </Script>
        <ScreenTierSync />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
