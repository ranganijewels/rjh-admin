"use client";
import React, { useState, useEffect } from "react";
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

export const DataGridToolbar = ({
  searchQuery,
  setSearchQuery,
  pagination,
  setPagination,
  searchPlaceholder = "Search",
  showFilter = false,
  filterLabel = "Filter by role",
  filterOptions = [],
  onFilterChange,
  toolbarTitle = null,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery || "");

  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  const handleSearch = () => {
    setSearchQuery?.(inputValue);
    setPagination?.((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchQuery?.("");
    setPagination?.((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center py-5 gap-2.5 justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="ps-9 w-full"
          />
          {inputValue && (
            <Button
              mode="icon"
              variant="dim"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClearSearch}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {showFilter && (
          <Select defaultValue="all" onValueChange={onFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={filterLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {toolbarTitle && (
        <div className="text-lg font-semibold text-muted-foreground">{toolbarTitle}</div>
      )}
    </CardHeader>
  );
};
