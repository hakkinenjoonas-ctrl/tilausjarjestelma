"use client";

type PrintButtonProps = {
  label?: string;
};

export function PrintButton({ label = "Tulosta" }: PrintButtonProps) {
  return (
    <button className="ghost-button" onClick={() => window.print()} type="button">
      {label}
    </button>
  );
}
