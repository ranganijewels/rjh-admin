"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/common/ui/alert";
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
import { Input } from "@/components/common/ui/input";
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
import { Textarea } from "@/components/common/ui/textarea";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useWizardPaths } from "@/hooks/useWizardPaths";
import { useWizard } from "@/context/WizardContext";
import { setStoreId } from "@/store/slices/storeSlice";

const BusinessDetailsForm = () => {
  const [stepData, setStepData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { next, previous } = useWizardPaths();
  const { fetchAll } = useCrudApi("/api/onboarding/business-details");
  const { create } = useCrudApi("/api/store-profile");
  const { wizardData } = useWizard();
  const dispatch = useDispatch();

  const FIELD_MAPPING = {
    1: "business_name",
    2: "business_type",
    3: "gst_pan",
    4: "business_email",
    5: "business_contact",
    6: "business_address",
  };

  const mapQuestionToField = (questionText) => {
    const text = questionText.toLowerCase();

    if (
      text.includes("business name") ||
      text.includes("company name") ||
      text.includes("official business name")
    ) {
      return "business_name";
    } else if (
      text.includes("business type") ||
      text.includes("type of business")
    ) {
      return "business_type";
    } else if (
      text.includes("gst") ||
      text.includes("pan") ||
      text.includes("gstin")
    ) {
      return "gst_pan";
    } else if (text.includes("email")) {
      return "business_email";
    } else if (
      text.includes("contact") ||
      text.includes("phone") ||
      text.includes("whatsapp")
    ) {
      return "business_contact";
    } else if (text.includes("address")) {
      return "business_address";
    }

    return null;
  };

  const createDynamicSchema = (questions) => {
    if (!questions || questions.length === 0) {
      return z.object({});
    }

    const schemaObject = {};

    questions.forEach((question) => {
      const fieldName = `question_${question.id}`;
      const questionText = question.question_text.toLowerCase();

      if (question.answer_type === "text") {
        if (questionText.includes("email")) {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .email({ message: "Please enter a valid email address." });
        } else if (
          questionText.includes("mobile") ||
          questionText.includes("phone") ||
          questionText.includes("contact") ||
          questionText.includes("whatsapp")
        ) {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .regex(/^[+]?[1-9]\d{1,14}$/, {
              message: "Please enter a valid mobile number (10-15 digits).",
            })
            .min(10, { message: "Mobile number must be at least 10 digits." })
            .max(15, { message: "Mobile number cannot exceed 15 digits." });
        } else {
          schemaObject[fieldName] = z
            .string()
            .nonempty({ message: `${question.question_text} is required.` })
            .min(1, { message: `${question.question_text} is required.` });
        }
      } else if (question.answer_type === "dropdown") {
        schemaObject[fieldName] = z
          .string()
          .nonempty({ message: `Please select ${question.question_text}.` });
      } else if (question.answer_type === "textarea") {
        schemaObject[fieldName] = z
          .string()
          .nonempty({ message: `${question.question_text} is required.` })
          .min(10, {
            message: `${question.question_text} must be at least 10 characters.`,
          });
      }
    });

    return z.object(schemaObject);
  };

  const createDefaultValues = (questions) => {
    if (!questions || questions.length === 0) return {};

    const defaultValues = {};
    const profile = wizardData?.profile || {};
    questions.forEach((question) => {
      const fieldName = `question_${question.id}`;
      let defaultValue = "";

      const payloadField =
        FIELD_MAPPING[question.id] ||
        mapQuestionToField(question.question_text);

      if (payloadField && profile[payloadField]) {
        defaultValue = profile[payloadField];
      }

      defaultValues[fieldName] = defaultValue;
    });

    return defaultValues;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchAll();
      setStepData(res.data || []);
    } catch (err) {
      setError(err.message || "Error fetching data");
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
    if (stepData?.questions && wizardData?.profile) {
      const newDefaultValues = createDefaultValues(stepData.questions);
      form.reset(newDefaultValues);
    }
  }, [stepData, wizardData]);

  const onSubmit = async (formValues) => {
    try {
      setLoading(true);
      const profile = wizardData?.profile || {};
      const payload = {
        business_name: "",
        business_type: "",
        gst_pan: "",
        business_email: "",
        business_contact: "",
        business_address: "",
        submitted: 1,
      };

      // Map form values to payload fields
      Object.entries(formValues).forEach(([key, value]) => {
        const questionId = parseInt(key.replace("question_", ""), 10);
        const question = stepData.questions.find((q) => q.id === questionId);

        if (question && value?.trim()) {
          let payloadField =
            FIELD_MAPPING[questionId] ||
            mapQuestionToField(question.question_text);
          if (payloadField && payload.hasOwnProperty(payloadField)) {
            payload[payloadField] = value.trim();
          }
        }
      });

      const response = await create(payload);

      if (response?.data?.store_id) {
        localStorage.setItem("store_id", response.data.store_id);

        dispatch(setStoreId(response.data.store_id));
      }

      router.push(next.path);
    } catch (err) {
      console.error("Error submitting:", err.message || err);
      toast.error(err.message || "Failed to save business details");
    } finally {
      setLoading(false);
    }
  };

  const isReady = Boolean(stepData?.questions) && !error;

  return (
    <Page>
      <PageHeader
        title={stepData?.name || "Business Details"}
        description="Tell us about your business so we can tailor your storefront."
        actions={
          <>
            <Button variant="ghost" size="md" type="button">
              Save Draft
            </Button>
            <Button
              size="md"
              type="submit"
              form="business-details-form"
              disabled={!isReady || loading}
            >
              {loading ? "Submitting..." : "Next"}
            </Button>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive" appearance="light" close={false}>
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Could not load this step</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      ) : (
        <Form {...form}>
          <Card>
            <form
              id="business-details-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Business information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Answer the questions below — they are used to set up your store
                  profile.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isReady ? (
                  <div className="grid gap-5">
                    {stepData?.questions?.map((q) => {
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
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
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
                                      value={field.value || ""}
                                      name={field.name}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={q.question_label}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          {q.options?.length === 0 ? (
                                            <div className="p-2 text-center text-xs text-muted-foreground">
                                              No options available
                                            </div>
                                          ) : (
                                            q.options?.map((option) => (
                                              <SelectItem
                                                key={option.id}
                                                value={String(option.value)}
                                              >
                                                {option.value}
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

                          {q.answer_type === "textarea" && (
                            <FormField
                              control={form.control}
                              name={fieldName}
                              render={({ field }) => (
                                <FormItem className="w-full">
                                  <FormLabel>{q.question_text}</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      size="md"
                                      className="min-h-[80px]"
                                      placeholder={q.question_label}
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-9 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="ghost" size="md" type="button">
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
                  disabled={!isReady || loading}
                >
                  {loading ? "Submitting..." : "Next"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </Form>
      )}
    </Page>
  );
};

export default BusinessDetailsForm;
