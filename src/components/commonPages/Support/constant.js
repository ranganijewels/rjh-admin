export const dummyTickets = [
  {
    id: "TK-001",
    subject: "Product sync failing for custom rings",
    store: "Brilliant Diamonds NYC",
    department: "Web - Tech Support",
    priority: "high",
    status: "open",
    assignedTo: {
      id: "mike01",
      name: "Mike Chen",
    },
    ccUsers: [{ id: "cc1", name: "Jane Doe" }],
    messages: [
      {
        id: "msg-1a",
        name: "Sarah Johnson",
        role: "Store Manager",
        timestamp: "6/27/2025, 2:30:00 PM",
        message:
          "Our custom ring products are not syncing properly to the main catalog. Getting error codes 403 when trying to upload new designs.",
        attachments: [
          {
            name: "error.png",
            url: "./images/products/1.png",
          },
        ],
      },
      {
        id: "msg-1b",
        name: "Sarah Johnson",
        role: "Store Manager",
        timestamp: "6/27/2025, 2:35:00 PM",
        message: "The sync has been failing for the past 3 hours.",
      },
      {
        id: "msg-1c",
        name: "Mike Chen",
        role: "Technical Support Specialist",
        description: "Internal",
        timestamp: "6/27/2025, 2:40:00 PM",
        message:
          "We are currently working on resolving the issue. Please check back later.",
      },
    ],
    attachments: [{ name: "log.txt" }],
    assignmentHistory: [{ isAutoAssigned: true }],
    createdBy: { name: "Sarah Johnson" },
    createdAt: "2025-06-27T10:00:00Z",
    slaDeadline: "2025-06-28T10:00:00Z",
  },
  {
    id: "TK-002",
    subject: "Missing order notifications",
    store: "Golden Gate Jewelry",
    department: "Order Related Support",
    priority: "medium",
    status: "in-progress",
    assignedTo: {
      id: "user001",
      name: "Kevin Zhang",
    },
    ccUsers: [{ id: "cc2", name: "John Doe" }],
    messages: [
      {
        id: "msg-2a",
        name: "Alex Rivera",
        role: "Store Admin",
        timestamp: "6/26/2025, 7:30:00 PM",
        message:
          "Customers are not receiving order confirmation emails for the past week.",
      },
      {
        id: "msg-2b",
        name: "Alex Rivera",
        role: "Store Admin",
        timestamp: "6/26/2025, 7:30:00 PM",
        message:
          "Multiple customers have called asking about their order confirmations. This started happening around June 20th.",
      },
      {
        id: "msg-2c",
        name: "Kevin Zhang",
        role: "Order Support Specialist",
        timestamp: "6/27/2025, 1:45:00 PM",
        message:
          "I've identified the issue - there was a configuration change in your email service. I'm working with the technical team to restore the settings.",
      },
    ],
    attachments: [{ name: "log.txt" }],
    assignmentHistory: [],
    createdBy: { name: "Alex Rivera" },
    createdAt: "2025-06-26T12:30:00Z",
    slaDeadline: "2025-06-30T12:30:00Z",
  },
];
