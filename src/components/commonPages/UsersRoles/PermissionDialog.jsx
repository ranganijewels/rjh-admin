"use client";

import { Check, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { Button } from "@/components/common/ui/button";
import {
  ACTIONS,
  MODULES,
  ROLE_PERMISSIONS,
  getRoleMeta,
  normalizeRole,
} from "@/config/rbac";

const ACTION_LABELS = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

/**
 * Read-only capability matrix for a system role. Custom roles need backend
 * support before permissions can be edited and persisted.
 */
export default function PermissionDialog({ open, onOpenChange, role }) {
  const roleKey = normalizeRole(role);
  const meta = getRoleMeta(roleKey);
  const permissions = ROLE_PERMISSIONS[roleKey];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{meta.name} permissions</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead scope="col" className="min-w-[220px]">
                  Module
                </TableHead>
                {ACTIONS.map((action) => (
                  <TableHead key={action} scope="col" className="text-center">
                    {ACTION_LABELS[action]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULES.map((module) => {
                const access = permissions?.[module.key];
                return (
                  <TableRow key={module.key}>
                    <TableCell className="font-medium text-foreground">
                      {module.label}
                    </TableCell>
                    {ACTIONS.map((action) => {
                      const allowed = Boolean(access?.[action]);
                      return (
                        <TableCell key={action} className="text-center">
                          <span
                            className={
                              allowed
                                ? "inline-flex size-5 items-center justify-center rounded-full bg-success/10 text-success dark:text-success"
                                : "inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground/50"
                            }
                            aria-label={
                              allowed
                                ? `${module.label}: ${ACTION_LABELS[action]} allowed`
                                : `${module.label}: ${ACTION_LABELS[action]} not allowed`
                            }
                          >
                            {allowed ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Minus className="size-3.5" />
                            )}
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          These permissions are defined by the system role and apply immediately
          after login. Custom roles require backend support.
        </p>

        <div className="flex justify-end pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
