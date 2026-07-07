"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Switch } from "@/components/common/ui/switch";
import TodoCard from "./TodoCard";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const dummyChartData = [58, 64, 52, 45, 42, 38, 45, 53, 56, 65, 75, 85];

export const SalesOverview = () => {
  const [chartData, setChartData] = useState(dummyChartData);
  const categories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    setChartData(dummyChartData);
  }, []);

  const options = {
    series: [
      {
        name: "Earnings",
        data: chartData ?? [],
      },
    ],
    chart: {
      height: 250,
      type: "area",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: ["var(--color-primary)"],
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "var(--color-secondary-foreground)",
          fontSize: "12px",
        },
      },
      crosshairs: {
        position: "front",
        stroke: {
          color: "var(--color-primary)",
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: false,
        style: { fontSize: "12px" },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "var(--color-secondary-foreground)",
          fontSize: "12px",
        },
        formatter: (val) => `$${val}K`,
      },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const number = parseInt(series[seriesIndex][dataPointIndex]) * 1000;
        const monthName = categories[dataPointIndex];

        const formattedNumber = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(number);

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-sm text-secondary-foreground">${monthName}, 2024 Sales</div>
            <div class="flex items-center gap-1.5">
              <div class="font-semibold text-base text-mono">${formattedNumber}</div>
              <span class="rounded-full border border-green-200 font-medium dark:border-green-850 text-success-700 bg-green-100 dark:bg-green-950/30 text-[11px] leading-none px-1.25 py-1">+24%</span>
            </div>
          </div>
        `;
      },
    },
    markers: {
      size: 0,
      colors: "var(--color-white)",
      strokeColors: "var(--color-primary)",
      strokeWidth: 4,
      hover: { size: 8 },
    },
    fill: {
      gradient: {
        opacityFrom: 0.25,
        opacityTo: 0,
      },
    },
    grid: {
      borderColor: "var(--color-border)",
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
  };

  // Order Status
  const categoryLabels = ["Fulfilled", "In Transit", "Returned", "Cancelled"];

  const barColors = ["#3E97FF", "#50CD89", "#F6C000", "#F1416C"];

  const ChartCard = ({ title, subtitle, options, series, height }) => (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-2 ml-5 mt-5">
        {title}
      </h2>
      <h3 className="text-md text-gray-400 mb-2 ml-5 mt-2">{subtitle}</h3>
      <ApexChart options={options} series={series} type="bar" height={height} />
    </Card>
  );
  const [series1, setSeries1] = useState([{ data: [50, 40, 20, 10] }]);

  const chartOptions1 = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: "8px",
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      colors: barColors,
      xaxis: {
        categories: categoryLabels,
        min: 0,
        max: 50,
      },
      grid: { show: true },
      tooltip: { enabled: false },
      legend: {
        show: false,
        position: "bottom",
        horizontalAlign: "center",
        floating: false,
        itemMargin: {
          horizontal: 4,
          vertical: 0,
        },
        markers: {
          width: 12,
          height: 5,
          radius: 12,
        },
        labels: {
          useSeriesColors: false,
        },
      },
    }),
    []
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <div className="flex gap-5">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-update" className="text-sm">
                Referrals only
              </Label>
              <Switch id="auto-update" defaultChecked size="sm" />
            </div>
            <Select defaultValue="12">
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-28">
                <SelectItem value="1">1 month</SelectItem>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-end items-stretch grow px-3 py-1">
          <ApexChart
            id="earnings_chart"
            options={options}
            series={options.series}
            type="area"
            height={250}
          />
        </CardContent>
      </Card>

      <div className="w-full">
        <ChartCard
          title="Order Status"
          subtitle="8k social visitors"
          options={chartOptions1}
          series={series1}
          height={250}
        />
      </div>

      <div className="w-full">
        <TodoCard />
      </div>
    </div>
  );
};

export default SalesOverview;
