"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import FormWizard from "@/components/commonPages/FormWizard";

export default function FormWizardPage() {
  return (
    <ProtectedRoute>
      <FormWizard />
    </ProtectedRoute>
  );
}
