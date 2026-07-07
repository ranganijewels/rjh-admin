// import { RiCurrencyFill, RiStore2Line } from "@remixicon/react";
import {
  RiStore2Line,
  RiCurrencyFill,
  RiPriceTag2Fill,
  RiPriceTag2Line,
  RiCommunityFill,
  RiCommunityLine,
  RiLoopLeftLine,
} from "@remixicon/react";
import {
  AlertCircle,
  ArrowUpNarrowWideIcon,
  Award,
  Badge,
  Bell,
  Bitcoin,
  Bolt,
  Book,
  BookCopy,
  Briefcase,
  Building,
  CalendarCheck,
  Captions,
  ChartNoAxesCombined,
  CheckCircle,
  Code,
  Codepen,
  Coffee,
  CurrencyIcon,
  File as DocumentIcon,
  Euro,
  Eye,
  File,
  FileQuestion,
  FileText,
  Flag,
  Gem,
  Ghost,
  Gift,
  Grid,
  Heart,
  HelpCircle,
  Kanban,
  Key,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  LineChart,
  ListChecks,
  MessageSquare,
  MessagesSquare,
  Monitor,
  Network,
  Users as PeopleIcon,
  PieChart,
  Plug,
  ScrollText,
  Settings,
  Share2,
  Shield,
  ShieldUser,
  ShoppingCart,
  SquareMousePointer,
  Star,
  Store,
  Theater,
  TrendingUp,
  UserCheck,
  UserCircle,
  UserRoundCogIcon,
  Users,
  Briefcase as WorkIcon,
  Wrench,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar is organised into EVERYDAY groups (top level) + two collapsed parents
// ("Advanced / Enterprise" and "Settings") that tuck away the enterprise/setup
// tools. Every feature is still reachable — nothing was removed — but the daily
// view stays clean. The menu renderer (SidebarMenu.jsx) is recursive, so a group
// can itself contain groups (two-level nesting) with no component changes.
// ─────────────────────────────────────────────────────────────────────────────
export const MENU_SIDEBAR = [
  // ── Everyday ───────────────────────────────────────────────────────────────
  {
    title: "Product Management",
    icon: RiStore2Line,
    children: [
      { title: "Product List", path: "/dashboard/product-management/my-products" },
      { title: "Product Groups", path: "/dashboard/product-management/groups" },
      { title: "Manage Collection", path: "/dashboard/product-management/manage-collection" },
    ],
  },
  {
    title: "Pricing Engine",
    icon: RiPriceTag2Line,
    children: [
      { title: "Price Preview", path: "/dashboard/pricing/price-preview" },
      { title: "Metal Rates", path: "/dashboard/pricing/metal-rates" },
      { title: "Diamond Rates", path: "/dashboard/pricing/diamond-rates" },
      // Diamond → Metal Weight is managed PER PRODUCT in the Add/Edit Product form
      // (Carat → Metal Weight table), not globally — so it's not in this menu.
      { title: "Labor / Making", path: "/dashboard/pricing/labor-rates" },
      { title: "Tax Configuration", path: "/dashboard/pricing/tax-rates" },
      { title: "Shipping Rates", path: "/dashboard/pricing/shipping-rates" },
      { title: "Additional Charges", path: "/dashboard/pricing/additional-charges" },
      { title: "Price Books (B2B/Wholesale)", path: "/dashboard/pricing/price-books" },
    ],
  },
  {
    title: "Order Management",
    icon: ListChecks,
    children: [
      { title: "All Orders", path: "/dashboard/order-management/all" },
      { title: "Return/ Repair Orders", path: "/dashboard/order-management/return-repair" },
    ],
  },
  {
    title: "Custom Jewelry",
    icon: ArrowUpNarrowWideIcon,
    children: [
      { title: "All Custom Requests", path: "/dashboard/custom-jewelary/all-custom-request" },
    ],
  },
  {
    title: "Customer Data",
    icon: Users,
    children: [{ title: "All Customers", path: "/dashboard/customer-data" }],
  },
  {
    title: "Coupons Management",
    icon: Gift,
    children: [{ title: "Coupons", path: "/dashboard/coupons-management" }],
  },
  {
    title: "Communication",
    icon: MessagesSquare,
    children: [
      { title: "Live Chat", path: "/dashboard/communication/live-chat" },
      { title: "Support Inbox", path: "/dashboard/support" },
    ],
  },
  {
    title: "CMS",
    icon: Layout,
    children: [{ title: "RJ House CMS", path: "/dashboard/cms" }],
  },

  // ── Advanced / Enterprise (collapsed by default) ─────────────────────────────
  {
    title: "Advanced (Enterprise)",
    icon: Building,
    children: [
      {
        title: "Catalog & Configurator",
        icon: Gem,
        children: [
          { title: "Catalog Masters", path: "/dashboard/catalog/masters" },
          { title: "Product Families", path: "/dashboard/catalog/families" },
          { title: "Bill of Materials", path: "/dashboard/catalog/boms" },
        ],
      },
      {
        title: "Sales & B2B",
        icon: ShoppingCart,
        children: [
          { title: "B2B Accounts", path: "/dashboard/enterprise/accounts" },
          { title: "Quotes", path: "/dashboard/enterprise/quotes" },
        ],
      },
      {
        title: "PIM · DAM · SEO",
        icon: Network,
        children: [
          { title: "PIM Attributes", path: "/dashboard/enterprise/pim-attributes" },
          { title: "DAM Assets", path: "/dashboard/enterprise/dam-assets" },
          { title: "SEO Landing Pages", path: "/dashboard/enterprise/seo-pages" },
        ],
      },
      {
        title: "Manufacturing",
        icon: Wrench,
        children: [
          { title: "Work Centers", path: "/dashboard/enterprise/work-centers" },
          { title: "Production Orders", path: "/dashboard/enterprise/production-orders" },
        ],
      },
      {
        title: "After-Sales & Reviews",
        icon: Shield,
        children: [
          { title: "Warranties", path: "/dashboard/enterprise/warranties" },
          { title: "Service Requests", path: "/dashboard/enterprise/service-requests" },
          { title: "Returns / RMA", path: "/dashboard/enterprise/returns" },
          { title: "Reviews Moderation", path: "/dashboard/enterprise/reviews" },
          { title: "Event Log", path: "/dashboard/enterprise/events" },
        ],
      },
    ],
  },

  // ── Settings & Setup (collapsed by default) ──────────────────────────────────
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Currency & Countries",
        icon: CurrencyIcon,
        children: [
          { title: "Currency Management", path: "/dashboard/currency-management" },
        ],
      },
      {
        title: "Users & Roles",
        icon: RiLoopLeftLine,
        children: [
          { title: "All Users List", path: "/dashboard/all-user-list" },
          { title: "Roles & Access", path: "/dashboard/users-roles" },
          { title: "Departments", path: "/dashboard/department" },
        ],
      },
    ],
  },
];
