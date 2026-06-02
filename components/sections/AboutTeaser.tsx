import Image from "next/image";
import { dominicaPhotos, site } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function AboutTeaser() {
  return (
    <section className="section-pad bg-surface-muted" aria-labelledby="home-about-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="card order-2 overflow-hidden lg:order-1">
            <div className="relative aspect-[4/3] sm:aspect-[3/2]">
              <Image
                src={site.home.aboutImage}
                alt={dominicaPhotos[2].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="order-1 text-center lg:order-2 lg:text-left">
            <div className="symbol-band mx-auto mb-8 h-px w-16 opacity-80 lg:mx-0" aria-hidden="true" />
            <h2 id="home-about-heading" className="section-title">
              {site.home.aboutTitle}
            </h2>
            <div className="prose-content mt-8 space-y-4">
              {site.home.aboutBody.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
