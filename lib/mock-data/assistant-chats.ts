export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatGroup = "Today" | "Yesterday" | "Previous 7 Days";

export type Conversation = {
  id: string;
  title: string;
  group: ChatGroup;
  messages: ChatMessage[];
};

export const CHAT_GROUP_ORDER: ChatGroup[] = ["Today", "Yesterday", "Previous 7 Days"];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Dashboard KPI Analysis",
    group: "Today",
    messages: [
      { id: "conv-1-m1", role: "user", content: "What do the dashboard KPIs mean?" },
      {
        id: "conv-1-m2",
        role: "assistant",
        content:
          "The Control Room KPIs summarize platform health, exceptions, commercial control, releases, security & compliance, and dependency status at a glance. Tap any tile to drill into its detail view.",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Pending Approvals",
    group: "Today",
    messages: [
      { id: "conv-2-m1", role: "user", content: "How do I drill into pending approvals?" },
      {
        id: "conv-2-m2",
        role: "assistant",
        content:
          "Open the Approvals section from the sidebar — each row links to the underlying request with full context and an audit trail.",
      },
    ],
  },
  {
    id: "conv-3",
    title: "Product Health",
    group: "Today",
    messages: [
      { id: "conv-3-m1", role: "user", content: "Which products are currently degraded?" },
      {
        id: "conv-3-m2",
        role: "assistant",
        content: "Two products are showing a degraded status this week — check the Products list for the full breakdown by severity.",
      },
    ],
  },
  {
    id: "conv-4",
    title: "Incident Investigation",
    group: "Yesterday",
    messages: [
      { id: "conv-4-m1", role: "user", content: "Can I filter incidents by their current status?" },
      {
        id: "conv-4-m2",
        role: "assistant",
        content:
          "Yes — use the status filter in the toolbar above any incident table to narrow the list to open, investigating, or resolved items.",
      },
    ],
  },
  {
    id: "conv-5",
    title: "Compliance Summary",
    group: "Yesterday",
    messages: [
      { id: "conv-5-m1", role: "user", content: "Summarize this week's compliance posture." },
      {
        id: "conv-5-m2",
        role: "assistant",
        content: "Compliance & Risk shows all controls passing review this week, with one privacy request still pending sign-off.",
      },
    ],
  },
  {
    id: "conv-6",
    title: "Audit Report",
    group: "Previous 7 Days",
    messages: [
      { id: "conv-6-m1", role: "user", content: "How can I export the audit trail?" },
      {
        id: "conv-6-m2",
        role: "assistant",
        content: "From Audit Explorer, apply your filters and use the export action in the table toolbar to download the current view.",
      },
    ],
  },
  {
    id: "conv-7",
    title: "Product Analysis",
    group: "Previous 7 Days",
    messages: [
      { id: "conv-7-m1", role: "user", content: "How can I customize the dashboard view?" },
      {
        id: "conv-7-m2",
        role: "assistant",
        content: "Most tiles support reordering and tab-level filters — look for the toolbar controls at the top of each section.",
      },
    ],
  },
];
