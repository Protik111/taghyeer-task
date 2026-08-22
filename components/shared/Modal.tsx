"use client";

import { useEffect, useId } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Small centered dialog shared by the "new chat", "new group", and
 * "group info" surfaces — same a11y shape as MobileMenu's drawer
 * (role=dialog, Escape to close, backdrop click to close). */
export default function Modal({ title, onClose, children, className }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-deep/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-hidden rounded-card border border-border bg-card p-6",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-card-title font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-white transition-colors hover:border-plum"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="m2 2 12 12M14 2 2 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
