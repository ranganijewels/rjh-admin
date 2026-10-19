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
 * Route-level error boundary.
 *
 * Without one, a single thrown render blanks the whole page and leaves the
 * admin with a blank screen and no way back. This keeps the failure inside
 * the page frame: the shell, sidebar and navigation stay usable and the user
 * can retry without a full reload.
 */
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Keep the real cause in the console for whoever is debugging.
    console.error(error);
  }, [error]);

  return (
    <Alert variant="destructive" appearance="light" close={false}>
      <AlertIcon>
        <AlertCircle />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>This page failed to load</AlertTitle>
        <AlertDescription>
          Something went wrong while rendering this screen. The rest of the
          dashboard still works — you can retry, or pick another section from
          the sidebar.
        </AlertDescription>
      </AlertContent>
      <AlertToolbar>
        <Button size="sm" variant="destructive" onClick={reset}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </AlertToolbar>
    </Alert>
  );
}
