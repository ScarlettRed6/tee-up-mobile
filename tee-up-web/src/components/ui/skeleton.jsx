import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md bg-[var(--color-light-gray)] animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
