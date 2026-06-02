import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { WellnessGuideFinder } from "@/components/wellness-guide/WellnessGuideFinder";
export const metadata: Metadata = {
  title: "Find your path",
  description:
    "Describe what you want to heal or work on and get personalized suggestions for Iron Lion healing services and plant medicine.",
};

export default function FindYourPathPage() {
  return (
    <>
      <PageHeader
        title="Find your path"
        lead="Tell us what you are carrying: stress, grief, low energy, spiritual questions, movement goals, or something else. We will point you toward the best fit service or plant medicine."
        centered
      />
      <div className="section-pad pt-0">
        <Container className="max-w-3xl">
          <WellnessGuideFinder />
          <p className="mt-10 text-center text-sm text-muted">
            Prefer to browse everything?{" "}
            <Link href="/healing-services" className="link-accent font-medium">
              Healing Services & Classes
            </Link>{" "}
            ·{" "}
            <Link href="/shop" className="link-accent font-medium">
              Shop plant medicine
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
