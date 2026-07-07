export const FORM_WIZARD_MENU = [
  { title: "Business Details", path: "/business-details" },
  { title: "Branding", path: "/branding" },
  { title: "Website Preferences", path: "/website-preferences" },
  { title: "Product Categories", path: "/product-categories" },
  { title: "Stock Selections", path: "/stock-selections" },
  // "Margin Setup" removed — margins/pricing are now handled by the Pricing Engine
  // (Admin → Pricing Engine), and the legacy margin-setup wizard page was archived.
  {
    title: "Store Settings & Launch Prep",
    path: "/store-settings-launch-prep",
  },
  { title: "Final Review", path: "/final-review" },
];

export const THEME_CUSTOMIZATION_MENU = [
  {
    title: "Website Theme & Layout Customization",
    path: "/theme-customization",
  },
  { title: "Content Branding", path: "/content-branding" },
  { title: "Policies & Customer Assurance", path: "/policies" },
  {
    title: "Product Shopping Experience",
    path: "/product-shopping-experience",
  },
  { title: "Customer Engagement", path: "/customer-engagement" },
];

export const DASHBOARD_MENU = [
  {
    title: "Dashboard",
    path: "/overview",
    // Children: [
    //   { title: "OverView", path: "/overview" },
    //   { title: "Sales Trends & Graphs", path: "/sales-trends-graphs" },
    //   {
    //     title: "Store Setup Progress Tracker",
    //     path: "/store-setup-progress-tracker",
    //   },
    //   { title: "Recent Orders Summary", path: "/recent-orders-summary" },
    // ],
  },
  // { Heading: "overview", path: "/overview" },
  // {
  //   title: "Product Management",
  //   children: [
  //     {
  //       title: "My Products",
  //       path: "/overview",
  //       children: [
  //         { title: "Product List", path: "/product-categories" },
  //         { title: "Edit Product Info", path: "/product-categories" },
  //         { title: "Product Detail View", path: "/product-categories" },
  //       ],
  //     },
  //     {
  //       title: "Browse Other Products",
  //       path: "/browse-other-products",
  //     },
  //     {
  //       title: "Product History & Logs",
  //       path: "/product-history-logs",
  //     },
  //   ],
  // },
  // {
  //   title: "Pricing & Margins",
  //   icon: LayoutDashboard,
  //   children: [
  //     {
  //       title: "Apply Margin",
  //       path: "/apply-margin",
  //       children: [
  //         { title: "By Category", path: "/by-category" },
  //         { title: "By Individual Product", path: "/by-individual-product" },
  //       ],
  //     },
  //     { title: "Real-Time Price Preview", path: "/real-time-price-preview" },
  //     { title: "Margin Rules & Limits", path: "/margin-rules-limits" },
  //   ],
  // },
  // {
  //   title: "Order Management",
  //   icon: ListChecks,
  //   children: [
  //     { title: "All Orders", path: "/orders/all" },
  //     { title: "Fulfilled Orders", path: "/orders/fulfilled" },
  //     { title: "In Transit Orders", path: "/orders/in-transit" },
  //     { title: "All Orders", path: "/orders/all" },
  //     { title: "Return/ Repair Orders", path: "/orders/return-repair" },
  //     { title: "Manual Order Entry", path: "/orders/manual=order-entry" },
  //     { title: "Invoices & Receipts", path: "/orders/invoices-receipts" },
  //   ],
  // },
  // {
  //   title: "Custom Jewelry",
  //   icon: Gem,
  //   children: [
  //     { title: "All Custom Requests", path: "/custom-request" },
  //     { title: "Request Details View", path: "/request-details" },
  //     { title: "Quotation and CAD File", path: "/quotation-cad" },
  //     { title: "Communication", path: "/communication" },
  //   ],
  // },
  // {
  //   title: "Content & Branding",
  //   icon: PieChart,
  //   children: [
  //     { title: "Store Branding", path: "/store-branding" },
  //     { title: "Request Website Content", path: "/request-website-content" },
  //   ],
  // },
  // {
  //   title: "Customers & Com",
  //   icon: PieChart,
  //   children: [
  //     { title: "Customer Inbox", path: "/customer-inbox" },
  //     { title: "Notifications", path: "/notifications" },
  //     {
  //       title: "Jewel Label Announcements",
  //       path: "/jewel-label-announcements",
  //     },
  //   ],
  // },
  // {
  //   title: "Reports & Analytics",
  //   icon: PieChart,
  //   children: [
  //     { title: "Sales Reports", path: "/sales-reports" },
  //     {
  //       title: "Product Performance Metrics",
  //       path: "/product-performance-metrics",
  //     },
  //     { title: "Revenue Breakdown", path: "/revenue-breakdown" },
  //     { title: "Low Performing Products", path: "/low-performing-products" },
  //   ],
  // },
  // {
  //   title: "Settings & Permissions",
  //   icon: PieChart,
  //   children: [
  //     { title: "Store Profile", path: "/store-profile" },
  //     { title: "Team Member Management", path: "/team-member-management" },
  //     { title: "Custom Domain Settings", path: "/custom-domain-settings" },
  //     { title: "Store Preferences", path: "/store-preferences" },
  //   ],
  // },
  // {
  //   title: "Support & Help",
  //   icon: PieChart,
  //   children: [
  //     { title: "Support Ticket", path: "/support-ticket" },
  //     { title: "Live Chat Support", path: "/live-chat-support" },
  //     {
  //       title: "Help Center / Documentation",
  //       path: "/help-center-documentation",
  //     },
  //     { title: "Tutorial Videos", path: "/tutorial-videos" },
  //   ],
  // },
];
