import { Button, Card, CardBody } from "@heroui/react";
import { Link } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { MainLayout } from "../layout";

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

/**
 * Error Page Component
 * Task: 1.1.1.3.8
 */
export function ErrorPage({
  status = 500,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again later.",
  showRetry = true,
  showHome = true,
}: ErrorPageProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="mb-2 text-5xl font-bold text-gray-300">{status}</p>
            <h1 className="mb-2 text-xl font-semibold text-navy-900">
              {title}
            </h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <div className="flex justify-center gap-3">
              {showRetry && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<RefreshCw className="h-4 w-4" />}
                  onPress={handleRetry}
                >
                  Try Again
                </Button>
              )}
              {showHome && (
                <Button
                  as={Link}
                  to="/"
                  color="warning"
                  startContent={<Home className="h-4 w-4" />}
                >
                  Go Home
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}

/**
 * 404 Not Found Page
 */
export function NotFoundPage() {
  return (
    <ErrorPage
      status={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showRetry={false}
    />
  );
}

/**
 * Server Error Page
 */
export function ServerErrorPage() {
  return (
    <ErrorPage
      status={500}
      title="Server Error"
      message="Something went wrong on our end. Please try again later."
    />
  );
}
