# Kalakaupan tilausjarjestelma

Tuotantokelpoinen Next.js + Supabase + Vercel -pohja kalakaupan sesonkien ennakkotilausten hallintaan.

## Sisalto

- Paivakohtainen tilausnakyma
- Uuden tilauksen luonti ja olemassa olevan muokkaus
- Tuotteet haetaan aina `products`-taulusta
- Raportit paivalle tai paivamaaravalille
- Tiivistelmanakyma valmistettaville tuotemaärille
- Asetukset-sivu tuotteiden hallintaan

## Kaynnistys

1. Asenna riippuvuudet:

   ```bash
   npm install
   ```

2. Luo paikallinen ymparistotiedosto:

   ```bash
   cp .env.example .env.local
   ```

3. Tayta tiedostoon:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

4. Aja [supabase/schema.sql](/Users/joonashakkinen/Documents/Tilausjarjestelma/supabase/schema.sql) Supabasen SQL Editorissa.

5. Kaynnista kehityspalvelin:

   ```bash
   npm run dev
   ```

## Reitit

- `/tilaukset`
- `/tilaukset/[date]`
- `/tilaukset/[date]/[id]/muokkaa`
- `/uusi-tilaus`
- `/raportit`
- `/tiivistelma`
- `/asetukset`

## Huomio

Liitetiedostossa mainittiin Vite ja `VITE_SUPABASE_*`-muuttujat, mutta tama projekti rakennettiin alkuperaisen pyyntosi mukaisesti Next.js + Supabase + Vercel -pinolle. Siksi kaytossa ovat Nextin `NEXT_PUBLIC_SUPABASE_*`-muuttujat ja tiedostorakenne `lib/supabase/*`.

Tuotantoon liittyvat avoimet paatokset on koottu tiedostoon [docs/tuotantohuomiot.md](/Users/joonashakkinen/Documents/Tilausjarjestelma/docs/tuotantohuomiot.md).
