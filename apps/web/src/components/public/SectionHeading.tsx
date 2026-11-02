import { OrnamentDivider } from "../decor/Ornament";
import { cn } from "../../lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  description?: string | null;
  light?: boolean;
  align?: "center" | "left";
  ornament?: "classic" | "floral" | "minimal";
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  description,
  light = false,
  align = "center",
  ornament = "classic",
  className
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("relative z-10", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
      {kicker ? <p className={cn("kicker", light && "text-[#d8bd83]")}>{kicker}</p> : null}
      <h2 className={cn("section-title mt-4", light && "section-title-light")}>{title}</h2>
      <OrnamentDivider
        variant={ornament}
        className={cn("mt-6", align === "left" && "ml-0 mr-auto", light && "text-[#d8bd83]")}
      />
      {description ? (
        <p className={cn("lede mt-6 text-pretty", light && "lede-light", align === "center" && "mx-auto max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
