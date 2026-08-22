"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Button from "@/components/ui/Button";
import LogoMark from "@/components/ui/LogoMark";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/types";

// Loose but real E.164-ish check for UX — the API itself accepts any
// string as a phone (verified live), so this is a client-only nicety,
// not a rule the server backs up.
const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .regex(/^\+?[0-9]{7,15}$/, "Use digits only, optionally starting with +."),
  name: z.string().trim().min(2, "Enter your name (2+ characters)."),
});

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; name?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/chat");
  }, [status, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ phone, name });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({ phone: errors.phone?.[0], name: errors.name?.[0] });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(result.data.phone, result.data.name);
      router.replace("/chat");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't log you in — please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-base px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark size={44} />
          <h1 className="text-page-title text-3xl font-bold text-white sm:text-4xl">Welcome to Loopin</h1>
          <p className="text-default text-pale-blue">
            Enter your phone number and name to continue. New numbers are registered
            automatically — there&apos;s no separate sign-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-meta font-semibold uppercase tracking-[0.08em] text-sky/80">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="rounded-chip border border-border bg-navy/40 px-4 py-3 text-default text-white placeholder:text-sky/50 focus:border-plum focus:outline-none"
            />
            {fieldErrors.phone && <p className="text-meta text-pink">{fieldErrors.phone}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-meta font-semibold uppercase tracking-[0.08em] text-sky/80">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="rounded-chip border border-border bg-navy/40 px-4 py-3 text-default text-white placeholder:text-sky/50 focus:border-plum focus:outline-none"
            />
            {fieldErrors.name && <p className="text-meta text-pink">{fieldErrors.name}</p>}
          </div>

          {formError && <p className="text-default text-pink">{formError}</p>}

          <Button type="submit" variant="solid" arrow="none" disabled={submitting} className="justify-center">
            {submitting ? "Logging in…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
