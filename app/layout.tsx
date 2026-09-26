import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Setu Dashboards",
  description: "Founder dashboard",
};

// No stored preference to read (see lib/theme/ThemeProvider.tsx) — mode always
// defaults to "system", so the only thing worth resolving before paint is the OS
// preference, to avoid a light->dark (or dark->light) flash for that default.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
