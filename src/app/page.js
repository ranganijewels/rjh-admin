"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { logout } from "@/store/slices/authSlice";

function parseAPIDate(dateString) {
  if (!dateString) return null;
  const safeString = dateString.replace(/(\.\d{3})\d+Z$/, "$1Z");
  const parsed = new Date(safeString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, on_boarding_exists, expires_at } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const checkTokenExpiry = () => {
      if (!token) {
        router.replace("/login");
        return;
      }

      const expiry = parseAPIDate(expires_at);
      const now = new Date();

      if (!expiry || now >= expiry) {
        dispatch(logout());
        router.replace("/login");
        return;
      }

      if (on_boarding_exists) {
        router.replace("/dashboard");
      } else {
        router.replace("/form-wizard");
      }
    };

    checkTokenExpiry();

    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    return () => clearInterval(interval);
  }, [token, expires_at, on_boarding_exists, router, dispatch]);

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
    </ProtectedRoute>
  );
}
