import Image from "next/image";
import type { ReactNode } from "react";

type NatureBackdropProps = {
  src: string;
  children: ReactNode;
  className?: string;
};

/** Soft full-bleed nature photo behind section content. */
export function NatureBackdrop({ src, children, className = "" }: NatureBackdropProps) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Image src={src} alt="" fill sizes="100vw" className="object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface)] via-[var(--surface)]/92 to-[var(--surface)]" />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
