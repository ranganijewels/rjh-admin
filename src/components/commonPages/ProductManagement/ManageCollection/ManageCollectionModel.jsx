"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/common/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/common/ui/select";
import BaseEditModal from "@/components/common/ui/BaseEditModal";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useCrudApi } from "@/hooks/useCrudApi";

const ManageCollectionModel = ({ open, onClose, onSuccess, editData }) => {
  const { create, update } = useCrudApi(
    "/api/product-management/manage-collection"
  );
  const [loading, setLoading] = useState(false);
  const fileRefs = useRef(null);

  const form = useForm({
    defaultValues: {
      collection_name: "",
      description: "",
      product_image: [],
      is_active: true,
      visibility: "public",
    },
  });

  const { setValue } = form;

  // ✅ Handle edit mode
  useEffect(() => {
    if (editData?.id) {
      form.reset({
        collection_name: editData.collection_name || "",
        description: editData.description || "",
        product_image: editData.product_image
          ? [{ file: editData.product_image }]
          : [],
        is_active: editData.is_active ?? true,
        visibility: editData.status === 1 ? "public" : "private",
      });
    } else {
      form.reset({
        collection_name: "",
        description: "",
        product_image: [],
        is_active: true,
        visibility: "public",
      });
    }
  }, [editData, form]);

  // ✅ Handle file upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return { file: base64 };
      })
    );
    setValue("product_image", mapped);
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileClick = () => {
    fileRefs.current?.click();
  };

  // ✅ Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        collection_name: values.collection_name,
        description: values.description,
        product_image: values.product_image?.[0]?.file || null,
        is_active: values.is_active,
        status: values.visibility === "public" ? 1 : 0,
      };

      if (editData?.id) {
        await update(editData.id, payload);
        toast.success("Collection Updated Successfully!");
      } else {
        await create(payload);
        toast.success("Collection Created Successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseEditModal
      open={open}
      onOpenChange={onClose}
      title={`${editData ? "Edit" : "Add"} Collection`}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <>
          {/* Collection Name */}
          <FormField
            control={form.control}
            name="collection_name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Collection Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Collection Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Description"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <div className="mt-4">
            <FormField
              control={form.control}
              name="product_image"
              render={() => (
                <FormItem>
                  <FormLabel>Collection Image</FormLabel>
                  <div className="flex gap-[50px] h-[140px] justify-between">
                    {/* Upload Box */}
                    <FormControl>
                      <div
                        className="flex flex-col items-center justify-center w-full max-w-[300px] p-6 border border-dashed rounded-xl cursor-pointer"
                        onClick={handleFileClick}
                      >
                        <ImageIcon className="text-xl text-primary mb-2" />
                        <div className="text-xs font-medium">
                          Click or Drag & Drop
                        </div>
                        <span className="text-xs text-secondary-foreground">
                          JPG, PNG (max. 800×800)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileRefs}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>

                    {/* Preview Images */}
                    <div className="flex gap-4 overflow-x-auto mt-2">
                      {(Array.isArray(form.watch("product_image"))
                        ? form.watch("product_image")
                        : []
                      ).map((m, index) => (
                        <img
                          key={index}
                          src={m.file}
                          alt={`Preview ${index + 1}`}
                          className="h-[140px] w-[160px] rounded border flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Visibility */}
          <div className="mt-6">
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active Status */}
          <div className="mt-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      }
    />
  );
};

export default ManageCollectionModel;
