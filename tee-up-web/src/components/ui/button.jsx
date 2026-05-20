import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:opacity-90 active:opacity-95",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-2 border-[var(--color-border)] bg-transparent hover:bg-[var(--color-light-gray)]",
        secondary: "bg-[var(--color-light-gray)] text-[var(--color-text-primary)] hover:opacity-90",
        ghost: "hover:bg-[var(--color-light-gray)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-[var(--btn-min-height)] h-11 px-[var(--btn-padding-x)] py-2.5 text-sm",
        sm:
          "min-h-[var(--btn-min-height-sm)] h-10 rounded-lg px-[var(--btn-padding-x-sm)] py-2 text-sm font-medium",
        lg: "min-h-12 h-12 rounded-xl px-8 py-3 text-base",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
