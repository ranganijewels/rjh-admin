"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import AddUserModal from "./AddUsersModel";
import { useUsersList } from "./hooks/useUsersList";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import PermissionDialog from "./PermissionDialog";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { PERMISSION_MODULES } from "@/constants/permissions";

const AllUserList = () => {
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
  const [viewingRoleId, setViewingRoleId] = useState(null);

  const permissions = PERMISSION_MODULES;

  const [rolePermissions, setRolePermissions] = useState({});

  const updatePermission = (roleId, index, type, value) => {
    setRolePermissions((prev) => {
      const arr = [...prev[roleId]];
      arr[index].permissions[type] = value;
      return { ...prev, [roleId]: arr };
    });
  };

  const [editData, setEditData] = useState(null);
  const { columns, dialogOpen, setDialogOpen } = useUsersList({
    onEdit: (user) => {
      setEditData(user);
      setDialogOpen(true);
    },
    onViewPermission: (user) => {
      const roleId = user.role_id ?? user.roleId ?? user.role;

      setViewingRoleId(roleId);

      setRolePermissions((prev) => {
        if (!prev[roleId]) {
          return {
            ...prev,
            [roleId]: permissions.map((p) => ({
              module: p.module,
              permissions: {
                view: p.view,
                modify: p.modify,
                publish: p.publish,
                configure: p.configure,
              },
            })),
          };
        }
        return prev;
      });

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

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="All Users"
        data={list}
        columns={columns}
        resizableColumns
        infiniteScroll
        bulkActions={[
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
        ]}
        createBtn={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <PermissionDialog
        permissionDialogOpen={permissionDialogOpen}
        setPermissionDialogOpen={setPermissionDialogOpen}
        roles={permissions}
        viewingRoleId={viewingRoleId}
        rolePermissions={rolePermissions}
        setRolePermissions={setRolePermissions}
        updatePermission={updatePermission}
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
    </div>
  );
};

export default AllUserList;
