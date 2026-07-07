"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

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

  return <ContentLoader className="min-h-screen" />;
}
