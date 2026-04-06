"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

export function FloatingBackButton({
  href,
  className,
  ariaLabel = "Go back",
}: {
  href?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();

  const content = (
    <FiChevronLeft className="h-[22px] w-[22px] stroke-[2.5px]" aria-hidden="true" />
  );

  const classes = cn(
    "fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={() => router.back()} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
