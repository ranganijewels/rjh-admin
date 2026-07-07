import { EllipsisVertical } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "../button";

const GenericListCard = ({ title, rows = [], renderRow, dropdown }) => {
  return (
    <Card className={"w-full h-56"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {dropdown && (
          <div>
            <Button variant="ghost" mode="icon">
              <EllipsisVertical />
            </Button>
            {dropdown}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-5 lg:p-7.5 lg:pt-4">
        <div className="grid gap-3">
          {rows.slice(0, 4).map((row, index) => renderRow(row, index))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenericListCard;
