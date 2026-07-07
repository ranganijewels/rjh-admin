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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/common/ui/calendar";
import RichTextEditor from "@/components/common/RichTextEditor";
import { CalendarDays, ImageIcon } from "lucide-react";
import Image from "next/image";

const BlogPostModel = ({ open, onClose, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const fileRef = useRef(null);

  // CRUD API hook
  const { create, update } = useCrudApi("/api/cms/blog/5/posts");
  const { fetchAll: fetchCategories } = useCrudApi(
    "/api/cms/blog/5/categories"
  );

  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      file: [],
      is_active: true,
      publishedDate: null,
    },
  });

  const { setValue } = form;

  useEffect(() => {
    if (editData?.id) {
      form.reset({
        category: editData.blog_category_id
          ? String(editData.blog_category_id)
          : "",
        title: editData.title || "",
        author: editData.author || "",
        description: editData.description || "",
        file: editData.file ? [{ file: editData.file }] : [],
        is_active: Boolean(editData.is_active),
        publishedDate: editData.publishedDate
          ? new Date(editData.publishedDate)
          : null,
      });
    } else {
      form.reset({
        title: "",
        author: "",
        category: "",
        description: "",
        file: [],
        is_active: true,
        publishedDate: null,
      });
    }
  }, [editData]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return { file: base64 };
      })
    );
    setValue("file", mapped);
  };

  // Load categories for select dropdown
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchCategories();

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setCategories(list);
    };

    loadCategories();
  }, [fetchCategories]);

  // Local helper: convert a File object to Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileClick = () => {
    fileRef.current?.click();
  };

  // Submit Handler
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        store_id: 5,
        blog_category_id: Number(values.category),
        title: values.title,
        author: values.author,
        description: values.description,
        file: values.file?.[0]?.file || null,
        status: values.is_active ? 1 : 0,
        publishedDate: values.publishedDate
          ? format(new Date(values.publishedDate), "yyyy-MM-dd")
          : null,
      };

      if (editData) {
        await update(editData.id, payload);
        toast.success("Blog Post Updated Successfully");
      } else {
        await create(payload);
        toast.success("Blog Post Created Successfully");
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
      title={`${editData ? "Edit" : "Add"} Blog Post`}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <>
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.length === 0 ? (
                          <div className="text-center text-xs text-gray-500">
                            No categories available
                          </div>
                        ) : (
                          categories
                            .filter((e) => e.is_active)
                            .map((cat) => {
                              return (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                  {cat.title}
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
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author name" {...field} />
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
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your blog description..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image / Video Upload */}
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem className="mb-4">
                <FormLabel>Image / Video</FormLabel>
                <div className="flex gap-6 h-[140px]">
                  <div
                    className="flex flex-col items-center justify-center w-full max-w-[300px] p-6 border border-dashed rounded-xl cursor-pointer"
                    onClick={handleFileClick}
                  >
                    <ImageIcon className="text-primary mb-2" />
                    <div className="text-xs font-medium">
                      Click or Drag & Drop
                    </div>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, MP4 (max. 800×400)
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      ref={fileRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {(Array.isArray(form.watch("file"))
                    ? form.watch("file")
                    : []
                  ).map((m, i) =>
                    m.file.startsWith("data:video") ||
                    m.file.endsWith(".mp4") ? (
                      <video
                        key={i}
                        src={m.file}
                        controls
                        className="h-[140px] w-[160px] rounded"
                      />
                    ) : (
                      <Image
                        key={i}
                        src={m.file}
                        alt={`Preview ${i + 1}`}
                        width={160}
                        height={140}
                        sizes="160px"
                        unoptimized={m.file.startsWith("data:")}
                        className="aspect-[160/140] h-[140px] w-[160px] rounded object-cover"
                      />
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Active Toggle */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => field.onChange(val === "true")}
                    value={String(field.value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Date */}
          <FormField
            control={form.control}
            name="publishedDate"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Published Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        mode="input"
                        variant="outline"
                        id="date"
                        className={cn(
                          "w-full justify-start text-left",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2" />
                        {field.value
                          ? format(new Date(field.value), "LLL dd, y")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(val) =>
                          field.onChange(val?.toISOString() ?? null)
                        }
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
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

export default BlogPostModel;
