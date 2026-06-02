import Image from "next/image";
import { site } from "@/content/site";

type LionOfJudahProps = {
  className?: string;
};

const EMBLEM_SRC = "/images/iron-lion-emblem.png";
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 947;

/** Full lion emblem above the written business name (no circle crop). */
export function LionOfJudah({ className = "" }: LionOfJudahProps) {
  return (
    <figure
      className={`mx-auto flex w-full max-w-[11rem] flex-col items-center sm:max-w-[10.5rem] ${className}`}
    >
      <div className="w-full shrink-0">
        <Image
          src={EMBLEM_SRC}
          alt="Iron Lion emblem, lion of Judah"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
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
