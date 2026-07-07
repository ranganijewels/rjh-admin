import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Badge } from "@/components/common/ui/badge";
import React from "react";

const MetricBreakdownCard = ({
  total,
  title,
  badgeValue,
  badgeProps = { variant: "success", appearance: "outline", size: "sm" },
  items = [],
  isCurrency = false,
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-start px-3 py-4">
        {/* Header */}
        <div className="flex flex-col gap-0.5 mb-[20px]">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-semibold">
              {isCurrency ? `$${total}` : total}
            </span>
            {badgeValue !== undefined && (
              <Badge {...badgeProps}>{badgeValue}</Badge>
            )}
          </div>
          <span className="text-sm font-normal text-secondary-foreground">
            {title}
          </span>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-2 text-sm font-medium text-gray-600 w-full">
          {items.map(({ label, value, color, showDashed }, idx) => (
            <div key={idx} className="flex items-center gap-2 w-full">
              <span
                className="w-7 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
              {showDashed && <span className="border w-7 border-dashed" />}
              <span className="ml-auto font-semibold text-gray-900">
                {value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricBreakdownCard;
