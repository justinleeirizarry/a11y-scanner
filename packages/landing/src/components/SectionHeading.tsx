interface SectionHeadingProps {
  id?: string;
  children: string;
}

export function SectionHeading({ id, children }: SectionHeadingProps) {
  return <h2 id={id} className="section-heading">{children}</h2>;
}
