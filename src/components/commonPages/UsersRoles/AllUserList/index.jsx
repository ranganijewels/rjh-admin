"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import AddUserModal from "./AddUsersModel";
import { useUsersList } from "./hooks/useUsersList";
import { useCrudList } from "@/hooks/useCrudList";
import PermissionDialog from "./PermissionDialog";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { PERMISSION_MODULES } from "@/constants/permissions";

const AllUserList = () => {
  const {
    list,
    confirmOpen,
    setConfirmOpen,
    handleDelete,
    setDeleteId,
    setList,
    fetchById,
    fetchData,
  } = useCrudList("/api/user-management");

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
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleConfirmDelete = () => {
    toast.promise(handleDelete(), {
      loading: "Deleting user...",
      success: "User deleted successfully",
      error: "Failed to delete user",
    });
  };

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="All Users"
        data={list}
        columns={columns}
        resizableColumns
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
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default AllUserList;
