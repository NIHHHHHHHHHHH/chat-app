
// A reusable component for all empty states in the app
// Instead of writing the same centered div every time
// we just use <EmptyState icon={...} title={...} />

import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  // Icon from lucide-react
  icon: LucideIcon;
  // Main heading
  title: string;
  // Smaller description below heading
  description?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <div className="rounded-full bg-primary/10 p-5 mb-4">
        <Icon className="h-8 w-8 text-primary" />
     </div>
      <h3 className="text-base font-semibold mb-1 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-50">
          {description}
        </p>
      )}
    </div>
  );
}