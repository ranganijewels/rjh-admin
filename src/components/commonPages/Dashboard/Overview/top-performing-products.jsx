"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import React, { Fragment } from "react";
import { EarningsChart } from "./earnings-chart";
import { DropdownMenu4 } from "@/components/partials/dropdown-menu-4";
import { Button } from "@/components/common/ui/button";
import { ArrowDown, ArrowUp, EllipsisVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/common/ui/table";
import GenericListCard from "@/components/common/ui/cards/GenericListCard";
import { MARGIN_CHART } from "./constant";

const renderRow = (row, index) => {
  return (
    <Fragment key={index}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center text-sm font-medium text-foreground gap-2 sm:gap-4 lg:gap-6">
          <span className="text-left sm:text-right">{row.brand}</span>
          <span className="text-left sm:text-right">{row.category}</span>
          <span className="flex items-center justify-end gap-1">
            {row.increase ? (
              <ArrowUp className="text-green-500 size-4" />
            ) : (
              <ArrowDown className="text-destructive size-4" />
            )}
            {row.stats}%
          </span>
        </div>
      </div>
      <div className="border-b border-dashed border-gray-200"></div>
    </Fragment>
  );
};

const renderTopItemRow = (item, index) => (
  <TableRow key={index}>
    <TableCell className="text-sm font-medium">
      <div className="flex gap-2.5">
        <img
          src={item.image}
          alt={item.name || "Product"}
          className="w-12 h-12"
        />
        <div className="flex flex-col items-start gap-1.5">
          <p>{item.name}</p>
          <p>{item.productId}</p>
        </div>
      </div>
    </TableCell>
    <TableCell className="text-sm text-foreground">{item.order}</TableCell>
    <TableCell className="text-sm text-foreground">${item.price}</TableCell>
  </TableRow>
);

export const TopPerformingProducts = ({ topItems }) => {
  return (
    <>
      <EarningsChart />

      <Card className={"h-96"}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Performing Products</CardTitle>
          <DropdownMenu4
            trigger={
              <Button variant="ghost" mode="icon">
                <EllipsisVertical />
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start min-w-[150px] text-secondary-foreground! h-10">
                  Item
                </TableHead>
                <TableHead className="min-w-[100px] text-secondary-foreground! h-10">
                  Orders
                </TableHead>
                <TableHead className="min-w-[100px] text-secondary-foreground! h-10">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{topItems.map(renderTopItemRow)}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <GenericListCard
        title="Top Margin"
        rows={MARGIN_CHART}
        renderRow={renderRow}
        dropdown={<DropdownMenu4 />}
      />
    </>
  );
};

export default TopPerformingProducts;
