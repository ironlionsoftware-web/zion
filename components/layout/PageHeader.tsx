import type { ReactNode } from "react";
import { LionOfJudah } from "@/components/brand/LionOfJudah";
import { Container } from "./Container";

type PageHeaderProps = {
  title: string;
  lead?: string;
  children?: ReactNode;
  centered?: boolean;
};

export function PageHeader({ title, lead, children, centered = false }: PageHeaderProps) {
  return (
    <header
      className={`border-b border-subtle bg-surface/80 py-10 sm:py-20 ${centered ? "text-center" : ""}`}
    >
      <Container className={centered ? "max-w-3xl" : "max-w-3xl"}>
        <div className={`mb-8 ${centered ? "flex justify-center" : ""}`}>
          <LionOfJudah />
        </div>
        <div className={`symbol-band mb-8 h-px w-16 opacity-80 ${centered ? "mx-auto" : ""}`} aria-hidden="true" />
        <h1 className="page-title">{title}</h1>
        {lead ? <p className={`mt-5 prose-content ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{lead}</p> : null}
        {children}
      </Container>
    </header>
  );
}
