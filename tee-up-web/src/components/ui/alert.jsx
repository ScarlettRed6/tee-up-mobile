import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-xl border px-4 py-3 text-sm",
      variant === "destructive" &&
        "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200",
      variant === "default" &&
        "border-[var(--color-border)] bg-[var(--color-light-gray)] text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

export { Alert };
