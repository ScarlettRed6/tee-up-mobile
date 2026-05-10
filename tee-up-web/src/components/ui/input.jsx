import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex min-h-[var(--input-min-height)] w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-white)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] text-base leading-snug text-[var(--color-text-primary)] shadow-[var(--shadow-subtle)] transition-colors placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
