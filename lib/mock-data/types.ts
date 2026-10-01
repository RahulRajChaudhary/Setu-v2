export type StatusLevel = "healthy" | "warning" | "critical" | "info" | "neutral";

export type Severity = "low" | "medium" | "high" | "critical";

export type ApprovalItem = {
  id: string;
  type: string;
  title: string;
  requester: string;
  impact: string;
  owner: string;
  deadline: string;
  severity: Severity;
  reason: string;
  reference: string;
  before: string;
  after: string;
};

export type AreaTile = {
  id: string;
  label: string;
  status: StatusLevel;
  cause: string;
  href: string;
};

export type RiskRow = {
  id: string;
  label: string;
  owner: string;
  likelihood: number;
  impact: number;
  treatmentStatus: string;
  dueDate: string;
  code?: string;
  productId?: string;
};
