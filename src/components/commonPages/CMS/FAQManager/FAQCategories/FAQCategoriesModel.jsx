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
import { toast } from "sonner";
import { RiErrorWarningFill } from "@remixicon/react";
import { Alert, AlertIcon, AlertTitle } from "@/components/common/ui/alert";
import { useCrudApi } from "@/hooks/useCrudApi";
import BaseEditModal from "@/components/common/ui/BaseEditModal";
import { Textarea } from "@/components/common/ui/textarea";

const defaultValues = {
  title: "",
  headtitle: "",
  description: "",
};

const FAQCategoriesModel = ({
  open,
  onClose,
  onSuccess,
  editData,
  categoryId,
  storeId,
}) => {
  const [loading, setLoading] = useState(false);
  // const { create, update } = useCrudApi(`/api/cms/faq/${storeId}/categories`);
  const { create, update, fetchById, remove } = useCrudApi(
    `/api/cms/faq/${storeId}/categories`
  );

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
            title: editData.faq_category_title || "",
            description: editData.description || "",
            headtitle: editData.headtitle || "",
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        store_id: storeId,
        headtitle: values.headtitle,
        faq_category_title: values.title,
        description: values.description,
      };
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
                  <Input placeholder="Enter Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headtitle"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Head Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Head Title" {...field} />
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
        </>
      }
    />
  );
};

export default FAQCategoriesModel;
