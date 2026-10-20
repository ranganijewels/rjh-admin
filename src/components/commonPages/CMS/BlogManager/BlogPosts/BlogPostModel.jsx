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
import { Switch } from "@/components/common/ui/switch";
import RichTextEditor from "@/components/common/RichTextEditor";
import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { getAuthToken } from "@/lib/auth-token";

const defaultValues = {
  title: "",
  excerpt: "",
  content: "",
  author: "RJ House",
  category: "",
  featuredImageUrl: "",
  isPublished: true,
};

// Matches the real CmsBlog entity (title/excerpt/content/featuredImageUrl/
// tags/author/isPublished) — there's no dedicated category relation on a
// blog post, so "Category" here just sets the post's first tag, which is
// also how the storefront's category filter reads it back.
const BlogPostModel = ({ open, onClose, onSuccess, editData, storeId, postId }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const fileRef = useRef(null);

  const { create, update } = useCrudApi(`/api/cms/blog/${storeId}/posts`);
  const { fetchAll: fetchCategories } = useCrudApi(`/api/cms/blog/${storeId}/categories`);

  const form = useForm({ defaultValues });
  const { setValue } = form;

  useEffect(() => {
    if (editData?.id) {
      form.reset({
        title: editData.title || "",
        excerpt: editData.excerpt || "",
        content: editData.content || "",
        author: editData.author || "RJ House",
        category: editData.tags?.[0] || "",
        featuredImageUrl: editData.featuredImageUrl || "",
        isPublished: editData.isPublished ?? true,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editData, form]);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, [fetchCategories]);

  const handleFileClick = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = getAuthToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload?bucket=cms-media&prefix=blog", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      setValue("featuredImageUrl", json.url);
    } catch (err) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const category = categories.find((c) => c.valueKey === values.category);
      const payload = {
        title: values.title,
        excerpt: values.excerpt,
        content: values.content,
        author: values.author || "RJ House",
        featuredImageUrl: values.featuredImageUrl || null,
        tags: category ? [category.valueLabel] : [],
        isPublished: values.isPublished,
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

  const featuredImageUrl = form.watch("featuredImageUrl");

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
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.length === 0 ? (
                          <div className="text-center text-xs text-muted-foreground py-2">
                            No categories yet — add one in the Categories tab
                          </div>
                        ) : (
                          categories
                            .filter((c) => c.isActive)
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.valueKey}>
                                {cat.valueLabel}
                              </SelectItem>
                            ))
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
            rules={{ required: "Title is required" }}
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

          {/* Excerpt */}
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Short summary shown on the blog listing card"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            rules={{ required: "Content is required" }}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write the full article..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Image */}
          <FormField
            control={form.control}
            name="featuredImageUrl"
            render={() => (
              <FormItem className="mb-4">
                <FormLabel>Featured Image</FormLabel>
                <div className="flex gap-6 h-[140px]">
                  <div
                    className="flex flex-col items-center justify-center w-full max-w-[300px] p-6 border border-dashed rounded-xl cursor-pointer"
                    onClick={handleFileClick}
                  >
                    {uploading ? (
                      <Loader2 className="text-primary mb-2 animate-spin" />
                    ) : (
                      <ImageIcon className="text-primary mb-2" />
                    )}
                    <div className="text-xs font-medium">
                      {uploading ? "Uploading…" : "Click to upload"}
                    </div>
                    <span className="text-xs text-muted-foreground">JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {featuredImageUrl && (
                    <Image
                      src={featuredImageUrl}
                      alt="Featured"
                      width={160}
                      height={140}
                      sizes="160px"
                      unoptimized
                      className="aspect-[160/140] h-[140px] w-[160px] rounded object-cover"
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published Toggle */}
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="mb-4 flex items-center justify-between">
                <FormLabel className="!mb-0">Published</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
