import { Layers, Link, Pin} from "lucide-react";

export const PENDING_TICKETS = [
  { label: "Glow", value: 4, color: "#22C55E" },
  { label: "Shine", value: 6, color: "#3B82F6" },
  { label: "Luxe", value: 5, color: "#E5E7EB" },
];

export const PRODUCTS_UPLOADED_TODAY = [
  { label: "Glow", value: 4, color: "#22C55E" },
  { label: "Shine", value: 6, color: "#3B82F6" },
  { label: "Luxe", value: 5, color: "#E5E7EB" },
];

export const TOP_PERFORMING_STORE = [
  { label: "Niora", value: "$3,660", color: "#22C55E", showDashed: true },
  { label: "RJ House", value: "$1,820", color: "#3B82F6" },
  { label: "Clara", value: "$250", color: "#E5E7EB" },
];

export const TOP_PERFORMING_ITEMS_TABLE = [
  {
    name: "Wedding Band",
    productId: "#XDG-2347",
    image: "/images/products/pm3.png",
    order: "50",
    price: "72.00",
  },
  {
    name: "Necklace",
    productId: "#XDG-1321",
    image: "/images/products/1.png",
    order: "50",
    price: "72.00",
  },
  {
    name: "Ring",
    productId: "#XDG-4312",
    image: "/images/products/product-gold.png",
    order: "50",
    price: "72.00",
  },
];

export const MARGIN_CHART = [
  {
    category: "Earrings",
    stats: 26,
    increase: true,
  },
  {
    category: "Rings",
    stats: 2,
    increase: false,
  },
  {
    category: "Bracelets",
    stats: 20,
    increase: true,
  },
];

export const ACTIVITIES = [
  {
    icon: Pin,
    description:
      "Invitation for crafting engaging designs that speak human workahop",
    link: {
      href: "/images/avatars/300-2.png",
    },
    timestamp: "Sent at 4:23 PM by",
  },
  {
    icon: Link,
    description: "3 New Incoming Project Files",
    link: {
      href: "/images/avatars/300-2.png",
    },
    timestamp: "Sent at 10:30 PM by",
  },
  {
    icon: Layers,
    description: "Task  merged with #45890 in “Ads Pro Admin Dashboard project",
    link: {
      href: "/images/avatars/300-3.jpg",
      label: "#45890",
    },
    timestamp: "Sent at 10:30 PM by",
  },
];

export const CUSTOM_JEWELRY_REQUEST = [
  { label: "Pending Quote", value: "4", color: "#22C55E", showDashed: true },
  { label: "Approval Pending", value: "6", color: "#3B82F6" },
  { label: "In Process", value: "5", color: "#E5E7EB" },
];

export const TOP_PERFORMING_PRODUCTS_HEADER = [
  {
    logo: "/brand-logo/beats-electronics.png",
    title: "Niora",
    checked: false,
  },
  {
    logo: "/brand-logo/clara.png",
    title: "RJ House",
    checked: true,
  },
  {
    logo: "/brand-logo/disqus.png",
    title: "Clara",
    checked: false,
  },
  {
    logo: "/brand-logo/plurk.png",
    title: "Zyra",
    checked: false,
  },
  {
    logo: "/brand-logo/spring.png",
    title: "Vexa",
    checked: false,
  },
];

export const EXTERNAL_LINKS = [
  {
    category: "Avg. Clients Rating",
  },
  {
    category: "Instagram Followers",
  },
  {
    category: "Google Ads CPS",
  },
];
