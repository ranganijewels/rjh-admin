"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";

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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { Textarea } from "@/components/common/ui/textarea";

export const PoliciesandCustomerAssurance = () => {
  const form = useForm();
  const router = useRouter();
  const [submitError, setSubmitError] = useState(null);
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async () => {
    setSubmitError(null);
    try {
      router.push("/product-shopping-experience");
    } catch (error) {
      setSubmitError(
        error?.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  return (
    <Page>
      <PageHeader
        title="Policies & Customer Assurance"
        description="Set the returns, shipping, warranty and privacy rules your customers will see at checkout."
        actions={
          <Button
            type="submit"
            form="policies-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Next"
            )}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form
          id="policies-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 lg:gap-6"
          aria-busy={isSubmitting}
        >
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}

          {/* Policy content */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Policy Content
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Explain your return and shipping terms in plain language.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="returnpolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return &amp; Exchange Policy</FormLabel>
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
                    <FormLabel>Shipping Information</FormLabel>
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
            </CardContent>
          </Card>

          {/* Customer assurance */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Customer Assurance
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Reassure customers about warranty, sourcing and packaging.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Warranty Details
                </Label>
                <div className="flex flex-col items-start gap-4">
                  <RadioGroup defaultValue="intermediate">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="beginner" id="warranty-yes" />
                      <Label htmlFor="warranty-yes" variant="secondary">
                        Yes
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Ethical Sourcing Statement
                </Label>
                <div className="flex flex-col items-start gap-4">
                  <RadioGroup defaultValue="intermediate">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="beginner" id="sourcing-yes" />
                      <Label htmlFor="sourcing-yes" variant="secondary">
                        Yes
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Packaging Details
                </Label>
                <div className="flex flex-col items-start gap-4">
                  <RadioGroup defaultValue="intermediate">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="beginner" id="packaging-yes" />
                      <Label htmlFor="packaging-yes" variant="secondary">
                        Yes
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy policy */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Privacy Policy &amp; Terms
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Tell us if you already have your own policy and terms.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="intermediate"
                className="flex flex-row flex-wrap gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="own" id="policy-own" />
                  <Label htmlFor="policy-own" variant="secondary">
                    I have my own
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="help" id="policy-help" />
                  <Label htmlFor="policy-help" variant="secondary">
                    I need help creating them
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                title="Save Draft is not available yet"
              >
                Save Draft
              </Button>
              <Button
                asChild
                variant="outline"
                className={
                  isSubmitting ? "pointer-events-none opacity-50" : undefined
                }
              >
                <Link
                  href="/content-branding"
                  aria-disabled={isSubmitting || undefined}
                >
                  Previous
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </Page>
  );
};

export default PoliciesandCustomerAssurance;
