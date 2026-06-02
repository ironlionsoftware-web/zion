import Image from "next/image";
import type { NaturePhoto } from "@/content/site";

type NatureFeatureProps = {
  photo: NaturePhoto;
  label?: string;
  className?: string;
  /** Tailwind aspect ratio class for the image frame */
  aspectClass?: string;
};

/** Single wide nature photo for accent on inner pages. */
export function NatureFeature({
  photo,
  label,
  className = "",
  aspectClass = "aspect-[21/9]",
}: NatureFeatureProps) {
  return (
    <figure className={`card overflow-hidden ${className}`}>
      <div className={`relative min-h-[10rem] sm:min-h-[12rem] ${aspectClass}`}>
        <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" />
      </div>
      {label ? (
        <figcaption className="px-4 py-3 text-center font-display text-sm font-medium tracking-wide text-[var(--foreground)]">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
