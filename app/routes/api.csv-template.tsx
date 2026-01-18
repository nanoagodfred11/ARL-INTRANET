/**
 * CSV Template Download API Route
 * Task: 1.1.4.3.8
 */

import type { LoaderFunctionArgs } from "react-router";
import { requireAuth } from "~/lib/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);

  // CSV template with headers and example row
  const csvContent = `FirstName,LastName,Phone,Extension,Email,Department,Position,Emergency
John,Doe,0241234567,101,john.doe@arl.com,MINING,Senior Engineer,no
Jane,Smith,0241234568,102,jane.smith@arl.com,HR,HR Manager,yes`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=contacts-template.csv",
    },
  });
}
