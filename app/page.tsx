import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { ServiceGrid } from "@/components/sections/ServiceGrid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <ServiceGrid />
      <CtaBand />
    </>
  );
}
