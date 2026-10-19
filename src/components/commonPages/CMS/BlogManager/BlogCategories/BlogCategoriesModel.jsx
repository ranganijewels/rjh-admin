"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";
import { toast } from "sonner";
import { useCrudApi } from "@/hooks/useCrudApi";
import BaseEditModal from "@/components/common/ui/BaseEditModal";

const defaultValues = {
  name: "",
  description: "",
};

// A blog category is just a named master value (see masters/values on the
// backend) — no image/heading/slug of its own, so this dialog is
// deliberately simple.
const BlogCategoriesModel = ({ open, onClose, onSuccess, editData, storeId }) => {
  const [loading, setLoading] = useState(false);
  const { create, update } = useCrudApi(`/api/cms/blog/${storeId}/categories`);
  const form = useForm({ defaultValues, mode: "onChange" });

  useEffect(() => {
    if (editData?.id) {
      form.reset({
        name: editData.valueLabel || "",
        description: editData.description || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editData, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { name: values.name, description: values.description || undefined };

      if (editData) {
        await update(editData.id, payload);
        toast.success("Category Updated");
      } else {
        await create(payload);
        toast.success("Category Created");
      }

      onClose();
      onSuccess();
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseEditModal
      open={open}
      onOpenChange={onClose}
      title={`${editData ? "Edit" : "Add"} Category`}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <>
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Category name is required" }}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Engagement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Shown to editors when picking a category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      }
    />
  );
};

export default BlogCategoriesModel;
