export type LifecycleStage = "GA" | "Beta" | "Sunset";

export type Product = {
  id: string;
  name: string;
  brand: string;
  dependencyCount: number;
  adoptionPct: number;
  usageTrend30d: number[];
  description: string;
  owner: string;
  technicalOwner: string;
  lifecycleStage: LifecycleStage;
  launchedOn: string;
};

export const products: Product[] = [
  { id: "boss", name: "BoSS", brand: "Sahayogi", dependencyCount: 6, adoptionPct: 91, usageTrend30d: [58, 60, 59, 63, 65, 64, 67, 69, 68, 71, 73, 75], description: "Business Operations & System Suite — HR, payroll, finance, inventory, CRM and compliance in one place.", owner: "Rhea S.", technicalOwner: "Arjun M.", lifecycleStage: "GA", launchedOn: "2023-02-01" },
  { id: "chat-sahayogi", name: "Chat with Sahayogi", brand: "Sahayogi", dependencyCount: 4, adoptionPct: 82, usageTrend30d: [45, 48, 46, 51, 54, 50, 56, 59, 55, 61, 64, 60], description: "WhatsApp Business API connected to Tally and Busy for order, invoice and reminder conversations.", owner: "Arjun M.", technicalOwner: "Priyanka R.", lifecycleStage: "GA", launchedOn: "2023-06-15" },
  { id: "sahayogi-one", name: "Sahayogi One", brand: "Sahayogi", dependencyCount: 5, adoptionPct: 88, usageTrend30d: [66, 67, 65, 69, 71, 70, 73, 75, 74, 77, 79, 80], description: "Unified workspace with shared identity and access management across every Sahayogi product.", owner: "Dev K.", technicalOwner: "Rahul K.", lifecycleStage: "GA", launchedOn: "2022-11-01" },
  { id: "sahayogi-cloud", name: "Sahayogi Cloud", brand: "Sahayogi", dependencyCount: 3, adoptionPct: 74, usageTrend30d: [40, 42, 41, 44, 46, 45, 48, 50, 49, 52, 54, 55], description: "Cloud infrastructure hosting Tally, Busy, VPS and dedicated servers on Indian data centres.", owner: "Dev K.", technicalOwner: "Dev K.", lifecycleStage: "GA", launchedOn: "2023-09-01" },
  { id: "tax-sahayogi", name: "Tax Sahayogi", brand: "Sahayogi", dependencyCount: 4, adoptionPct: 63, usageTrend30d: [28, 30, 29, 32, 35, 33, 37, 39, 36, 41, 43, 42], description: "AI-assisted tax compliance covering 130+ Indian regulatory acts.", owner: "Priya N.", technicalOwner: "Meera S.", lifecycleStage: "GA", launchedOn: "2024-01-10" },
  { id: "office-sahayogi", name: "Office Sahayogi", brand: "Sahayogi", dependencyCount: 2, adoptionPct: 58, usageTrend30d: [22, 24, 23, 26, 28, 27, 29, 31, 30, 33, 34, 35], description: "The AI-powered business doctor for Indian SMEs — operational consulting and system design.", owner: "Rhea S.", technicalOwner: "Dev K.", lifecycleStage: "Beta", launchedOn: "2024-07-01" },
  { id: "investor-sahayogi", name: "Investor Sahayogi", brand: "Sahayogi", dependencyCount: 3, adoptionPct: 45, usageTrend30d: [18, 19, 20, 21, 23, 22, 24, 26, 25, 27, 29, 28], description: "AMFI-registered financial planning for mutual funds, PMS, insurance, loans and wealth structuring.", owner: "Priya N.", technicalOwner: "Arjun M.", lifecycleStage: "Beta", launchedOn: "2024-10-01" },
  { id: "my-sahayogi", name: "My Sahayogi", brand: "Sahayogi", dependencyCount: 1, adoptionPct: 37, usageTrend30d: [12, 13, 12, 14, 16, 15, 17, 18, 17, 19, 20, 21], description: "Personal finance app for tracking finances, payslips and income records.", owner: "Arjun M.", technicalOwner: "Rahul K.", lifecycleStage: "Beta", launchedOn: "2025-02-15" },
  { id: "studio-sahayogi", name: "Studio Sahayogi", brand: "Sahayogi", dependencyCount: 2, adoptionPct: 29, usageTrend30d: [8, 9, 10, 9, 11, 12, 11, 13, 14, 13, 15, 16], description: "Creative operations platform for design, asset management and content workflows.", owner: "Rhea S.", technicalOwner: "Priyanka R.", lifecycleStage: "Beta", launchedOn: "2025-05-01" },
];

export const productKpis = {
  live: products.length,
  averageAdoptionPct: Math.round(products.reduce((sum, p) => sum + p.adoptionPct, 0) / products.length),
  workspacesNearLimit: 9,
};
