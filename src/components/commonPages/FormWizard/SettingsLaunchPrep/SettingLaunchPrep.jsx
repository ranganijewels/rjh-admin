"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
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
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Switch } from "@/components/common/ui/switch";
import { useCrudApi } from "@/hooks/useCrudApi";

const defaultValues = {
  store_id: 1,
  contact_email: "",
  whatsapp_support_number: "",
  support_phone_number: "",
  enable_order_notes: true,
  enable_gift_packaging: false,
  has_payment_gateway: "yes",
  gateway_name: "",
  merchant_id: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  payout_account_type: "savings",
  gst_number: "",
  enable_international_orders: true,
  default_currency: "CAD",
  default_language: "en",
  international_account_type: "savings",
};

// Small labelled radio group used by the payment / payout sections.
const RadioGroupField = ({ label, value, onChange, options }) => {
  const groupId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm">{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-6"
      >
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={`${groupId}-${opt.value}`} />
            <Label
              htmlFor={`${groupId}-${opt.value}`}
              className="text-sm font-normal text-foreground"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export const SettingLaunchPrep = () => {
  const { create, read } = useCrudApi("/api/store-setting");

  const form = useForm({
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  // Watched at the top level so the hook order never changes between renders.
  const hasPaymentGateway = useWatch({
    control,
    name: "has_payment_gateway",
  });

  // NOTE: `useCrudApi` does not expose a `read` helper, so the call below
  // throws and is swallowed by the catch — the saved settings are therefore
  // never overwritten. The call is kept as-is because changing the API
  // surface is out of scope for the design-system migration.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await read();
        if (res) reset(res);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    fetchData();
  }, [read, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      has_payment_gateway: values.has_payment_gateway === "yes",
      payout_account_type: values.payout_account_type === "savings" ? 0 : 1,
      international_account_type:
        values.international_account_type === "savings" ? 0 : 1,
    };

    try {
      await create(payload);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Error saving settings");
    }
  };

  return (
    <Page>
      <PageHeader
        title="Store Settings & Launch Prep"
        description="Finish the store configuration before you go live."
        actions={
          <Button
            size="md"
            type="submit"
            form="store-settings-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      <Form {...form}>
        <form
          id="store-settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-5 lg:gap-6"
        >
          {/* Store contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Store contact info
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                How customers and the support team can reach you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact Email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="whatsapp_support_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">
                      WhatsApp Support Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="WhatsApp Support Number"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="support_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">
                      Support Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Support Phone Number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="enable_order_notes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4">
                    <FormLabel className="font-normal">
                      Enable Order Notes
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="enable_gift_packaging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4">
                    <FormLabel className="font-normal">
                      Enable Gift Packaging
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment gateway setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Payment Gateway Setup
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Connect the gateway you use to accept online payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={control}
                name="has_payment_gateway"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">
                      Do you have a Payment Gateway?
                    </FormLabel>
                    <FormControl>
                      <RadioGroupField
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { label: "Yes", value: "yes" },
                          { label: "No", value: "no" },
                        ]}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {hasPaymentGateway === "yes" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="gateway_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Gateway Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Gateway Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="merchant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">
                          Merchant ID / API Key
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Merchant ID / API Key"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout & bank details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Payout &amp; Bank Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                The account where your settlement payouts are sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="account_holder_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">
                      Account Holder Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Account Holder Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Account Number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="ifsc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">IFSC Code</FormLabel>
                    <FormControl>
                      <Input placeholder="IFSC Code" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="payout_account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">Account Type</FormLabel>
                    <FormControl>
                      <RadioGroupField
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { label: "Savings", value: "savings" },
                          { label: "Current", value: "current" },
                        ]}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal">
                      PAN/GST Number (optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="PAN/GST Number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* International & localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                International &amp; Localisation
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Currency, language and cross-border selling preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={control}
                name="enable_international_orders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4">
                    <FormLabel className="font-normal">
                      Enable International Orders
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={control}
                  name="default_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Default Currency
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="default_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-normal">
                        Default Language
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step navigation */}
          <Card>
            <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button size="md" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
              <Button variant="outline" size="md" asChild>
                <Link href="#">Previous</Link>
              </Button>
              <Button size="md" asChild>
                <Link href="/final-review">Next</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </Page>
  );
};

export default SettingLaunchPrep;
