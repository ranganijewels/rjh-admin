"use client";

import React, { useContext, useId } from "react";
import {
  Controller,
  FormProvider as RHFormProvider,
  useFormContext,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { Label } from "@/components/common/ui/label";
import { cn } from "@/lib/utils";

// Contexts
const FormFieldContext = React.createContext(null);
const FormItemContext = React.createContext(null);

// Form Provider
export const Form = RHFormProvider;

// FormField
export const FormField = ({ name, ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  );
};

// Hook to access form field
export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext)
    throw new Error("FormField must be used within a FormFieldContext");

  const fieldState = getFieldState(fieldContext.name, formState);
  const id = itemContext?.id || fieldContext.name;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-item`,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    ...fieldState,
  };
};

// FormItem
export const FormItem = ({ className, ...props }) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-2.5", className)} {...props} />
    </FormItemContext.Provider>
  );
};

// FormLabel
export const FormLabel = ({ className, ...props }) => {
  const { formItemId } = useFormField();

  return (
    <Label
      htmlFor={formItemId}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
};

// FormControl
// NOTE: FormLabel MUST precede FormControl so the rendered input has an
// accessible name (FormLabel supplies the htmlFor/id association). If no
// FormLabel is used, pass aria-label or aria-labelledby explicitly.
export const FormControl = (props) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

// FormDescription
export const FormDescription = ({ className, ...props }) => {
  const { formDescriptionId, error } = useFormField();
  if (error) return null;

  return (
    <p
      id={formDescriptionId}
      className={cn("text-xs text-muted", className)}
      {...props}
    />
  );
};

// FormMessage
export const FormMessage = ({ className, children, ...props }) => {
  const { error, formMessageId } = useFormField();
  const content = error?.message || children;

  if (!content) return null;

  return (
    <p
      id={formMessageId}
      className={cn("flex items-center gap-1 text-xs text-destructive", className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        className="h-3 w-3 shrink-0 text-destructive/60"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.59c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987l6.516-11.59zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-.25-6.5a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"
          clipRule="evenodd"
        />
      </svg>
      {content}
    </p>
  );
};
