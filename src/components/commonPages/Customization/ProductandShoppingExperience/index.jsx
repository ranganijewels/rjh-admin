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

export const ProductandShoppingExperience = () => {
  const form = useForm();

  return (
    <Page>
      <PageHeader
        title="Product & Shopping Experience"
        description="Control how customers browse, filter, pay and see stock on your storefront."
        actions={
          <Button asChild>
            <Link href="/customer-engagement">Next</Link>
          </Button>
        }
      />

      <FormProvider {...form}>
        <form className="flex flex-col gap-5 lg:gap-6">
          {/* Custom order option */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Custom Order Option
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Let customers request a bespoke piece alongside your catalogue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="intermediate">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="custom-order-yes" />
                    <Label htmlFor="custom-order-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Product filtering options */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Product Filtering Options
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Give shoppers the filters they use to narrow the catalogue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="product-filtering-category" />
                <Label htmlFor="product-filtering-category" variant="secondary">
                  Category
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="product-filtering-price" />
                <Label htmlFor="product-filtering-price" variant="secondary">
                  Price Range
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="product-filtering-material" />
                <Label htmlFor="product-filtering-material" variant="secondary">
                  Material
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="product-filtering-gemstone" />
                <Label htmlFor="product-filtering-gemstone" variant="secondary">
                  Gemstone
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Checkbox value="own" id="product-filtering-occasion" />
                <Label htmlFor="product-filtering-occasion" variant="secondary">
                  Occasion
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Related products display */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Related Products Display
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Show shoppers pieces that pair well with what they are viewing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <RadioGroup defaultValue="intermediate">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="beginner" id="related-products-yes" />
                    <Label htmlFor="related-products-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Out of stock handling */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Out-of-Stock Handling
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Decide what shoppers see when a piece is no longer available.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="intermediate"
                className="flex flex-row flex-wrap gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="own" id="out-of-stock-hide" />
                  <Label htmlFor="out-of-stock-hide" variant="secondary">
                    Hide product
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="help" id="out-of-stock-show" />
                  <Label htmlFor="out-of-stock-show" variant="secondary">
                    Show “Out of Stock”
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="help" id="out-of-stock-backorder" />
                  <Label htmlFor="out-of-stock-backorder" variant="secondary">
                    Allow backorders
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Currency and payment methods */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Currency &amp; Payment Methods
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Set the currency you price in and the ways customers can pay.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Currency Preferences
                </Label>
                <div className="flex items-center gap-2.5">
                  <Checkbox value="own" id="currency-usd" />
                  <Label htmlFor="currency-usd" variant="secondary">
                    USD
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Payment Methods
                </Label>
                <div className="flex items-center gap-2.5">
                  <Checkbox value="own" id="payment-credit" />
                  <Label htmlFor="payment-credit" variant="secondary">
                    Credit/Debit Cards
                  </Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <Checkbox value="own" id="payment-paypal" />
                  <Label htmlFor="payment-paypal" variant="secondary">
                    PayPal
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="outline" title="Save Draft is not available yet">
                Save Draft
              </Button>
              <Button asChild variant="outline">
                <Link href="/policies">Previous</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </Page>
  );
};

export default ProductandShoppingExperience;
