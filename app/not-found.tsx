import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <div className="section-pad">
      <Container className="max-w-xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="page-title mt-4">Page not found</h1>
        <p className="prose-content mx-auto mt-5">That link may be old, or the page moved as we launch the new site.</p>
        <Link href="/" className="btn btn-primary mt-10">
          Back to home
        </Link>
      </Container>
    </div>
  );
}
