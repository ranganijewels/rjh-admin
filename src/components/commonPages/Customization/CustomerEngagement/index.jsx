"use client";

import React from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";

export const CustomerEngagement = () => {
  const form = useForm();

  return (
    <Page>
      <PageHeader
        title="Customer Engagement"
        description="Decide how you capture enquiries, build trust and bring shoppers back."
        actions={
          <Button asChild>
            <Link href="/dashboard/overview">Submit</Link>
          </Button>
        }
      />

      <FormProvider {...form}>
        <form className="flex flex-col gap-5 lg:gap-6">
          {/* Newsletter subscription */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Newsletter Subscription
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Collect email addresses for campaigns and new arrivals.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="beginner">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="newsletter-yes" />
                    <Label htmlFor="newsletter-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Contact form fields */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Contact Form Fields
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Choose what customers can send you through the contact form.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="contact-form-name" />
                <Label htmlFor="contact-form-name" variant="secondary">
                  Name
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="contact-form-email" />
                <Label htmlFor="contact-form-email" variant="secondary">
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="contact-form-phone" />
                <Label htmlFor="contact-form-phone" variant="secondary">
                  Phone Number
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="contact-form-message" />
                <Label htmlFor="contact-form-message" variant="secondary">
                  Message
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Live chat integration */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Live Chat Integration
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Offer real-time help on every product page.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="beginner">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="live-chat-yes" />
                    <Label htmlFor="live-chat-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Social proof elements */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Social Proof Elements
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Show the social content that builds trust in your brand.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="own"
                className="flex flex-row flex-wrap gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="own" id="social-proof-reviews" />
                  <Label htmlFor="social-proof-reviews" variant="secondary">
                    Customer Reviews
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="help" id="social-proof-instagram" />
                  <Label htmlFor="social-proof-instagram" variant="secondary">
                    Instagram Gallery
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="help" id="social-proof-both" />
                  <Label htmlFor="social-proof-both" variant="secondary">
                    Both
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Loyalty / referral program */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Loyalty/Referral Program
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Reward returning customers and the friends they send you.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="beginner">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="loyalty-yes" />
                    <Label htmlFor="loyalty-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Pop-ups or offers */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Pop-ups or Offers
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Prompt shoppers with an offer before they leave.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="beginner">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="offers-yes" />
                    <Label htmlFor="offers-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center gap-2.5 ps-5">
                <Checkbox value="own" id="offers-first-order-discount" />
                <Label htmlFor="offers-first-order-discount" variant="secondary">
                  First order discount
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                title="Save Draft is not available yet"
              >
                Save Draft
              </Button>
              <Button asChild variant="outline">
                <Link href="/product-shopping-experience">Previous</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </Page>
  );
};

export default CustomerEngagement;
