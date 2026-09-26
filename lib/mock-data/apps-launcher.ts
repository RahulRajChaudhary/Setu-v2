import type { LucideIcon } from "lucide-react";
import { Sparkles, Mail, HardDrive, Users, Target, Link2 } from "lucide-react";

export type LauncherApp = {
  id: string;
  name: string;
  kind: "product" | "tool";
  category: string;
  description?: string;
  /** Real Sahayogi products only — fetched from sahayogi.in/products */
  logoUrl?: string;
  /** Internal-only tools only — no official logo exists */
  icon?: LucideIcon;
  bg?: string;
  fg?: string;
  /** Real Sahayogi products only — opens in a new tab when clicked */
  liveUrl?: string;
  /** Hidden from the launcher entirely when false. Defaults to true if omitted. */
  enabled?: boolean;
};

export const LAUNCHER_APPS: LauncherApp[] = [
  {
    id: "office-sahayogi",
    name: "Office Sahayogi",
    kind: "product",
    category: "Consulting",
    description: "The AI-powered business doctor for Indian SMEs — operational consulting and system design.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Office%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/office-sahayogi",
  },
  {
    id: "boss",
    name: "BoSS",
    kind: "product",
    category: "Operations",
    description: "Business Operations & System Suite — HR, payroll, finance, inventory, CRM and compliance in one place.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/BoSS.png",
    liveUrl: "https://sahayogi.in/products/boss",
  },
  {
    id: "sahayogi-cloud",
    name: "Sahayogi Cloud",
    kind: "product",
    category: "Cloud",
    description: "Your entire business on cloud, anytime, anywhere — Tally/Busy on Cloud, VPS, dedicated servers.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%20Cloud.png",
    liveUrl: "https://sahayogi.in/products/cloud-sahayogi",
  },
  {
    id: "chat-with-sahayogi",
    name: "Chat with Sahayogi",
    kind: "product",
    category: "Communication",
    description: "WhatsApp Business API connected to Tally and Busy for order, invoice and reminder conversations.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Chat%20With%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/chat-with-sahayogi",
  },
  {
    id: "investor-sahayogi",
    name: "Investor Sahayogi",
    kind: "product",
    category: "Finance",
    description: "AMFI-registered financial planning for mutual funds, PMS, insurance, loans and wealth structuring.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Investor%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/investor-sahayogi",
  },
  {
    id: "tax-sahayogi",
    name: "Tax Sahayogi",
    kind: "product",
    category: "Compliance",
    description: "AI-assisted tax compliance covering 130+ Indian regulatory acts.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Tax%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/tax-sahayogi",
  },
  {
    id: "sahayogi-one",
    name: "Sahayogi One",
    kind: "product",
    category: "Workspace",
    description: "The workspace where every Sahayogi product connects — shared identity and access.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%20One.png",
    liveUrl: "https://sahayogi.in/products/sahayogi-one",
  },
  {
    id: "my-sahayogi",
    name: "My Sahayogi",
    kind: "product",
    category: "Personal Finance",
    description: "Your financial life, in one app — track finances, payslips and income records.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/My%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/my-sahayogi",
  },
  {
    id: "studio-sahayogi",
    name: "Studio Sahayogi",
    kind: "product",
    category: "Creative",
    description: "Creative operations platform for design, asset management and content workflows.",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Studio%20Sahayogi.png",
    liveUrl: "https://sahayogi.in/products/studio-sahayogi",
  },
  {
    id: "sahayogi-ai",
    name: "Sahayogi AI",
    kind: "tool",
    category: "AI",
    description: "AI assistant across your Sahayogi workspace.",
    icon: Sparkles,
    bg: "#EDE9FE",
    fg: "#7C3AED",
  },
  {
    id: "mail",
    name: "Mail",
    kind: "tool",
    category: "Communication",
    description: "Email inbox for your workspace.",
    icon: Mail,
    bg: "#FEE2E2",
    fg: "#DC2626",
  },
  {
    id: "drive",
    name: "Drive",
    kind: "tool",
    category: "Storage",
    description: "File storage and sharing.",
    icon: HardDrive,
    bg: "#DBEAFE",
    fg: "#2563EB",
  },
  {
    id: "team",
    name: "Team",
    kind: "tool",
    category: "People",
    description: "Team directory and org chart.",
    icon: Users,
    bg: "#D1FAE5",
    fg: "#059669",
  },
  {
    id: "leads",
    name: "Leads",
    kind: "tool",
    category: "Sales",
    description: "Sales pipeline and lead tracking.",
    icon: Target,
    bg: "#FFEDD5",
    fg: "#EA580C",
  },
  {
    id: "boss-bridge",
    name: "BoSS Bridge",
    kind: "tool",
    category: "Integration",
    description: "Sync layer between BoSS and other Sahayogi products.",
    icon: Link2,
    bg: "#E2E8F0",
    fg: "#0B1B3B",
  },
];
