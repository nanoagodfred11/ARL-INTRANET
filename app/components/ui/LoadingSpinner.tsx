import { Spinner } from "@heroui/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "lg",
  label = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner
        size={size}
        color="warning"
        classNames={{
          circle1: "border-b-gold-500",
          circle2: "border-b-gold-300",
        }}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <LoadingSkeleton className="mb-4 h-40 w-full" />
      <LoadingSkeleton className="mb-2 h-4 w-3/4" />
      <LoadingSkeleton className="mb-2 h-4 w-1/2" />
      <LoadingSkeleton className="h-4 w-1/4" />
    </div>
  );
}
