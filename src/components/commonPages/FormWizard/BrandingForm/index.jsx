"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Input, InputWrapper } from "@/components/common/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { ImageIcon, SquareMousePointer } from "lucide-react";
import { Spinner } from "@/components/common/ui/spinners";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useWizardPaths } from "@/hooks/useWizardPaths";
import { useRouter } from "next/navigation";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { toast } from "sonner";
import { useWizard } from "@/context/WizardContext";

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
  const { wizardData } = useWizard();

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

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="pb-2.5 w-full h-auto justify-center">
      <Form {...form}>
        <div className="text-center mt-[40px] text-xl font-medium leading-none">
          {stepData?.name}
        </div>
        <div className="grid gap-5 lg:gap-7.5 xl:w-[38.75rem] w-full mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-5">
              {stepData?.questions?.map((q) => {
                const fieldName = `question_${q.id}`;
                return (
                  <div
                    key={q.id}
                    className="flex flex-col items-baseline flex-wrap lg:flex-nowrap gap-2.5"
                  >
                    {q.answer_type === "file" && (
                      <FormField
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <div className="flex flex-wrap justify-between gap-5">
                            <div className="flex flex-col">
                              <div className="text-mono text-sm font-medium">
                                {q.question_text}
                              </div>
                              <span className="text-secondary-foreground text-sm">
                                {q.question_label}
                              </span>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap gap-5 lg:gap-7.5 max-w-96 w-full">
                              <div
                                className="flex bg-center w-full p-5 lg:p-7 bg-no-repeat bg-[length:550px] border border-input rounded-xl border-dashed branding-bg cursor-pointer"
                                onClick={handleFileClick}
                              >
                                <div className="flex flex-col place-items-center place-content-center text-center rounded-xl w-full">
                                  <div className="flex items-center mb-2.5">
                                    <div className="relative size-11 shrink-0">
                                      <svg
                                        className="w-full h-full stroke-orange-200 fill-white"
                                        width="44"
                                        height="48"
                                        viewBox="0 0 44 48"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M16 2.4641C19.7128 0.320509 24.2872 0.320508 28 2.4641L37.6506 8.0359C41.3634 10.1795 43.6506 14.141 43.6506 18.4282V29.5718C43.6506 33.859 41.3634 37.8205 37.6506 39.9641L28 45.5359C24.2872 47.6795 19.7128 47.6795 16 45.5359L6.34937 39.9641C2.63655 37.8205 0.349365 33.859 0.349365 29.5718V18.4282C0.349365 14.141 2.63655 10.1795 6.34937 8.0359L16 2.4641Z" />
                                        <path
                                          d="M16.25 2.89711C19.8081 0.842838 24.1919 0.842837 27.75 2.89711L37.4006 8.46891C40.9587 10.5232 43.1506 14.3196 43.1506 18.4282V29.5718C43.1506 33.6804 40.9587 37.4768 37.4006 39.5311L27.75 45.1029C24.1919 47.1572 19.8081 47.1572 16.25 45.1029L6.59937 39.5311C3.04125 37.4768 0.849365 33.6803 0.849365 29.5718V18.4282C0.849365 14.3196 3.04125 10.5232 6.59937 8.46891L16.25 2.89711Z"
                                          stroke=""
                                          strokeOpacity="0.2"
                                        />
                                      </svg>
                                      <div className="absolute left-2/4 top-2/4 -translate-y-2/4 -translate-x-2/4">
                                        <ImageIcon className="text-xl ps-px text-primary" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-mono text-xs font-medium hover:text-primary mb-px">
                                    Click or Drag & Drop
                                  </div>
                                  <span className="text-xs text-secondary-foreground text-nowrap">
                                    SVG, PNG, JPG (max. 800x400)
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
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
                                  className="h-[130px] w-[130px] mt-2 rounded object-contain"
                                />
                              )}
                            </div>
                            <FormMessage />
                          </div>
                        )}
                      />
                    )}

                    {q.answer_type === "color_picker" && (
                      <FormField
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <div className="flex w-full justify-between gap-5">
                            <div className="flex flex-col">
                              <div className="text-mono text-sm font-medium">
                                {q.question_text}
                              </div>
                              <span className="text-secondary-foreground text-sm">
                                {q.question_label}
                              </span>
                            </div>
                            <InputWrapper className="w-52 relative">
                              <input
                                type="color"
                                id={`color-input-${q.id}`}
                                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <Button
                                variant="dim"
                                mode="icon"
                                type="button"
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
                            <FormMessage />
                          </div>
                        )}
                      />
                    )}

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
                                  <SelectValue placeholder={q.question_label} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {q.options.length === 0 ? (
                                      <div className="text-center text-gray-500">
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

              <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mt-10">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setActionType("draft");
                    onSubmit(form.getValues());
                  }}
                >
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(previous.path)}
                >
                  Previous
                </Button>

                <Button
                  type="submit"
                  onClick={() => setActionType("next")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="animate-spin size-4" />
                      Submitting...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </div>
      </Form>
    </Card>
  );
};

export default BrandingForm;
