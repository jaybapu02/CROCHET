import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/**
 * Shared header for inner pages (Products, About, Reviews, Contact, Order).
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-shell/60 pt-32 pb-14 md:pt-40 md:pb-20">
      <div className="container-site">
        <Reveal className="flex max-w-3xl flex-col gap-5">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">{title}</h1>
          {description ? <p className="lede">{description}</p> : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
