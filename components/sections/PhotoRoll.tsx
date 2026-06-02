"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";

type Photo = {
  src: string;
  alt: string;
};

type PhotoRollProps = {
  photos: readonly Photo[];
  title?: string;
};

export function PhotoRoll({ photos, title = "Photo roll" }: PhotoRollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const regionId = useId();
  const activePhoto = photos[activeIndex];
  const hasMultiplePhotos = photos.length > 1;

  const goPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current === photos.length - 1 ? 0 : current + 1));
  }, [photos.length]);

  useEffect(() => {
    if (!hasMultiplePhotos) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiplePhotos, goPrevious, goNext]);

  if (!activePhoto) {
    return null;
  }

  return (
    <section aria-labelledby="photo-roll-heading" className="card overflow-hidden p-4">
      <div className="mb-4 flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 id="photo-roll-heading" className="font-display text-lg font-medium text-[var(--foreground)]">
          {title}
        </h2>
        <p className="shrink-0 text-sm text-muted" aria-live="polite" aria-atomic="true">
          Photo {activeIndex + 1} of {photos.length}
        </p>
      </div>

      <div
        id={regionId}
        className="relative overflow-hidden rounded-sm bg-surface-muted"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title}: ${activePhoto.alt}`}
      >
        <Image
          src={activePhoto.src}
          alt={activePhoto.alt}
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-contain"
          priority
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={goPrevious}
          disabled={!hasMultiplePhotos}
          aria-controls={regionId}
          className="btn btn-secondary min-h-11 flex-1 normal-case tracking-normal disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous photo
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!hasMultiplePhotos}
          aria-controls={regionId}
          className="btn btn-secondary min-h-11 flex-1 normal-case tracking-normal disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next photo
        </button>
      </div>
    </section>
  );
}
