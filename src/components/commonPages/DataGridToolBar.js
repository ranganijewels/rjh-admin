"use client";
import React, { useState } from "react";
import { Input } from "@/components/common/ui/input";
import { Button } from "@/components/common/ui/button";
import { CardHeader } from "@/components/common/ui/cards/card";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";

export const DataGridToolbar = ({ searchQuery, setSearchQuery, pagination, setPagination }) => {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(inputValue);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  return (
    <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center py-5 gap-2.5">
      <div className="relative">
        <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search stores"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="ps-9 w-full sm:w-64"
        />
        {searchQuery && (
          <Button
            mode="icon"
            variant="dim"
            className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery("")}
          >
            <X />
          </Button>
        )}
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
  );
};
