import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="mb-1 text-4xl">{icon}</div>}
      <p className="text-card-title font-semibold text-white">{title}</p>
      {description && <p className="max-w-xs text-default text-pale-blue">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
