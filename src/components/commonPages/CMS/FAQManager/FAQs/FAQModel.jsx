"use client";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  Toolbar,
  ToolbarActions,
  ToolbarTitle,
} from "@/components/common/ui/toolbar";
import { Button } from "@/components/common/ui/button";
import { Card, CardTitle } from "@/components/common/ui/cards/card";
import { Trash2Icon } from "lucide-react";

const defaultValues = {
  category: "",
  faqs: [{ id: "", question: "", answer: "" }],
};

const FAQModel = ({
  open,
  onClose,
  onSuccess,
  editData,
  categoryId,
  storeId,
}) => {
  const { fetchAll } = useCrudApi(`/api/cms/faq/${storeId}/categories`);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { create, update } = useCrudApi(`/api/cms/faq/${storeId}/questions`);

  const form = useForm({
    defaultValues,
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editData?.id) {
      (async () => {
        try {
          form.reset({
            category: editData?.faq_category_id || "",
            faqs: [
              {
                id: editData?.id,
                question: editData.question,
                answer: editData.answer,
              },
            ],
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
        faqs: values.faqs.map((faq, idx) => ({
          id: faq.id,
          faq_category_id: Number(values.category),
          question: faq.question,
          answer: faq.answer,
        })),
      };

      if (editData) {
        await update(editData.id, payload);
        toast.success("FAQs Updated");
      } else {
        await create(payload);
        toast.success("FAQs Created");
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
      title={`${editData ? "Edit" : "Add"} Question`}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <>
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => {
              return (
                <FormItem className="mb-5">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Category"></SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.length === 0 ? (
                            <div className="text-center text-xs text-gray-500">
                              No categoires available
                            </div>
                          ) : (
                            categories
                              .filter((e) => e.is_active === 1)
                              .map((cat) => {
                                return (
                                  <SelectItem
                                    key={cat.id}
                                    value={String(cat.id)}
                                  >
                                    {cat.faq_category_title}
                                  </SelectItem>
                                );
                              })
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Toolbar>
            <ToolbarTitle>Questions & Answers</ToolbarTitle>
            <ToolbarActions>
              <Button
                type="button"
                variant="primary"
                onClick={() => append({ question: "", answer: "" })}
              >
                + Add Another Question
              </Button>
            </ToolbarActions>
          </Toolbar>

          {fields.map((item, idx) => (
            <Card key={item.id} className="mt-4">
              <div className="flex items-center justify-between px-4 py-4">
                <CardTitle>Question {idx + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(idx)}
                  >
                    <Trash2Icon className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="px-4 pb-4 space-y-4">
                {/* Question */}
                <FormField
                  control={form.control}
                  name={`faqs.${idx}.question`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Answer */}
                <FormField
                  control={form.control}
                  name={`faqs.${idx}.answer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Answer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          ))}
        </>
      }
    />
  );
};

export default FAQModel;
