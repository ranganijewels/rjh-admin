"use client";

import { useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";
import {
  Search,
  Bell,
  CheckCircle,
  Loader2,
  MessageSquare,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Sheet, SheetContent } from "@/components/common/ui/sheet";
import { Separator } from "@/components/common/ui/separator";
import { ScrollArea } from "@/components/common/ui/scroll-area";

const mockNotifications = [
  {
    id: "notif-001",
    type: "support",
    title: "New High Priority Support Ticket",
    message:
      "TK-001: Product sync failing for custom rings from Brilliant Diamonds NYC",
    timestamp: "2025-06-27T12:30:00Z",
    isRead: false,
    priority: "high",
    targetRole: ["support-manager", "admin"],
    relatedEntityId: "TK-001",
    relatedEntityType: "ticket",
    actionUrl: "/support/tickets/TK-001",
    sourceStore: "Brilliant Diamonds NYC",
  },
  {
    id: "notif-002",
    type: "order",
    title: "Order Delay Alert",
    message:
      "Custom ring order #BR-2024-1156 is at risk of missing delivery deadline (2 days overdue)",
    timestamp: "2025-06-27T11:45:00Z",
    isRead: false,
    priority: "urgent",
    targetRole: ["order-manager", "admin"],
    relatedEntityId: "BR-2024-1156",
    relatedEntityType: "order",
    actionUrl: "/orders/BR-2024-1156",
    sourceStore: "Brilliant Diamonds NYC",
  },
];

export function NotificationCenterSheet({ isOpen, onOpenChange }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.sourceStore &&
        notification.sourceStore
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || notification.priority === priorityFilter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !notification.isRead) ||
      (readFilter === "read" && notification.isRead);

    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  const highPriorityCount = Array.isArray(notifications)
    ? notifications.filter(
        (n) => (n.priority === "high" || n.priority === "urgent") && !n.isRead
      ).length
    : 0;

  const getTypeIcon = (type) => {
    switch (type) {
      case "order":
        return ShoppingCart;
      case "support":
        return MessageSquare;
      case "content":
      case "product":
        return Package;
      case "billing":
        return DollarSign;
      case "system":
        return Settings;
      case "store":
        return Users;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type) => {
    return (
      {
        order: "text-primary",
        support: "text-purple-500",
        content: "text-green-500",
        product: "text-orange-500",
        billing: "text-yellow-500",
        system: "text-gray-500",
        store: "text-pink-500",
      }[type] || "text-gray-500"
    );
  };

  const getPriorityColor = (priority) => {
    return (
      {
        urgent: "destructive",
        high: "primary",
        medium: "secondary",
        low: "outline",
      }[priority] || "outline"
    );
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      // Simulate async persistence of read state
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / 60000);
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const groupedNotifications = filteredNotifications.reduce((groups, n) => {
    const date = new Date(n.timestamp).toDateString();
    groups[date] = groups[date] || [];
    groups[date].push(n);
    return groups;
  }, {});

  return (
    <Sheet open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
      <SheetContent className="w-[90%] md:max-w-[70vw] lg:max-w-[50vw] xl:max-w-[80vw] inset-5 start-auto h-[100vh] rounded-lg p-0">
        <div className="flex h-full">
          {/* Left Panel: Notifications */}
          <div className="flex-1 flex flex-col border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Notifications</h2>
                  <div className="flex gap-4 mt-1">
                    <Badge variant="destructive">{unreadCount} Unread</Badge>
                    <Badge variant="primary">
                      {highPriorityCount} Priority
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || isMarkingAllRead}
                  aria-busy={isMarkingAllRead}
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark All Read
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                New notifications appear here when support tickets, orders,
                or system alerts are created.{" "}
                <a
                  href="/support"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Learn more
                </a>
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order">Orders</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                    {new Date(date).toLocaleDateString()}
                  </div>
                  {items.map((n) => {
                    const Icon = getTypeIcon(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/50 ${
                          !n.isRead ? "border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getTypeColor(n.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`font-medium ${
                                    !n.isRead
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {n.title}
                                </h3>
                                <Badge
                                  variant={getPriorityColor(n.priority)}
                                  className="text-xs"
                                >
                                  {n.priority}
                                </Badge>
                                {!n.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(n.timestamp)}
                              </span>
                            </div>
                            <p
                              className={`text-sm mb-2 ${
                                !n.isRead
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {n.sourceStore && (
                                <span className="bg-muted px-2 py-1 rounded">
                                  {n.sourceStore}
                                </span>
                              )}
                              {n.author && <span>by {n.author.name}</span>}
                              {n.actionUrl && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                >
                                  View Details →
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {filteredNotifications.length === 0 && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel: Notification Summary */}
          <div className="w-80 border-l border-border p-4 space-y-4">
            <h3 className="font-semibold">Notification Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {unreadCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Unread</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {highPriorityCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Priority</div>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">By Type</h4>
              <div className="space-y-2">
                {[
                  "order",
                  "support",
                  "content",
                  "product",
                  "billing",
                  "system",
                  "store",
                ].map((type) => {
                  const count = notifications.filter(
                    (n) => n.type === type && !n.isRead
                  ).length;
                  const Icon = getTypeIcon(type);
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3 w-3 ${getTypeColor(type)}`} />
                        <span className="capitalize">{type}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>Last ticket: 30 minutes ago</div>
                <div>Last order alert: 2 hours ago</div>
                <div>Last system update: 6 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
