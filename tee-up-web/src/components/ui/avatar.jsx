import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Avatar stack: image is layered above fallback. Fallback shows when there is no
 * usable src or the image fails to load (broken URL, expired link, etc.).
 */
const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, src, alt = "", onError, ...props }, ref) => {
  const [broken, setBroken] = React.useState(() => !src);

  React.useEffect(() => {
    setBroken(!src);
  }, [src]);

  if (broken || !src) {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn(
        "absolute inset-0 z-[1] aspect-square h-full w-full object-cover",
        className
      )}
      onError={(e) => {
        setBroken(true);
        onError?.(e);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute inset-0 z-0 flex h-full w-full items-center justify-center rounded-full bg-[var(--color-light-gray)] text-[var(--color-text-muted)]",
      className
    )}
    {...props}
  >
    {children ?? (
      <User
        className="h-[55%] w-[55%] min-h-3 min-w-3 opacity-80"
        strokeWidth={2}
        aria-hidden
      />
    )}
  </span>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
