// src/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { isAuthenticated } from "./auth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
