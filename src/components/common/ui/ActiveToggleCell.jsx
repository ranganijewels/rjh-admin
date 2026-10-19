"use client";
import { useState } from "react";
import { Switch } from "@/components/common/ui/switch";
import { toast } from "sonner";

const ActiveToggleCell = ({ id, isActive, toggleStatus }) => {
  const [localStatus, setLocalStatus] = useState(isActive);

  const handleToggle = async (checked) => {
    if (!toggleStatus) return;
    try {
      await toggleStatus(id, checked);
      setLocalStatus(checked);
      toast.success(`Status ${checked ? "Activated" : "Deactivated"}`);
    } catch (err) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  return (
    <Switch
      id={`active-${id}`}
      size="sm"
      checked={localStatus}
      disabled={!toggleStatus}
      onCheckedChange={handleToggle}
    />
  );
};

export default ActiveToggleCell;
