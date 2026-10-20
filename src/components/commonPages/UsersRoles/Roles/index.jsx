"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { Page, PageHeader } from "@/components/common/ui/page";
import { useCrudList } from "@/hooks/useCrudList";
import PermissionDialog from "../PermissionDialog";
import { useUserRolesData } from "./hooks/useUserRolesData";

const Roles = () => {
  const { list, loading, error } = useCrudList("/api/users-roles");

  const [permissionOpen, setPermissionOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const columns = useUserRolesData({
    onViewPermissions: (role) => {
      setSelectedRole(role.id || role.name);
      setPermissionOpen(true);
    },
  });

  const filterFunction = (data, searchTerm) => {
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      item.name?.toLowerCase().includes(lowerSearch)
    );
  };

  if (loading) return <ContentLoader />;
  if (error) return <div className="text-destructive">Error: {error}</div>;

  return (
    <Page>
      <PageHeader
        title="System Roles"
        description="Roles are fixed by the backend. Select a role to review what it can access."
      />

      <ListWithCardToggle
        titleAs="none"
        data={list}
        columns={columns}
        resizableColumns
        filterFunction={filterFunction}
        infiniteScroll
      />

      <PermissionDialog
        open={permissionOpen}
        onOpenChange={setPermissionOpen}
        role={selectedRole}
      />
    </Page>
  );
};

export default Roles;
