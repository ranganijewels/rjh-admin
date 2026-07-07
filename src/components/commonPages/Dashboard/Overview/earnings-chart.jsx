"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Badge } from "@/components/common/ui/badge";
import dynamic from "next/dynamic";
import { CalendarRangeIcon } from "lucide-react";
import { Button } from "@/components/common/ui/button";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Hardcoded dummy data for the earnings chart
const dummyChartData = [58, 64, 52, 45, 42, 38, 45, 53, 56, 65, 75, 85];

const EarningsChart = () => {
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
    // No need to fetch data, just use the dummy data directly
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
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: ["var(--color-primary)"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
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
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "var(--color-secondary-foreground)",
          fontSize: "12px",
        },
        formatter: (defaultValue) => {
          return `$${defaultValue}K`;
        },
      },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const number = parseInt(series[seriesIndex][dataPointIndex]) * 1000;
        const month = w.globals.seriesX[seriesIndex][dataPointIndex];
        const monthName = categories[month];

        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });

        const formattedNumber = formatter.format(number);

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
      strokeOpacity: 1,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: "circle",
      offsetX: 0,
      offsetY: 0,
      onClick: undefined,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
        size: 8,
        sizeOffset: 0,
      },
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
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const handleButtonClick = () => {
    console.log("Navigate to date selector");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
          <div className="flex gap-5">
            <div className="space-y-4 bg-white p-6  flex flex-wrap justify-between">
              <Button variant="outline" onClick={handleButtonClick}>
                9 Jan 2023 - 7 Feb 2023
                <CalendarRangeIcon />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-end items-stretch grow px-3 py-1">
          <div className="flex flex-col gap-2 p-5">
            <div className="flex items-center gap-[7px]">
              {" "}
              <span className="text-3xl font-semibold">$12,706</span>
              <Badge variant="success" appearance="outline">
                4.5%
              </Badge>
            </div>
            <span className="text-sm font-medium text-secondary-foreground">
              Transactions in April
            </span>
          </div>
          <ApexChart
            id="earnings_chart"
            options={options}
            series={options.series}
            type="area"
            height="250"
          />
        </CardContent>
      </Card>
    </>
  );
};

export { EarningsChart };
