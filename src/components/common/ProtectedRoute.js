"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [token, router]);

  if (!authorized) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
