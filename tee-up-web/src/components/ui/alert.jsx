import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-xl border px-5 py-4 text-[15px] font-medium leading-[1.6] break-words [&_p]:m-0",
      variant === "destructive" &&
        "border-red-200 bg-red-50 text-red-900 dark:border-red-800/70 dark:bg-red-950/45 dark:text-red-100",
      variant === "default" &&
        "border-[var(--color-border)] bg-[var(--color-background-alt)] text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

export { Alert };
