import type { LucideIcon } from "lucide-react";
import { Sparkles, Mail, HardDrive, Users, Target, Link2 } from "lucide-react";

export type LauncherApp = {
  id: string;
  name: string;
  kind: "product" | "tool";
  /** Real Sahayogi products only — fetched from sahayogi.in/products */
  logoUrl?: string;
  /** Internal-only tools only — no official logo exists */
  icon?: LucideIcon;
  bg?: string;
  fg?: string;
  /** Real Sahayogi products only — opens in a new tab when clicked */
  liveUrl?: string;
};

export const LAUNCHER_APPS: LauncherApp[] = [
  {
    id: "office-sahayogi",
    name: "Office Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Office%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/office-sahayogi",
  },
  {
    id: "boss",
    name: "BoSS",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/BoSS.png",
    liveUrl: "https://sahayogi.in/products/boss",
  },
  {
    id: "sahayogi-cloud",
    name: "Sahayogi Cloud",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520Cloud.png",
    liveUrl: "https://sahayogi.in/products/cloud-sahayogi",
  },
  {
    id: "chat-with-sahayogi",
    name: "Chat with Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Chat%2520With%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/chat-with-sahayogi",
  },
  {
    id: "investor-sahayogi",
    name: "Investor Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Investor%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/investor-sahayogi",
  },
  {
    id: "tax-sahayogi",
    name: "Tax Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Tax%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/tax-sahayogi",
  },
  {
    id: "sahayogi-one",
    name: "Sahayogi One",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%2520One.png",
    liveUrl: "https://sahayogi.in/products/sahayogi-one",
  },
  {
    id: "my-sahayogi",
    name: "My Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/My%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/my-sahayogi",
  },
  {
    id: "studio-sahayogi",
    name: "Studio Sahayogi",
    kind: "product",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Studio%2520Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/studio-sahayogi",
  },
  { id: "sahayogi-ai", name: "Sahayogi AI", kind: "tool", icon: Sparkles, bg: "#EDE9FE", fg: "#7C3AED" },
  { id: "mail", name: "Mail", kind: "tool", icon: Mail, bg: "#FEE2E2", fg: "#DC2626" },
  { id: "drive", name: "Drive", kind: "tool", icon: HardDrive, bg: "#DBEAFE", fg: "#2563EB" },
  { id: "team", name: "Team", kind: "tool", icon: Users, bg: "#D1FAE5", fg: "#059669" },
  { id: "leads", name: "Leads", kind: "tool", icon: Target, bg: "#FFEDD5", fg: "#EA580C" },
  { id: "boss-bridge", name: "BoSS Bridge", kind: "tool", icon: Link2, bg: "#E2E8F0", fg: "#0B1B3B" },
];
