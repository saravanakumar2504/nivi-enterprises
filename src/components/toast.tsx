"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error" | "warning";

type ToastProps = {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
};

export function Toast({ message, variant, onDismiss }: Readonly<ToastProps>) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const colorMap: Record<ToastVariant, string> = {
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-lg ${colorMap[variant]}`}
    >
      {message}
    </div>
  );
}
