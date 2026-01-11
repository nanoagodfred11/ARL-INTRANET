import type { Route } from "./+types/home";
import { MainLayout } from "~/components/layout";
import { Dashboard } from "~/components/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ARL Connect | Adamus Resources Limited Intranet" },
    { name: "description", content: "Your central hub for company news, safety updates, and resources at Adamus Resources Limited." },
  ];
}

export default function Home() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
