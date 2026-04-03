import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-surface-accent text-sm text-app-muted",
          className,
        )}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={640}
      height={640}
      unoptimized
      className={cn("rounded-2xl object-cover", className)}
    />
  );
}
