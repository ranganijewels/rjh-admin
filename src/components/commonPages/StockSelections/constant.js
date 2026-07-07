import { Switch } from "@/components/common/ui/switch";

export const STOCK_PRODUCT_DETAIL = [
  {
    id: "1101-01",
    title: "Engagement Ring",
    style: "Solitaire",
    collection: "Best Seller",
    category: "Sneakers",
    image: "/images/ring.png",
  },
  {
    id: "1101-01111",
    title: "Engagement",
    style: "Solitaire",
    collection: "Best Seller",
    category: "Sneakers",
    image: "/images/ring.png",
  },
];

export const STOCK_DETAIL = [
  {
    id: 1,
    variantsimg: "/images/products/vector.svg",
    name: "Round",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
  {
    id: 2,
    variantsimg: "/images/products/princess.svg",
    name: "Princess",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
  {
    id: 3,
    variantsimg: "/images/products/oval.svg",
    name: "Round",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
  {
    id: 4,
    variantsimg: "/images/products/cushion.svg",
    name: "Round",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
  {
    id: 5,
    variantsimg: "/images/products/radiant.svg",
    name: "Round",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
  {
    id: 6,
    variantsimg: "/images/products/pear.svg",
    name: "Round",
    baseprice: "$850.45 $950.45",
    defaultmargin: "10%",
    sellingprice: "$1050",
    metal: ["#D6B34C", "#D9D9D9", "#D8A083", "#E8E8E8"],
    active: <Switch size="sm" />,
  },
];

export const TOP_PERFORMING_STORE = [
  { label: "Niora", value: "$3,660", color: "#F1416C" },
  { label: "RJ House", value: "$1,820", color: "#50CD89" },
  { label: "Clara", value: "$250", color: "#E5E7EB" },
];

export const options = {
  chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
  colors: ["#22c55e", "#ef4444"],
  fill: { type: "solid", opacity: [0.1, 0.2] },
  stroke: { curve: "smooth", width: 2 },
  dataLabels: { enabled: false },
  legend: {
    position: "top",
    horizontalAlign: "left",
    markers: { radius: 12 },
  },
  xaxis: {
    categories: Array.from({ length: 14 }, (_, i) => i * 10),
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    min: 35,
    max: 120,
    tickAmount: 5,
    labels: { style: { fontSize: "12px" } },
  },
  tooltip: { shared: true, intersect: false },
};

export const series = [
  {
    name: "Views",
    data: [80, 90, 85, 70, 65, 60, 80, 90, 88, 100, 95, 85, 70, 65],
  },
  {
    name: "Orders",
    data: [60, 70, 65, 55, 50, 40, 60, 65, 66, 75, 70, 60, 50, 45],
  },
];

export const statistics = [
  { total: "8,924", description: "Total Views" },
  { total: "10,1,154", description: "Total Add-to-Carts" },
  { total: "397", description: "Total Orders" },
  { total: "4.45%", description: "Conversion Rate" },
  { total: "1.7%", description: "Return Rate" },
  { total: "2,310", description: "Most Viewed by Niora" },
  { total: "123", description: "Highest Seller RJ House" },
  { total: "38 Days", description: "Avg. Time Listed" },
  { total: "10", description: "Days Until Next Bill" },
  { total: "17 Aug, 2024", description: "Last Bill Date" },
  { total: "17 Aug, 2024", description: "Next Bill Date" },
];

export const tables = [
  {
    srNo: "1",
    material: "Metal",
    metal: "Gold",
    shape: "",
    quality: "14K",
    color: "R",
    size: "",
    setting: "",
    pieces: "",
    weight: "2.4",
    rate: "5798.28",
    amount: "13914.87",
  },
];

export const PRODUCTS_IMAGES = [
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
  "/images/products/1.png",
];

export const FILTERS_CONFIG = [
  {
    label: "Style",
    key: "style",
    options: ["Show all", "Modern", "Vintage", "Classic"],
  },
  {
    label: "Shape",
    key: "shape",
    options: ["Show all", "Round", "Oval", "Princess"],
  },
  {
    label: "Price Range",
    key: "price",
    options: ["Show all", "$0–10k", "$10k–25k", "$25k+"],
  },
];
