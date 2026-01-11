import { HeroUIProvider as Provider } from "@heroui/react";
import { useNavigate } from "react-router";
import type { ReactNode } from "react";

interface HeroUIProviderProps {
  children: ReactNode;
}

/**
 * HeroUI Provider wrapper with React Router navigation
 * This enables HeroUI components to work with React Router's navigation
 */
export function HeroUIProvider({ children }: HeroUIProviderProps) {
  const navigate = useNavigate();

  return (
    <Provider navigate={navigate}>
      {children}
    </Provider>
  );
}
