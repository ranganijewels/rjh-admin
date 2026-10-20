"use client";

import React from "react";
import { Gem, Megaphone, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/common/ui/cards/card";
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

/**
 * The sign-in screen.
 *
 * Two halves: the brand on the left, the form on the right. The brand half is
 * the house navy with a gold wash and a pair of rings — the setting motif —
 * bleeding off the corner, which is the one piece of jewellery imagery the
 * panel needs. The wordmark is the navy logo inverted, so it reads white on
 * the navy.
 */
const Login = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ─── The brand half ─────────────────────────────────────── */}
      <section className="relative hidden overflow-hidden bg-brand-navy-panel lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* A warm wash in the top corner, and the rings below it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_85%_at_88%_-10%,color-mix(in_oklab,var(--color-accent-gold)_34%,transparent),transparent_62%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-72 -right-56 size-[600px] rounded-full border border-accent-gold/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-56 -right-40 size-[460px] rounded-full border border-accent-gold/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-24 size-[320px] rounded-full border border-accent-gold/10"
        />

        <div className="relative">
          <img
            src="/app/rj-house.svg"
            alt="Rangani Jewelry House"
            width="300"
            height="80"
            className="w-[240px] brightness-0 invert xl:w-[280px]"
            style={{ aspectRatio: "300 / 80" }}
          />
        </div>

        <div className="relative max-w-lg">
          <span className="block h-px w-12 bg-accent-gold/70" />
          <p className="mt-6 text-3xl font-semibold leading-tight text-white xl:text-4xl">
            The whole jewellery business,
            <br />
            in one place.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Products, pricing, orders, fulfilment and the storefront — one
            panel for the team that runs Rangani Jewelry House.
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-gold">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-white">{title}</span>
                  <span className="text-sm text-white/60">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          Rangani Jewelry House · Admin panel
        </p>
      </section>

      {/* ─── The form half ──────────────────────────────────────── */}
      <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          {/* On a phone the brand half is hidden, so it names itself here. */}
          <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
            <img
              src="/app/rj-house.svg"
              alt="Rangani Jewelry House"
              width="300"
              height="80"
              className="w-[210px]"
              style={{ aspectRatio: "300 / 80" }}
            />
            <p className="text-center text-sm text-muted-foreground">
              The whole jewellery business, in one place.
            </p>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Sign in
                </h1>
                <p className="text-sm text-muted-foreground">
                  Use your Rangani Jewelry House admin account.
                </p>
              </div>

              <LoginForm />
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
};

export default Login;
