import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  logoOnly?: boolean;
};

export function BrandMark({ compact = false, logoOnly = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark ${compact ? "compact" : ""} ${logoOnly ? "logo-only" : ""}`}>
      <div className="brand-logo-wrap">
        <Image
          alt="Kalakauppa Forelli"
          className="brand-logo"
          height={compact ? 68 : 92}
          priority
          src="/brand-logo-transparent.png"
          width={compact ? 68 : 92}
        />
      </div>
      {logoOnly ? null : (
        <div className="brand-copy-block">
          <p className="brand-overline">Kalakauppa</p>
          <strong>Forelli</strong>
          <span>Tuoretta lähikalaa</span>
        </div>
      )}
    </div>
  );
}
