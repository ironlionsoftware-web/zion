import { site } from "@/content/site";
import { Container } from "@/components/layout/Container";

export function AboutTeaser() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="home-about-heading">
      <Container>
        <h2 id="home-about-heading" className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
          {site.home.aboutTitle}
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-stone-700">
          {site.home.aboutBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}
