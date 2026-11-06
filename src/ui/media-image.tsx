"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cx } from "@/ui/cx";
import { Icon } from "@/ui/icon";

export function MediaImage({
  src,
  alt,
  className,
  zoom = true,
}: {
  src: string;
  alt: string;
  className?: string;
  zoom?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cx("relative overflow-hidden bg-muted-bg", className)}>
      {failed ? (
        <div className="flex h-full min-h-24 w-full items-center justify-center text-muted">
          <Icon icon={ImageOff} className="size-6" />
          <span className="sr-only">{alt || "Image unavailable"}</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          onError={() => setFailed(true)}
          className={cx(
            "object-cover",
            zoom &&
              "transition-transform duration-200 ease-out group-hover:scale-[1.03]",
          )}
        />
      )}
    </div>
  );
}
