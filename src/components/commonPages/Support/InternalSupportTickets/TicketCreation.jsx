"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RiErrorWarningFill } from "@remixicon/react";
import { useCrudApi } from "@/hooks/useCrudApi";

import BaseEditModal from "@/components/common/ui/BaseEditModal";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";
import { Button } from "@/components/common/ui/button";
import { Label } from "@/components/common/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";

import { Alert } from "@/components/common/ui/alert";

import { Upload, X, Image, Video, FileText } from "lucide-react";

// Validation
const TicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  department: z.string().min(1, "Department is required"),
  priority: z.string().min(1, "Priority is required"),
  description: z.string().min(1, "Description is required"),
});

export default function TicketCreationSheet({
  isOpen,
  onOpenChange,
  onSuccess,
  editData,
}) {
  const { create, update } = useCrudApi("/api/internal-tickets");
  const { fetchAll: fetchDepartmentsApi } = useCrudApi("/api/departments");

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const form = useForm({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      ticket_id: null,
      subject: "",
      department: "",
      priority: "medium",
      description: "",
    },
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const response = await fetchDepartmentsApi();
        const data = response?.data?.data || [];

        const formatted = data.map((dept) => ({
          label: dept.name,
          value: dept.id.toString(),
        }));

        setDepartments(formatted);
      } catch (err) {
        console.error("Error fetching departments:", err);
        toast.error("Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (open) loadDepartments();
  }, [open, fetchDepartmentsApi]);

  // Handle file uploads
  const handleFileSelect = (e) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Convert all selected files to base64
      const base64Files = await Promise.all(
        selectedFiles.map((file) => fileToBase64(file))
      );

      const payload = {
        ticket_id: null,
        subject: values.subject,
        department_id: values.department,
        priority: values.priority,
        description: values.description,
        file: base64Files, // ✅ now an array of Base64 strings
      };

      if (editData) {
        await update(editData.id, payload);
        toast.success("Ticket Updated");
      } else {
        await create(payload);
        toast.success("Ticket Created");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive" close={false}>
            <RiErrorWarningFill />
            <span>{err?.message || "Something went wrong"}</span>
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
      open={isOpen}
      onOpenChange={onOpenChange}
      title={editData ? "Edit Ticket" : "Create Ticket"}
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      scrollContent={
        <>
          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Subject *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter ticket subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Department *</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={loadingDepartments}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Priority *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
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
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain the issue..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attachments */}
          <Label>Attachments</Label>
          <div className="border rounded p-4 mt-2 text-center space-y-3">
            <Upload className="mx-auto h-6 w-6" />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current.click()}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              {selectedFiles.map((file, idx) => {
                const Icon = file.type.startsWith("image/")
                  ? Image
                  : file.type.startsWith("video/")
                  ? Video
                  : FileText;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-brand" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      }
    />
  );
}
