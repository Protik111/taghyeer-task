import { cn } from "@/lib/cn";

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-chip bg-card-alt", className)} />;
}

export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-chip px-3 py-3">
          <Pulse className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Pulse className="h-3 w-2/3" />
            <Pulse className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  const widths = ["w-40", "w-56", "w-32", "w-48", "w-28"];
  return (
    <div className="flex flex-1 flex-col justify-end gap-3 p-4" aria-hidden="true">
      {widths.map((w, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
          <Pulse className={cn("h-9 rounded-2xl", w)} />
        </div>
      ))}
    </div>
  );
}
