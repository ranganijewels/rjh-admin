"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { SESSION_EXPIRED_EVENT } from "@/lib/session-events";

// After the admin chooses to carry on working, a repeat 401 must not trap
// them in the same dialog every time a background request fails.
const SUPPRESS_MS = 60_000;

/**
 * Shown when an admin request comes back 401.
 *
 * This used to be a hard `window.location.href = "/login"`, which meant one
 * rejected request could eject the admin from the panel and throw away the
 * form they were filling in. Now the session is left alone until the admin
 * decides what to do:
 *
 *   "Sign in again" — clears the stored session and returns to /login.
 *   "Continue"      — dismisses the dialog and stays exactly where you are.
 *                     If the session really is dead, the next write will
 *                     raise it again; nothing is lost in the meantime.
 */
export function SessionExpiredDialog() {
  const [open, setOpen] = useState(false);
  const suppressedUntil = useRef(0);

  useEffect(() => {
    const onExpired = () => {
      if (Date.now() < suppressedUntil.current) {
        toast.warning("The panel rejected a request — your session may have expired.");
        return;
      }
      setOpen(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const continueWorking = useCallback(() => {
    suppressedUntil.current = Date.now() + SUPPRESS_MS;
    setOpen(false);
  }, []);

  const signInAgain = useCallback(() => {
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("authTokenStoreAdmin");
    } catch {
      // A blocked storage quota should not stop the sign-out.
    }
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }, []);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : continueWorking())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            Your session has expired
          </DialogTitle>
          <DialogDescription>
            The admin panel rejected the last request, so your session may no
            longer be valid. You can sign in again, or keep working — anything
            you have typed stays on screen either way.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={continueWorking}>
            Continue working
          </Button>
          <Button onClick={signInAgain}>Sign in again</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionExpiredDialog;
