import { Button } from "@heroui/react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
}

export function ErrorPage({
  status = 500,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again later.",
  showHomeButton = true,
  showRetryButton = true,
  onRetry,
}: ErrorPageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-100">
            <AlertTriangle size={40} className="text-gold-600" />
          </div>
        </div>

        <p className="text-6xl font-bold text-gold-500">{status}</p>
        <h1 className="mt-4 text-2xl font-semibold text-navy-900">{title}</h1>
        <p className="mt-2 max-w-md text-gray-600">{message}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {showHomeButton && (
            <Button
              as="a"
              href="/"
              color="warning"
              variant="solid"
              startContent={<Home size={18} />}
              className="font-medium"
            >
              Go Home
            </Button>
          )}
          {showRetryButton && (
            <Button
              variant="bordered"
              startContent={<RefreshCw size={18} />}
              onPress={handleRetry}
              className="border-gray-300 font-medium text-gray-700"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      status={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showRetryButton={false}
    />
  );
}
