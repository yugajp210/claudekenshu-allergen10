"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
};

export function MenuImage({ src, alt, fallback, className, imgClassName, sizes = "(max-width: 768px) 100vw, 33vw", priority }: Props) {
  const [errored, setErrored] = React.useState(false);
  const show = src && !errored;

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-emerald-200 via-emerald-50 to-amber-100", className)}>
      {show ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-7xl font-bold text-emerald-700/30 select-none">
            {fallback}
          </span>
        </div>
      )}
    </div>
  );
}
