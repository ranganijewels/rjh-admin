"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SquareMousePointer, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { Input, InputWrapper } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Spinner } from "@/components/common/ui/spinners";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useWizardPaths } from "@/hooks/useWizardPaths";

const BrandingForm = () => {
  const [stepData, setStepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [actionType, setActionType] = useState("next");
  const { fetchAll } = useCrudApi("/api/onboarding/branding");
  const { create } = useCrudApi("/api/store-branding");
  const router = useRouter();
  const { next, previous } = useWizardPaths();

  // Field mapping for API payload keys
  const FIELD_MAPPING = {
    33: "tone_of_voice",
    34: "font_style",
    35: "tagline",
    36: "branding_contact",
    37: "logo_path",
    38: "primary_color",
    39: "secondary_color",
    40: "store_id",
  };

  // Dynamic Zod schema for form validation
  const createDynamicSchema = (questions) => {
    if (!questions || questions.length === 0) {
      return z.object({});
    }

    const schemaObject = {};
    questions.forEach((question) => {
      const fieldName = `question_${question.id}`;
      const questionText = question.question_text.toLowerCase();

      if (question.answer_type === "text") {
        if (
          questionText.includes("contact") ||
          questionText.includes("phone")
        ) {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .regex(/^\+?[1-9]\d{9,14}$/, {
              message:
                "Please enter a valid phone number (e.g., +911236547893).",
            });
        } else if (
          questionText.includes("store id") ||
          questionText.includes("store")
        ) {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .max(15, { message: "Store ID must not exceed 15 characters." });
        } else {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .min(2, {
              message: `${question.question_text} must be at least 2 characters.`,
            });
        }
      } else if (question.answer_type === "dropdown") {
        schemaObject[fieldName] = z
          .string()
          .nonempty({ message: `Please select ${question.question_text}.` });
      } else if (question.answer_type === "file") {
        schemaObject[fieldName] = z
          .instanceof(File, {
            message: `${question.question_text} is required.`,
          })
          .refine(
            (file) => {
              const validTypes = ["image/svg+xml", "image/png", "image/jpeg"];
              return file && validTypes.includes(file.type);
            },
            { message: "File must be an SVG, PNG, or JPG." }
          )
          .refine((file) => file && file.size <= 5 * 1024 * 1024, {
            message: "File size must not exceed 5MB.",
          });
      } else if (question.answer_type === "color_picker") {
        schemaObject[fieldName] = z
          .string()
          .nonempty({ message: `${question.question_text} is required.` })
          .regex(/^#[0-9A-Fa-f]{6}$|^[a-zA-Z]+$/, {
            message:
              "Please enter a valid hex color (e.g., #FFFFFF) or color name (e.g., yellow).",
          });
      }
    });

    return z.object(schemaObject);
  };

  // Default form values
  const createDefaultValues = (questions) => {
    if (!questions || questions.length === 0) {
      return {};
    }

    const defaultValues = {};
    questions.forEach((question) => {
      const fieldName = `question_${question.id}`;
      if (question.answer_type === "color_picker") {
        defaultValues[fieldName] = question.id === 38 ? "#fafafa" : "yellow";
      } else if (question.answer_type === "file") {
        defaultValues[fieldName] = null;
      } else {
        // defaultValues[fieldName] = "";
        defaultValues[fieldName] = question.id === 40 ? "1" : "";
      }
    });
    defaultValues["question_40"] = "1";
    return defaultValues;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchAll();
      const rawData = res.data;
      if (!rawData?.questions) {
        throw new Error("No questions found in response");
      }
      const normalizedQuestions = Object.values(rawData.questions).sort(
        (a, b) => a.display_order - b.display_order
      );

      setStepData({
        ...rawData,
        questions: normalizedQuestions,
      });
    } catch (err) {
      console.error("fetchAll error:", err);
      setError(err.message || "Error fetching branding data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm({
    resolver: stepData?.questions
      ? zodResolver(createDynamicSchema(stepData.questions))
      : zodResolver(z.object({})),
    defaultValues: stepData?.questions
      ? createDefaultValues(stepData.questions)
      : {},
    mode: "onChange",
  });

  useEffect(() => {
    if (stepData?.questions) {
      const newDefaultValues = createDefaultValues(stepData.questions);
      form.reset(newDefaultValues);
    }
  }, [stepData, form]);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event, field) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      field.onChange(file);
    }
  };
  const onSubmit = async (formValues) => {
    try {
      setLoading(true);

      if (actionType === "next") {
        const isValid = await form.trigger();
        if (!isValid) {
          const errorFields = Object.keys(form.formState.errors);
          const firstError = errorFields.length
            ? form.formState.errors[errorFields[0]]?.message
            : null;
          setError(
            firstError ||
              "Form validation failed. Please check the highlighted fields below."
          );
          return;
        }
      }

      // Default payload
      const payload = {
        font_style: "",
        tone_of_voice: "",
        tagline: "",
        branding_contact: "",
        logo_path: "",
        primary_color: "",
        secondary_color: "",
        submitted: 1,
      };

      // Loop over form values
      for (const [key, value] of Object.entries(formValues)) {
        const questionId = parseInt(key.replace("question_", ""), 10);
        const question = stepData.questions.find((q) => q.id === questionId);
        if (!question) continue;

        const payloadKey =
          FIELD_MAPPING[questionId] ||
          mapQuestionToField(question.question_text) ||
          `question_${questionId}`;

        // If it's the tone_of_voice field → store as Base64 text
        if (payloadKey === "tone_of_voice" && typeof value === "string") {
          payload[payloadKey] = btoa(value); // simple Base64 for text
        }
        // If it's the logo_path field → convert File to Base64
        else if (payloadKey === "logo_path" && value instanceof File) {
          payload[payloadKey] = await fileToBase64(value);
        }
        // All other fields → store normally
        else {
          payload[payloadKey] = value ?? "";
        }
      }

      await create(payload);

      if (actionType === "next") {
        router.push(next.path);
      } else {
        toast.success("Draft saved successfully!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to submit branding details");
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert File → Base64 string
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Reads as "data:image/png;base64,..."
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const mapQuestionToField = (questionText) => {
    const text = questionText.toLowerCase();
    if (text.includes("logo") || text.includes("image")) return "logo_path";
    if (text.includes("primary color")) return "primary_color";
    if (text.includes("secondary color")) return "secondary_color";
    if (text.includes("font") || text.includes("style")) return "font_style";
    if (
      text.includes("tone") ||
      text.includes("voice") ||
      text.includes("tone_of_voice")
    )
      return "tone_of_voice";
    if (text.includes("tagline") || text.includes("slogan")) return "tagline";
    if (text.includes("branding_contact") || text.includes("phone"))
      return "branding_contact";
    if (text.includes("store id") || text.includes("store")) return "store_id";
    return null;
  };

  const questions = stepData?.questions || [];
  const assetQuestions = questions.filter((q) => q.answer_type === "file");
  const colorQuestions = questions.filter(
    (q) => q.answer_type === "color_picker"
  );
  const detailQuestions = questions.filter(
    (q) => q.answer_type !== "file" && q.answer_type !== "color_picker"
  );

  const isReady = Boolean(stepData?.questions?.length) && !error;

  return (
    <Page>
      <PageHeader
        title={stepData?.name || "Branding"}
        description="Set the logo, colours and voice that your customers will see."
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={() => {
                setActionType("draft");
                onSubmit(form.getValues());
              }}
            >
              Save Draft
            </Button>
            <Button
              size="md"
              type="submit"
              form="branding-form"
              onClick={() => setActionType("next")}
              disabled={!isReady || loading}
            >
              {loading ? "Submitting..." : "Next"}
            </Button>
          </>
        }
      />

      {error ? (
        <Card>
          <CardContent className="p-5 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : !isReady ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form
            id="branding-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 lg:gap-6"
          >
            {assetQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Brand assets
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Upload the artwork used across your storefront.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {assetQuestions.map((q) => {
                    const fieldName = `question_${q.id}`;
                    return (
                      <FormField
                        key={q.id}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <div className="grid gap-2.5">
                            <Label
                              htmlFor={`branding-file-${q.id}`}
                              className="text-sm font-medium text-foreground"
                            >
                              {q.question_text}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {q.question_label}
                            </span>

                            <div className="flex flex-wrap justify-between gap-5">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={handleFileClick}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleFileClick();
                                  }
                                }}
                                className="flex w-full cursor-pointer place-items-center justify-center rounded-xl border border-dashed border-border bg-accent p-7 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-xs">
                                    <Upload className="size-5" />
                                  </span>
                                  <span className="text-sm font-medium text-foreground">
                                    Click or Drag &amp; Drop
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    SVG, PNG, JPG (max. 800x400)
                                  </span>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    id={`branding-file-${q.id}`}
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileChange(e, field)}
                                    className="hidden"
                                  />
                                </div>
                              </div>

                              {previewUrl && (
                                <Image
                                  src={previewUrl}
                                  alt="Logo preview"
                                  width={130}
                                  height={130}
                                  unoptimized
                                  className="mt-2 h-[130px] w-[130px] rounded object-contain"
                                />
                              )}
                            </div>
                            <FormMessage />
                          </div>
                        )}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {colorQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Brand colours
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Pick the primary and secondary colours for your theme.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {colorQuestions.map((q) => {
                    const fieldName = `question_${q.id}`;
                    return (
                      <FormField
                        key={q.id}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <div className="flex w-full flex-wrap items-center justify-between gap-5">
                            <div className="flex flex-col">
                              <Label
                                htmlFor={`color-input-${q.id}`}
                                className="text-sm font-medium text-foreground"
                              >
                                {q.question_text}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {q.question_label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                id={`color-input-${q.id}`}
                                className="pointer-events-none absolute h-0 w-0 opacity-0"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <InputWrapper className="w-52">
                                <Button
                                  variant="outline"
                                  mode="icon"
                                  size="sm"
                                  type="button"
                                  aria-label="Pick a colour"
                                  title="Pick a colour"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const colorInput = document.getElementById(
                                      `color-input-${q.id}`
                                    );
                                    if (colorInput) {
                                      colorInput.click();
                                    }
                                  }}
                                >
                                  <SquareMousePointer
                                    size={16}
                                    style={{ color: field.value }}
                                  />
                                </Button>
                                <Input
                                  type="text"
                                  {...field}
                                  placeholder="Enter hex color or name (e.g., #FFFFFF or yellow)"
                                />
                              </InputWrapper>
                            </div>
                            <FormMessage />
                          </div>
                        )}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {detailQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Brand details
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Tell us how your brand sounds and how we can reach you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {detailQuestions.map((q) => {
                    const fieldName = `question_${q.id}`;
                    return (
                      <div key={q.id} className="grid gap-2.5">
                        {q.answer_type === "text" && (
                          <FormField
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{q.question_text}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={q.question_label}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {q.answer_type === "dropdown" && (
                          <FormField
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{q.question_text}</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={q.question_label}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {q.options.length === 0 ? (
                                          <div className="p-2 text-center text-xs text-muted-foreground">
                                            No options available
                                          </div>
                                        ) : (
                                          q.options?.map((que) => (
                                            <SelectItem
                                              key={que.id}
                                              value={String(que.value)}
                                            >
                                              {que.value}
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
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => {
                    setActionType("draft");
                    onSubmit(form.getValues());
                  }}
                >
                  Save Draft
                </Button>
                {previous?.path && (
                  <Button
                    variant="outline"
                    size="md"
                    type="button"
                    onClick={() => router.push(previous.path)}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  size="md"
                  type="submit"
                  onClick={() => setActionType("next")}
                  disabled={!isReady || loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </Page>
  );
};

export default BrandingForm;
