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
import { toast } from "sonner";
import { RiErrorWarningFill } from "@remixicon/react";
import { Alert, AlertIcon, AlertTitle } from "@/components/common/ui/alert";
import { useCrudApi } from "@/hooks/useCrudApi";
import BaseEditModal from "@/components/common/ui/BaseEditModal";
import { Textarea } from "@/components/common/ui/textarea";
import { ImageIcon } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";

const defaultValues = {
  title: "",
  description: "",
  heading: "",
  file: [],
};

const BlogCategoriesModel = ({
  open,
  onClose,
  onSuccess,
  editData,
  categoryId,
  storeId,
}) => {
  const [loading, setLoading] = useState(false);
  const { create, update } = useCrudApi(`/api/cms/blog/5/categories`);
  const fileRefs = useRef({});
  const form = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { control, setValue } = form;

  useEffect(() => {
    if (editData?.id) {
      (async () => {
        try {
          form.reset({
            title: editData.title || "",
            description: editData.description || "",
            heading: editData.heading || "",
            file: editData.file ? [{ file: editData.file }] : [],
          });
        } catch (err) {
          toast.custom(
            () => (
              <Alert variant="mono" icon="destructive" close={false}>
                <AlertIcon>
                  <RiErrorWarningFill />
                </AlertIcon>
                <AlertTitle>
                  {err.message || "Failed to fetch section data"}
                </AlertTitle>
              </Alert>
            ),
            { position: "top-center" }
          );
        }
      })();
    } else {
      form.reset(defaultValues);
    }
  }, [editData, categoryId, form]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    const mapped = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          file: base64,
        };
      })
    );

    setValue("file", mapped);
  };

  const handleFileClick = () => {
    fileRefs.current?.click();
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const payload = {
        store_id: 5,
        title: values.title,
        description: values.description,
        heading: values.heading || "",
      };

      if (values.file?.length > 0 && values.file[0]?.file) {
        payload.file = values.file[0].file;
      }

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
            name="title"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Category Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heading"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Heading</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Heading" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <div className="mt-4">
            <FormField
              name="description"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description-example" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Image / Video</FormLabel>
                  <div className="flex gap-[50px] h-[140px] justify-between">
                    <FormControl>
                      <div
                        className="flex flex-col items-center justify-center w-full max-w-[300px]  p-6 border border-dashed rounded-xl cursor-pointer"
                        onClick={handleFileClick}
                      >
                        <ImageIcon className="text-xl text-primary mb-2" />
                        <div className="text-xs font-medium">
                          Click or Drag & Drop
                        </div>
                        <span className="text-xs text-secondary-foreground">
                          JPG, PNG, MP4 (max. 800×400)
                        </span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          ref={fileRefs}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>

                    {(form.watch("file") || []).map((m, index) =>
                      m.file.startsWith("data:video") ||
                      m.file.endsWith(".mp4") ? (
                        <video
                          key={index}
                          src={m.file}
                          controls
                          className="h-[140px] w-[160px] rounded "
                        />
                      ) : (
                        <img
                          key={index}
                          src={m.file}
                          alt={`Preview ${index + 1}`}
                          className="h-[140px] w-[160px] rounded "
                        />
                      )
                    )}
                  </div>
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

export default BlogCategoriesModel;
