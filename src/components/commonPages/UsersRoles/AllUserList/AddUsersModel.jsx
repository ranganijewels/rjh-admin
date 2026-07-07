"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RiErrorWarningFill } from "@remixicon/react";
import { Loader2 } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { Alert, AlertIcon, AlertTitle } from "@/components/common/ui/alert";
import BaseEditModal from "@/components/common/ui/BaseEditModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { useCrudApi } from "@/hooks/useCrudApi";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { Label } from "@/components/common/ui/label";

const AddUserModal = ({ open, onClose, onSuccess, editData }) => {
  console.log("editData", editData);
  const { create, update } = useCrudApi("/api/user-management");

  const { fetchAll: fetchRolesAPI } = useCrudApi("/api/roles");
  const { fetchAll: fetchDepartmentsAPI } = useCrudApi("/api/departments");

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const UserSchema = z.object({
    name: z.string().min(1, "User name is required"),
    email: z.string().email("Invalid email address"),
    password: editData
      ? z.string().optional() // not required in edit
      : z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),

    designation: z.string().min(1, "Designation is required"),

    is_manager: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      department: "",
      designation: "",
      is_manager: false,
    },
  });

  useEffect(() => {
    if (open) loadRoles();
  }, [open]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);

      const res = await fetchRolesAPI();

      if (res?.data) {
        setRoles(res.data);
      } else {
        toast.error("Failed to load roles");
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData?.name || "",
        email: editData?.email || "",
        password: "",
        role: editData?.roles?.[0]?.id ? String(editData.roles[0].id) : "",
        department: editData?.department?.id
          ? String(editData.department.id)
          : "",
        designation: editData?.designation || "",
        is_manager: editData?.is_manager === 1,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        designation: "",
        is_manager: false,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        designation: values.designation || "",
        role_id: Number(values.role),
        department_id: Number(values.department),
        is_manager: values.is_manager ? 1 : 0,
      };

      const res = editData
        ? await update(editData.id, payload)
        : await create(payload);

      if (!res?.status) {
        toast.error(res?.error || res?.message || "Something went wrong");
        return;
      }

      toast.success(editData ? "User updated" : "User added");

      onSuccess?.(res.data);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const res = await fetchDepartmentsAPI();

        const list = res?.data?.data || res?.data || [];

        if (Array.isArray(list)) {
          setDepartments(list);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        toast.error("Failed to load departments");
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [open]);

  return (
    <BaseEditModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={`${editData ? "Edit" : "Add"} User`}
      form={form}
      onSubmit={handleSubmit}
      loading={isSubmitting}
      scrollContent={
        <>
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          {!editData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Role + Department */}
          <div className="flex flex-wrap gap-4">
            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[200px]">
                  <FormLabel className="flex items-center gap-1.5">
                    Role
                    {loadingRoles && (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="w-full px-2 py-1 border rounded"
                        disabled={loadingRoles}
                      >
                        <SelectValue
                          placeholder={
                            loadingRoles
                              ? "Loading..."
                              : roles.length
                              ? "Select Role"
                              : "No roles found"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                <FormItem className="flex-1 min-w-[200px]">
                  <FormLabel className="flex items-center gap-1.5">
                    Department
                    {loadingDepartments && (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="w-full px-2 py-1 border rounded"
                        disabled={loadingDepartments}
                      >
                        <SelectValue
                          placeholder={
                            loadingDepartments
                              ? "Loading..."
                              : "Select department"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Array.isArray(departments) &&
                          departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={String(dept.id)}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled>
                              No departments found
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Designation */}
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem className="mb-4 mt-4">
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_manager"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[200px]">
                <FormLabel>Manager</FormLabel>

                <FormControl>
                  <RadioGroup
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="manager-yes" />
                      <Label htmlFor="manager-yes">Yes</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="manager-no" />
                      <Label htmlFor="manager-no">No</Label>
                    </div>
                  </RadioGroup>
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

export default AddUserModal;
