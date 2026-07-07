import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/ui/cards/card";
import { Button } from "@/components/common/ui/button";
import Link from "next/link";
import { Badge } from "@/components/common/ui/badge";

 const tasks = [
    {
      borderColor: "border-destructive",
      date: "Due in 2 Days",
      status: {
        label: "New",
        variant: "primary",
      },
      text: "Create FireStone Logo",
    },
    {
      borderColor: "border-primary",
      date: "Due in 3 Days",
      status: {
        label: "New",
        variant: "success",
      },
      text: "Stakeholder Meeting",
    },
    {
      borderColor: "border-orange-300",
      date: "Due in 2 Days",
      status: {
        label: "New",
        variant: "info",
      },
      text: "Create FireStone Logo",
    },
    {
      borderColor: "border-green-500",
      date: "Due in 2 Days",
      status: {
        label: "New",
        variant: "info",
      },
      text: "Stakeholder Meeting",
    },
    {
      borderColor: "border-destructive",
      date: "Due in 2 Days",
      status: {
        label: "New",
        variant: "primary",
      },
      text: "Stakeholder Meeting",
    },
  ];

const TaskItem = ({ item }) => (
  <div className={`border-l-2 flex ${item.borderColor}`}>
    <div className="flex items-center grow gap-2.5 ml-[15px]">
      <div className="h-[30px] w-[30px] bg-[#F1F1F2] rounded-[7px]" />
      <div className="flex flex-col">
        <Link href="#" className="text-sm font-semibold hover:text-primary-active mb-px">
          {item.text}
        </Link>
        <span className="text-xs font-normal text-secondary-foreground">{item.date}</span>
      </div>
    </div>
    <div>
      <Badge variant={item.status.variant}>{item.status.label}</Badge>
    </div>
  </div>
);

const TodoCard = () => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Todo</CardTitle>
      <Button mode="link" underlined="dashed" asChild>
        <Link href="/public-profile/profiles/feeds">View All</Link>
      </Button>
    </CardHeader>
    <CardContent className="pb-7">
      <div className="flex flex-col gap-5">
        {tasks.map((item, index) => (
          <TaskItem key={index} item={item} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default TodoCard;
