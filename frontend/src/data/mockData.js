// Isolated mock data for visual development mode when backend APIs are offline or loading

export const mockHistory = [
  {
    id: "convo-1",
    title: "Hybrid Work Location Guidelines",
    date: "2026-08-15T09:30:00Z",
    group: "Today",
    messages: [
      {
        id: "m-1",
        sender: "user",
        content: "What is the policy for working from home?",
        createdAt: "2026-08-15T09:28:00Z"
      },
      {
        id: "m-2",
        sender: "assistant",
        content: "According to the corporate hybrid work guideline (Section 3.1), employees are permitted to work remotely up to 2 days per week, subject to team manager approval. Core collaboration days in office are Tuesday and Thursday.",
        createdAt: "2026-08-15T09:29:00Z",
        sources: [
          {
            document_id: "doc-1",
            filename: "Company-Policy-and-Procedure-June-1.18-V6.0.pdf",
            page: 12,
            relevanceScore: 0.94,
            preview: "Section 3.1 Hybrid Guidelines: Employees are granted the option of remote working for a maximum of two (2) business days per calendar week. Tuesday and Thursday represent mandatory in-office core alignment days..."
          }
        ]
      }
    ]
  },
  {
    id: "convo-2",
    title: "Travel Expenses Approval Route",
    date: "2026-08-14T14:20:00Z",
    group: "Yesterday",
    messages: [
      {
        id: "m-3",
        sender: "user",
        content: "Who approves travel expense reports?",
        createdAt: "2026-08-14T14:18:00Z"
      },
      {
        id: "m-4",
        sender: "assistant",
        content: "Travel expense reports under $1,000 require approval from your direct line manager. Any expense exceeding $1,000 must also be routed to the departmental finance director for sign-off.",
        createdAt: "2026-08-14T14:20:00Z",
        sources: [
          {
            document_id: "doc-2",
            filename: "TCS-Global-Policy-Corporate-Social-Responsibility.pdf",
            page: 4,
            relevanceScore: 0.88,
            preview: "Article 4: Reimbursements. Reports under $1000 require line manager signature. Reports above $1000 must receive additional authorization from the Departmental Finance Director..."
          }
        ]
      }
    ]
  },
  {
    id: "convo-3",
    title: "Corporate Social Responsibility Projects",
    date: "2026-08-10T11:05:00Z",
    group: "Previous 7 days",
    messages: [
      {
        id: "m-5",
        sender: "user",
        content: "What are our key CSR initiatives?",
        createdAt: "2026-08-10T11:03:00Z"
      },
      {
        id: "m-6",
        sender: "assistant",
        content: "Our key CSR focus areas include environmental sustainability (reducing carbon footprint by 20% by 2028), local community development grants, and volunteer matching programs where the company matches up to 16 hours of paid volunteer time per employee annually.",
        createdAt: "2026-08-10T11:05:00Z",
        sources: [
          {
            document_id: "doc-2",
            filename: "TCS-Global-Policy-Corporate-Social-Responsibility.pdf",
            page: 2,
            relevanceScore: 0.91,
            preview: "Section 2 CSR Goals: The Group is committed to environmental initiatives, targeting a 20% reduction in net emissions by 2028. We matching volunteer hours up to 16 hours per fiscal year..."
          }
        ]
      }
    ]
  }
];

export const mockDocuments = [
  {
    id: "doc-1",
    filename: "Company-Policy-and-Procedure-June-1.18-V6.0.pdf",
    type: "pdf",
    size: 4885850,
    createdAt: "2026-08-01T10:00:00Z",
    status: "Indexed"
  },
  {
    id: "doc-2",
    filename: "TCS-Global-Policy-Corporate-Social-Responsibility.pdf",
    type: "pdf",
    size: 1368492,
    createdAt: "2026-08-02T11:30:00Z",
    status: "Indexed"
  },
  {
    id: "doc-3",
    filename: "Bird-Fact-Sheet-1.pdf",
    type: "pdf",
    size: 151763,
    createdAt: "2026-08-03T14:15:00Z",
    status: "Processing"
  },
  {
    id: "doc-4",
    filename: "2312.10997v5.pdf",
    type: "pdf",
    size: 1662567,
    createdAt: "2026-08-04T16:45:00Z",
    status: "Failed"
  }
];

export const mockSources = [
  {
    document_id: "doc-1",
    filename: "Company-Policy-and-Procedure-June-1.18-V6.0.pdf",
    page: 12,
    relevanceScore: 0.94,
    preview: "Section 3.1 Hybrid Guidelines: Employees are granted the option of remote working for a maximum of two (2) business days per calendar week. Tuesday and Thursday represent mandatory in-office core alignment days. The remote working schedule must be reviewed and approved by the line manager..."
  },
  {
    document_id: "doc-2",
    filename: "TCS-Global-Policy-Corporate-Social-Responsibility.pdf",
    page: 2,
    relevanceScore: 0.91,
    preview: "Section 2 CSR Goals: The Group is committed to environmental initiatives, targeting a 20% reduction in net emissions by 2028. We matching volunteer hours up to 16 hours per fiscal year. In addition, localized grants are allocated to regional community developers..."
  },
  {
    document_id: "doc-2",
    filename: "TCS-Global-Policy-Corporate-Social-Responsibility.pdf",
    page: 4,
    relevanceScore: 0.88,
    preview: "Article 4: Reimbursements. Reports under $1000 require line manager signature. Reports above $1000 must receive additional authorization from the Departmental Finance Director. Claims must be submitted within thirty (30) days..."
  }
];

export const mockSettings = {
  profile: { name: "Enterprise User", email: "user@enterprise.com" },
  appearance: { theme: "dark" },
  notifications: { email: true, push: false },
  aiPreferences: { model: "llama-3.3-70b-versatile", temperature: 0 },
  dataPreferences: { storeHistory: true }
};
