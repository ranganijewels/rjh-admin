"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Badge } from "../badge";
import { Card, CardContent } from "./card";

export function TwoColCard({ items = [], limit = items.length }) {
  const renderItem = (items, index) => (
    <Card key={index}>
      <CardContent className="flex items-center flex-wrap justify-between gap-4.5 p-2 pe-5">
        <div className="flex items-center gap-3.5">
          <Card className="flex items-center justify-center bg-accent/50 h-[70px] w-[90px] shadow-none">
            <img
              src={items?.product?.image}
              className="cursor-pointer h-[70px]"
              alt={items?.product?.title || items?.product?.design_no}
            />
          </Card>

          <div className="flex flex-col gap-1">
            <Link
              href="#"
              className="hover:text-primary text-sm font-medium text-mono leading-5.5"
            >
              {items?.product_title}
            </Link>

            <div className="flex items-center gap-1.5">
              {items.badge && (
                <Badge size="sm" variant="destructive" className="uppercase">
                  save 25%
                </Badge>
              )}
            </div>

            {items?.product?.metal && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-normal text-secondary-foreground uppercase">
                  Metal:{" "}
                  <span className="text-xs font-medium text-foreground">
                    {items?.product?.metal}
                  </span>
                </span>
              </div>
            )}

            {items?.center_diamond_weight && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-normal text-secondary-foreground uppercase">
                  Diamond Weight:{" "}
                  <span className="text-xs font-medium text-foreground">
                    {items?.center_diamond_weight}
                  </span>
                </span>
              </div>
            )}

            {items?.product?.subcategory?.name && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-normal text-secondary-foreground uppercase">
                  Style:{" "}
                  <span className="text-xs font-medium text-foreground">
                    {items?.product?.subcategory?.name}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-normal text-secondary-foreground text-end">
            {items?.quantity} x
          </span>
          <div className="flex items-center flex-wrap gap-1.5">
            {items?.subtotal && (
              <span className="text-sm font-normal text-secondary-foreground ">
                {items?.subtotal}
              </span>
            )}
            <span className="text-sm font-semibold text-mono">
              {items?.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Fragment>
      {items.slice(0, limit).map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}
