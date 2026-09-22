import Image from "next/image";
import { site } from "@/content/site";

type BrandEmblemProps = {
  className?: string;
};

/**
 * The practice's emblem above its written name. Image and alt text come from
 * the tenant's `brand.emblem`, so each business ships its own mark.
 */
export function BrandEmblem({ className = "" }: BrandEmblemProps) {
  const { emblem } = site.brand;
  return (
    <figure
      className={`mx-auto flex w-full max-w-[11rem] flex-col items-center sm:max-w-[10.5rem] ${className}`}
    >
      <div className="w-full shrink-0">
        <Image
          src={emblem.src}
          alt={emblem.alt}
          width={emblem.width}
          height={emblem.height}
          className="mx-auto block h-auto w-full max-h-[8.5rem] object-contain object-bottom sm:max-h-[10rem]"
          sizes="(max-width: 640px) 132px, 168px"
          priority
        />
      </div>
      <figcaption className="mt-5 w-full max-w-[20rem] break-words px-1 text-center font-display text-base font-medium leading-snug text-[var(--foreground)] sm:mt-6 sm:text-lg sm:leading-snug">
        {site.brandName}
      </figcaption>
    </figure>
  );
}
