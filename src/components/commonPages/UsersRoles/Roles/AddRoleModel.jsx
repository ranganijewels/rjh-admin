"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { toast } from "sonner";
import { RiErrorWarningFill } from "@remixicon/react";
import { Alert, AlertIcon, AlertTitle } from "@/components/common/ui/alert";
import { useCrudApi } from "@/hooks/useCrudApi";
import BaseEditModal from "@/components/common/ui/BaseEditModal";
import { z } from "zod";

const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
});

const AddRoleModel = ({ open, onClose, onSuccess, editData }) => {
  const { create, loading } = useCrudApi("/api/users-roles");

  const form = useForm({
    resolver: zodResolver(RoleSchema),
    defaultValues: { name: editData?.name || "" },
  });

  useEffect(() => {
    form.reset({ name: editData?.name || "" });
  }, [editData, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = { name: values.name, id: editData?.id }; // include ID if editing
      await create(payload);

      toast.success(
        editData ? "Role updated successfully" : "Role created successfully"
      );
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive" close={false}>
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>{err?.message || "Something went wrong"}</AlertTitle>
          </Alert>
        ),
        { position: "top-center" }
      );
    }
  };

  return (
    <BaseEditModal
      open={open}
      onOpenChange={(val) => !val && onClose()}
      title={`${editData ? "Edit" : "Add"} Role`}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      }
    />
  );
};

export default AddRoleModel;
