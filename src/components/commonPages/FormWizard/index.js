"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  Card,
  CardContent,
} from "@/components/common/ui/cards/card";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Skeleton } from "@/components/common/ui/skeleton";

export default function FormWizard() {
  const router = useRouter();
  const { on_boarding_exists } = useSelector((state) => state.auth);

  useEffect(() => {
    if (on_boarding_exists) {
      router.replace("/dashboard");
    } else {
      router.replace("/form-wizard/business-details");
    }
  }, [on_boarding_exists, router]);

  return (
    <Page>
      <PageHeader
        title="Store Setup"
        description="Preparing your onboarding checklist — this will only take a moment."
      />

      <Card>
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    </Page>
  );
}
