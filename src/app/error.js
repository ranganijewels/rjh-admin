"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/common/ui/alert";

/**
 * Root error boundary.
 *
 * Catches anything that escapes a page (including the marketing / auth
 * routes) so a failure renders a recoverable message instead of a blank
 * screen.
 */
export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Alert variant="destructive" appearance="light" close={false} className="max-w-lg">
        <AlertIcon>
          <AlertCircle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            The page could not be rendered. Try again, or go back to the start.
          </AlertDescription>
        </AlertContent>
        <AlertToolbar>
          <Button size="sm" variant="destructive" onClick={reset}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </AlertToolbar>
      </Alert>
    </div>
  );
}
