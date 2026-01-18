import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs
          itemClasses={{
            item: "text-gray-500 data-[current=true]:text-navy-900 data-[current=true]:font-medium",
            separator: "text-gray-400",
          }}
        >
          <BreadcrumbItem href="/">
            <Home size={16} />
          </BreadcrumbItem>
          {items.map((item, index) => (
            <BreadcrumbItem
              key={index}
              href={item.href}
              isCurrent={index === items.length - 1}
            >
              {item.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
    </div>
  );
}
