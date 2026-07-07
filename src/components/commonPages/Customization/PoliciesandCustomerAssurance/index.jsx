"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import {
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/common/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { Textarea } from "@/components/common/ui/textarea";
import { Label } from "@/components/common/ui/label";
import { Button } from "@/components/common/ui/button";
import { Loader2 } from "lucide-react";

export const PoliciesandCustomerAssurance = () => {
  const form = useForm();
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      console.log("Submitted data:", data);
      router.push("/product-shopping-experience");
    } catch (error) {
      setSubmitError(
        error?.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  return (
    <Card className={"w-full p-6"}>
      <CardContent>
        <h2 className="text-center text-2xl font-semibold mb-6">
          Policies & Customer Assurance
        </h2>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
            aria-busy={isSubmitting}
          >
            {submitError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {submitError}
              </div>
            )}
            <FormField
              control={form.control}
              name="returnpolicy"
              render={({ field }) => (
                <FormItem>
                  <span className="text-base font-medium text-mono">
                    Return & Exchange Policy
                  </span>
                  <FormControl>
                    <Textarea
                      rows={3}
                      id="returnpolicy"
                      {...field}
                      placeholder="Describe your return/exchange policy..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippinginfo"
              render={({ field }) => (
                <FormItem>
                  <span className="text-base font-medium text-mono">
                    Shipping Information
                  </span>
                  <FormControl>
                    <Textarea
                      rows={3}
                      id="shippinginfo"
                      {...field}
                      placeholder="Share your shipping methods, delivery times, and charges..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-3.5">
              <span className="text-base font-medium text-mono pb-0.5">
                Warranty Details
              </span>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="intermediate">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" />
                    <Label variant="secondary">Yes</Label>
                  </div>
                </RadioGroup>
              </div>
              <span className="text-base font-medium text-mono pb-0.5">
                Ethical Sourcing Statement
              </span>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="intermediate">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" />
                    <Label variant="secondary">Yes</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              <span className="text-base font-medium text-mono pb-0.5">
                Privacy Policy & Terms
              </span>
              <RadioGroup
                defaultValue="intermediate"
                className="flex flex-row gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="own" id="policy-own" />
                  <Label htmlFor="policy-own" variant="secondary">
                    I have my own
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="help" id="policy-help" />
                  <Label htmlFor="policy-help" variant="secondary">
                    I need help creating them
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-3.5">
              <span className="text-base font-medium text-mono pb-0.5">
                Packaging Details
              </span>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="intermediate">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" />
                    <Label variant="secondary">Yes</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-5 mr-3 mt-5">
              <Link href="#" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>
              </Link>
              <Link href="/content-branding" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-[#F1F1F2]"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              </Link>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default PoliciesandCustomerAssurance;
