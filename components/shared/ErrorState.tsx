import { cn } from "@/lib/cn";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-default text-pale-blue">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-pill border border-border px-4 py-2 text-default font-medium text-white transition-colors hover:border-plum"
        >
          Try again
        </button>
      )}
    </div>
  );
}
