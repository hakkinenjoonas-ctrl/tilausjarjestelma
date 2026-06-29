import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageIntro({ eyebrow, title, description, action }: PageIntroProps) {
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="intro">{description}</p>
      </div>
      {action ? <div className="page-intro-action">{action}</div> : null}
    </section>
  );
}
