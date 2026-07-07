"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Overview from "@/components/commonPages/Dashboard/Overview";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Overview />
    </ProtectedRoute>
  );
}
