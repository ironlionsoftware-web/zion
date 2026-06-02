import Image from "next/image";
import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";
import type { NaturePhoto } from "@/content/site";

function PhotoGrid({ photos }: { photos: readonly NaturePhoto[] }) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <li key={photo.src}>
          <div className="card group overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NatureGallery() {
  const { nature } = site;

  return (
    <section className="section-pad border-t border-subtle bg-surface" aria-labelledby="nature-gallery-heading">
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <div className="symbol-band mx-auto mb-8 h-px w-16 opacity-80" aria-hidden="true" />
          <h2 id="nature-gallery-heading" className="section-title">
            {nature.title}
          </h2>
          <p className="prose-content mt-4">{nature.lead}</p>
          <p className="eyebrow mt-6">{nature.label}</p>
        </header>

        <PhotoGrid photos={nature.galleryPhotos} />
      </Container>
    </section>
  );
}
