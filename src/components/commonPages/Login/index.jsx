"use client";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import React from "react";
import { Gem, Megaphone, Truck } from "lucide-react";
import LoginForm from "./LoginForm";

const HIGHLIGHTS = [
  {
    icon: Gem,
    title: "Catalogue & pricing",
    detail: "Products, collections, stones and rates in one place.",
  },
  {
    icon: Truck,
    title: "Orders end to end",
    detail: "From confirmation through production to dispatch.",
  },
  {
    icon: Megaphone,
    title: "Storefront & content",
    detail: "Pages, blogs, FAQs, navigation and campaigns.",
  },
];

const Login = () => {
  return (
    <div className="grid lg:grid-cols-2 grow h-screen">
      {/*
        The panel used to carry a template screenshot as its background, so
        the page shipped somebody else's product (and their logos) and the
        headline sat on top of it, unreadable where the two overlapped. It is
        now a plain brand surface built from the design tokens.
      */}
      <div className="order-1 relative flex flex-col overflow-hidden bg-card lg:rounded-xl lg:border lg:border-border lg:m-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_88%_-10%,color-mix(in_oklab,var(--color-brand-navy)_14%,transparent),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[280px] -right-[280px] size-[440px] rounded-full border border-border"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[200px] -right-[200px] size-[300px] rounded-full border border-border"
        />

        <div className="relative flex flex-1 flex-col justify-between gap-8 p-8 lg:p-12 xl:p-16">
          <div>
            <img
              src={"/app/rj-house.svg"}
              alt="Rangani Jewelry House"
              width="300"
              height="80"
              // The wordmark is a single navy fill, so in dark mode it is
              // inverted to stay legible against the dark panel.
              className="xl:w-[300px] w-[230px] h-auto dark:brightness-0 dark:invert"
              style={{ aspectRatio: "300 / 80" }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Rangani Jewelry House
            </h3>
            <div className="text-base font-medium text-muted-foreground">
              Your complete jewelry business management platform. <br />
              Manage products, orders, pricing, and more — <br />
              all in one place.
            </div>

            <ul className="mt-4 hidden flex-col gap-4 lg:flex">
              {HIGHLIGHTS.map(({ icon: Icon, title, detail }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/8 text-brand-navy dark:bg-foreground/10 dark:text-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="text-sm text-muted-foreground">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center p-8 lg:p-10 order-2">
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
