import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark ${compact ? "compact" : ""}`}>
      <div className="brand-logo-wrap">
        <Image
          alt="Kalakauppa Forelli"
          className="brand-logo"
          height={compact ? 68 : 92}
          priority
          src="/brand-logo.png"
          width={compact ? 68 : 92}
        />
      </div>
      <div className="brand-copy-block">
        <p className="brand-overline">Kalakauppa</p>
        <strong>Forelli</strong>
        <span>Tuoretta lahikalaa</span>
      </div>
    </div>
  );
}
