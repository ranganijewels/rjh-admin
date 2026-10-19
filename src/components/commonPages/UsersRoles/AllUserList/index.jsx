"use client";
import { toast } from "sonner";
import React, { useMemo, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import { Plus } from "lucide-react";
import AddUserModal from "./AddUsersModel";
import { useUsersList } from "./hooks/useUsersList";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import PermissionDialog from "../PermissionDialog";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { usePermissions } from "@/provider/permission-provider";

const AllUserList = () => {
  const { can } = usePermissions();
  const {
    list,
    confirmOpen,
    setConfirmOpen,
    setList,
    fetchById,
    fetchData,
  } = useCrudList("/api/user-management");
  // "Delete" on a user is a soft-delete server-side (sets isActive:false,
  // never removes the row) — modeled here as an explicit Activate/Deactivate
  // toggle so it's never silently applied without the admin seeing the
  // resulting status change.
  const { update: updateUser } = useCrudApi("/api/user-management");
  const [toggleTarget, setToggleTarget] = useState(null);

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);

  const [editData, setEditData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { columns, dialogOpen, setDialogOpen } = useUsersList({
    onEdit: (user) => {
      setEditData(user);
      setDialogOpen(true);
    },
    onViewPermission: (user) => {
      setViewingRole(
        user.roles?.[0]?.id ??
          user.roles?.[0]?.name ??
          user.role_id ??
          user.roleId ??
          user.role
      );
      setPermissionDialogOpen(true);
    },
    onToggleStatus: (user) => {
      setToggleTarget(user);
      setConfirmOpen(true);
    },
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const willActivate = toggleTarget?.isActive === false;
  const handleConfirmToggle = () => {
    if (!toggleTarget) return;
    const nextActive = willActivate;
    toast.promise(
      updateUser(toggleTarget.id, { isActive: nextActive }).then(() => {
        setConfirmOpen(false);
        setToggleTarget(null);
        fetchData();
      }),
      {
        loading: nextActive ? "Activating user..." : "Deactivating user...",
        success: nextActive ? "User activated" : "User deactivated",
        error: nextActive ? "Failed to activate user" : "Failed to deactivate user",
      }
    );
  };

  const userStatus = (user) => (user?.isActive === false ? "Inactive" : "Active");

  const statusOptions = useMemo(
    () =>
      buildStatusOptions(list, userStatus, {
        allLabel: "All users",
        order: ["Active", "Inactive"],
      }),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter((user) => userStatus(user) === statusFilter),
    [list, statusFilter]
  );

  return (
    <Page>
      <PageHeader
        title="All Users"
        description="Every account that can sign in to the admin panel, with the role and department it belongs to."
        actions={
          can("users_roles", "create") ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" /> Add User
            </Button>
          ) : null
        }
      />

      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="User status"
      />

      <ListWithCardToggle
        titleAs="none"
        data={scopedList}
        columns={columns}
        resizableColumns
        infiniteScroll
        bulkActions={
          can("users_roles", "delete")
            ? [
                {
                  key: "deactivate",
                  label: "Deactivate",
                  variant: "destructive",
                  confirmMessage:
                    "Deactivate the selected user(s)? They won't be able to log in until reactivated.",
                  onRun: async (rows) => {
                    await Promise.all(
                      rows.map((r) => updateUser(r.id, { isActive: false }))
                    );
                    fetchData();
                  },
                },
              ]
            : []
        }
      />

      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        role={viewingRole}
      />

      <AddUserModal
        open={dialogOpen}
        onClose={handleClose}
        onSuccess={fetchData}
        editData={editData}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setToggleTarget(null);
        }}
        onConfirm={handleConfirmToggle}
        title={willActivate ? "Activate User" : "Deactivate User"}
        message={
          willActivate
            ? `Reactivate ${toggleTarget?.name || "this user"}? They will be able to log in again.`
            : `Deactivate ${toggleTarget?.name || "this user"}? They won't be able to log in until reactivated — this can be undone any time from this list.`
        }
        confirmLabel={willActivate ? "Activate" : "Deactivate"}
        confirmVariant={willActivate ? "default" : "destructive"}
      />
    </Page>
  );
};

export default AllUserList;
