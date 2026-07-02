import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";

export default function CustomerOrdersPage() {
  return (
    <main className="page-stack">
      <PageIntro
        eyebrow="Omat varaukset"
        title="Tarkista omat varauksesi"
        description="Tähän näkymään tuodaan seuraavaksi asiakkaan omat varaukset ja niiden tarkistaminen."
      />
      <EmptyState
        title="Omat varaukset tulossa pian"
        description="Asiakkaan omien varausten tarkastelu rakennetaan seuraavassa vaiheessa. Tällä hetkellä voit tehdä uuden varauksen normaalisti."
        actionHref="/varaa"
        actionLabel="Tee uusi varaus"
      />
    </main>
  );
}
