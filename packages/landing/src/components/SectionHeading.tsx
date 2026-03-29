interface SectionHeadingProps {
  children: string;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return <h2 className="section-heading">{children}</h2>;
}
