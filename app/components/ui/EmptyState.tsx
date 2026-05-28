import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/80 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-rose-300">{icon}</div>}
      <p className="text-sm font-medium text-rose-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-rose-600">{description}</p>
      )}
    </div>
  );
}
