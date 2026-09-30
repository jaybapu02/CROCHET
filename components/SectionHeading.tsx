import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal
      className={`flex flex-col gap-4 ${centered ? "items-center text-center" : "items-start"} ${className}`}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="max-w-3xl text-3xl leading-[1.08] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className={`lede ${centered ? "text-center" : ""}`}>{description}</p>
      ) : null}
    </Reveal>
  );
}
