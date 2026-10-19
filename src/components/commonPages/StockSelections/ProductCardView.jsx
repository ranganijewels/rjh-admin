"use client";


import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { PRODUCTS_IMAGES } from "./constant";
import ReactApexChart from "react-apexcharts";
import MetricBreakdownCard from "@/components/common/ui/cards/MetricBreakdownCard";
import { Button } from "@/components/common/ui/button";
import { CalendarRangeIcon } from "lucide-react";


const TOP_PERFORMING_STORE = [
  {
    label: "Niora",
    value: "$3,660",
    color: "#F1416C"
  },
  {
    label: "RJ House",
    value: "$1,820",
    color: "#50CD89"
  },
  {
    label: "Clara",
    value: "$250",
    color: "#E5E7EB"
  }
];


const options = {
  chart: {
    type: "area",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#22c55e", "#ef4444"],
  fill: {
    type: "solid",
    opacity: [0.1, 0.2],
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  dataLabels: { enabled: false },
  legend: {
    position: "top",
    horizontalAlign: "left",
    markers: {
      radius: 12,
    },
  },
  xaxis: {
    categories: Array.from({ length: 14 }, (_, i) => i * 10),
    labels: {
      style: { fontSize: "12px" },
    },
  },
  yaxis: {
    min: 35,
    max: 120,
    tickAmount: 5,
    labels: {
      style: { fontSize: "12px" },
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
  },
};

const series = [
  {
    name: "Views",
    data: [80, 90, 85, 70, 65, 60, 80, 90, 88, 100, 95, 85, 70, 65],
  },
  {
    name: "Orders",
    data: [60, 70, 65, 55, 50, 40, 60, 65, 66, 75, 70, 60, 50, 45],
  },
];

const ProductCardView = ({ open, closeProductDetailSheet, product }) => {
  const productData = product || {
    designNo: "N/A",
    category: "N/A",
    style: "N/A",
    shape: "N/A",
    plan: "N/A",
    collection: "N/A",
    basePrice: "N/A",
    gender: "N/A",
    createdAt: "N/A",
    lastUpdatedDate: "N/A",
    grossWeight: "N/A",
    netWeight: "N/A",
    diamondWeight: "N/A",
    diamondPiece: "N/A",
    metals: "N/A",
    diamond: "N/A",
    laborRate: "N/A",
    laborPrice: "N/A",
    totalPrice: "N/A",
    active: "Yes"
  };

  const detailsArray = [
    { text: "Design No", info: productData.designNo },
    { text: "Category", info: productData.category },
    { text: "Style", info: productData.style },
    { text: "Shape", info: productData.shape },
    { text: "Plan", info: productData.plan },
    { text: "Collection", info: productData.collection },
    { text: "Base Price", info: productData.basePrice },
    { text: "Gender", info: productData.gender },
    { text: "Created At", info: productData.createdAt },
    { text: "Last Updated", info: productData.lastUpdatedDate },
    { text: "Gross Weight", info: productData.grossWeight },
    { text: "Net Weight", info: productData.netWeight },
    { text: "Diamond Weight", info: productData.diamondWeight },
    { text: "Diamond Piece", info: productData.diamondPiece },
    { text: "Metals", info: productData.metals },
    { text: "Diamond", info: productData.diamond },
    { text: "Labor Rate", info: productData.laborRate },
    { text: "Labor Price", info: productData.laborPrice },
    { text: "Total Price", info: productData.totalPrice },
  ];

  const tables = [
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

  const statistics = [
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

  const renderItem = (table, index) => (
    <TableRow key={index}>
      <TableCell className="text-sm text-foreground">{table.srNo}</TableCell>
      <TableCell className="lg:text-end">{table.material}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.metal}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.shape}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.quality}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.color}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.size}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.setting}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.pieces}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.weight}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">{table.rate}</TableCell>
      <TableCell className="text-sm text-foreground lg:text-end">${table.amount}</TableCell>
    </TableRow>
  );

  const renderProductPerformance = (statistic, index) => (
    <div
      key={index}
      className="flex flex-col gap-1.5 px-2.75 py-2.25 border border-dashed border-input rounded-md"
    >
      <span className="text-mono text-sm leading-none font-medium">
        {statistic.total}
      </span>
      <span className="text-secondary-foreground text-xs">
        {statistic.description}
      </span>
    </div>
  );

  const handleButtonClick = () => {
    console.log("Navigate to date selector");
  };

  return (
    <Sheet open={open} onOpenChange={closeProductDetailSheet}>
      <SheetContent
        handleClose={closeProductDetailSheet}
        className="sm:w-none md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] inset-5 start-auto h-auto rounded-lg p-0">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle>Product Info</SheetTitle>
        </SheetHeader>
        <SheetBody className="px-3 md:px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3">
            <Card className="flex flex-col space-y-3 p-5">
              {/* Product top row */}
              <div className="text-base font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label>Cloud Shift Lightweight Runner Pro Edition</label>
                <span className="text-[14px] font-medium flex gap-[10px] items-center">
                  Active {productData.active}
                </span>
              </div>
              <span className="text-sm font-normal text-foreground block mb-7">
                Lightweight and stylish, these sneakers offer all-day comfort
                with breathable mesh, cushioned soles, and a durable grip.
                Perfect for casual wear, workouts, or daily adventures.
                Available in multiple colors and sizes.
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 lg:mb-11">
                {detailsArray.map((item, index) => (
                  <div className="flex items-center gap-2.5" key={index}>
                    <span className="text-[12px] font-[400] text-foreground min-w-14 xl:min-w-24 shrink-0">
                      {item.text}
                    </span>
                    <div className="text-[14px] font-[500]">{item.info}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-5 h-10">Sr No.</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Material</TableHead>
                      <TableHead className="min-w-30 text-end h-10">Metal</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Shape</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Quality</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Color</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Size</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Setting</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Pieces</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Weight</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Rate</TableHead>
                      <TableHead className="min-w-16 text-end h-10">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map((table, index) => renderItem(table, index))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Products images */}
            <div className="flex flex-wrap gap-4 md:gap-5 my-6 md:my-8 justify-center md:justify-start">
              {PRODUCTS_IMAGES && PRODUCTS_IMAGES.map((image, index) => (
                <div
                  className="w-[120px] h-[120px] md:w-[144px] md:h-[144px] p-[10px] bg-[#FCFCFC]"
                  key={index}
                >
                  <img src={image} className="w-full h-full object-contain" alt={`Product ${index + 1}`} />
                </div>
              ))}
            </div>

            {/* Store Usage Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Store Usage Overview</CardTitle>
                </CardHeader>
                <CardContent className="kt-scrollable-x-auto p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-black">
                          <TableHead className="min-w-5 h-10">Sr No.</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Material</TableHead>
                          <TableHead className="min-w-30 text-end h-10">Metal</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Shape</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Quality</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Color</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Size</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Setting</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Pieces</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Weight</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Rate</TableHead>
                          <TableHead className="min-w-16 text-end h-10">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tables.map((table, index) => renderItem(table, index))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Performance Overview */}
            <div className="my-[38px]">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center flex-wrap gap-3 lg:gap-5 mb-6">
                    {statistics.map((statistic, index) => renderProductPerformance(statistic, index))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mt-6">
                    {/* Left: Chart */}
                      <div className="flex flex-col">
                        <div className="space-y-4 bg-white dark:bg-card p-6  flex flex-wrap justify-between">
                          <h2 className="text-base font-semibold">Trend Graph</h2>
                          <Button variant="outline" onClick={handleButtonClick}>
                            30 Jan 2025
                            <CalendarRangeIcon/>
                          </Button>
                        </div>
                        <ReactApexChart
                          options={options}
                          series={series}
                          type="area"
                          height={300}
                        />
                      </div>
                  
                    {/* Right: Metric Breakdown */}
                    <div className="p-6 rounded-lg flex flex-col justify-between w-[260px] h-[220px]">
                      <MetricBreakdownCard
                        total="18,325"
                        isCurrency={true}
                        title="Top Performing Store"
                        badgeValue="+2.2%"
                        badgeProps={{
                          variant: "success",
                          appearance: "outline",
                          size: "sm",
                        }}
                        items={TOP_PERFORMING_STORE}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export { ProductCardView, ApexChart };