"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/ui/button";
import { Checkbox } from "@/components/common/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { PERMISSION_MODULES } from "@/constants/permissions";

// Note: this local `permissions` constant is currently unused by this
// component (the table renders from the `rolePermissions`/`viewingRoleId`
// props passed in by the parent), but is kept exported-shape-compatible
// with the shared constant in case it's wired up later.
const permissions = PERMISSION_MODULES;

const PermissionDialog = ({
  permissionDialogOpen,
  setPermissionDialogOpen,
  roles,
  viewingRoleId,
  rolePermissions,
  updatePermission,
}) => {
  const currentPermissions = rolePermissions[viewingRoleId] || [];
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      // Permissions are already updated in local state via updatePermission
      // on each checkbox change. Persist here once a real API is available.
      await Promise.resolve(rolePermissions[viewingRoleId]);
      toast.success("Permissions saved successfully");
      setPermissionDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Role Permissions
            {/* {roles.find((r) => r.id === viewingRoleId)?.name || "Unknown Role"} */}
          </DialogTitle>
          <DialogDescription>
            Manage permissions assigned to this role.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md overflow-hidden max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead scope="col" className="min-w-[250px]">
                  Module
                </TableHead>
                <TableHead scope="col" className="text-center">
                  View
                </TableHead>
                <TableHead scope="col" className="text-center">
                  Modify
                </TableHead>
                <TableHead scope="col" className="text-center">
                  Publish
                </TableHead>
                <TableHead scope="col" className="text-center">
                  Configure
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPermissions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.module}</TableCell>

                  {/* View */}
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`${item.module} - View permission`}
                      checked={item.permissions.view}
                      onCheckedChange={(v) =>
                        updatePermission(viewingRoleId, index, "view", v)
                      }
                    />
                  </TableCell>

                  {/* Modify */}
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`${item.module} - Modify permission`}
                      checked={item.permissions.modify}
                      onCheckedChange={(v) =>
                        updatePermission(viewingRoleId, index, "modify", v)
                      }
                    />
                  </TableCell>

                  {/* Publish */}
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`${item.module} - Publish permission`}
                      checked={item.permissions.publish}
                      onCheckedChange={(v) =>
                        updatePermission(viewingRoleId, index, "publish", v)
                      }
                    />
                  </TableCell>

                  {/* Configure */}
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`${item.module} - Configure permission`}
                      checked={item.permissions.configure}
                      onCheckedChange={(v) =>
                        updatePermission(viewingRoleId, index, "configure", v)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setPermissionDialogOpen(false)}
            disabled={isSaving}
          >
            Close
          </Button>
          <Button onClick={handleSavePermissions} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionDialog;
