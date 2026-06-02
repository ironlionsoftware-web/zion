import Link from "next/link";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { NatureGallery } from "@/components/sections/NatureGallery";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { WellnessGuideTeaser } from "@/components/sections/WellnessGuideTeaser";
import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <NatureGallery />
      <ServiceGrid />
      <WellnessGuideTeaser />
      <CtaBand />
      <Container className="pb-8 text-center">
        <Link href="/admin/login" className="text-xs text-muted/70 hover:text-muted hover:underline">
          Staff sign in
        </Link>
      </Container>
    </>
  );
}
