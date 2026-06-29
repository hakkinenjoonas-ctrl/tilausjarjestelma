import Link from "next/link";

type PrintLinkProps = {
  pickupDate: string;
};

export function PrintLink({ pickupDate }: PrintLinkProps) {
  return (
    <>
      <Link className="ghost-button" href={`/tilaukset/${pickupDate}/tulosta?size=4x6`} target="_blank">
        Tarrat 4x6
      </Link>
      <Link className="ghost-button" href={`/tilaukset/${pickupDate}/tulosta?size=4x3`} target="_blank">
        Tarrat 4x3
      </Link>
    </>
  );
}
