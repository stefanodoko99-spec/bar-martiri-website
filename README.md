# Bar Martiri Website

Repository me kopjen e codebase-it publik të faqes:

- Production: https://www.barmartiri.com/
- Vercel: https://bar-martiri.vercel.app/
- Burimi i kopjes: deployment-i live në Vercel
- Data e sinkronizimit: 8 gusht 2026
- Përditësimi i fundit: faqet Shqip/Italiano/English, privatësia, SEO-ja,
  përkthimet, imazhet lokale të produkteve dhe paneli i adminit

## Përmbajtja

- Faqja publike: `index.html`, `styles.css`, `script.js`
- Faqet e lokalizuara: `it/index.html`, `en/index.html`
- Privatësia: `privacy.html`
- Menuja: `menu-data.js`, `supabase-config.js`, `supabase-store.js`
- Harta e imazheve të produkteve: `product-image-map.js`
- Analitika pa cookies: `vercel-analytics.js`
- Paneli: `admin.html`, `admin.css`, `admin.js`
- SEO: `robots.txt`, `sitemap.xml`
- Asetet publike, përfshirë 66 imazhe lokale të produkteve
- Backup vetëm-lexim i 71 produkteve publike në `backup/products-2026-08-03.json`
- Draftet e përshkrimeve me burimet përkatëse në
  `backup/product-description-drafts-2026-08-03.json`

## Renditja dhe përshkrimet

Emrat dhe përshkrimet e produkteve shfaqen në shqip, italisht ose anglisht
sipas gjuhës së zgjedhur. Përkthimet ekzistuese sipas ID-së mbeten si fallback.
Pas aplikimit të `supabase/setup.sql`, fushat shumëgjuhëshe ruhen në databazë dhe
mund të ndryshohen direkt nga admini.

Paneli i adminit mbështet renditje manuale me shigjeta, alfabetike dhe sipas
çmimit. Renditja ruhet te fusha ekzistuese `sort_order`.

Butoni “Apliko përshkrimet draft” plotëson vetëm përshkrimet bosh dhe korrigjon
dy produkte alkoolike të vendosura gabimisht te kategoria e akullores. Tekstet
duhet të verifikohen nga administratori përpara publikimit përfundimtar.

## Përgatitja e databazës

1. Ekzekuto `supabase/setup.sql` në Supabase SQL Editor.
2. Krijo ose përdor përdoruesin e administratorit në Supabase Auth.
3. Shto UUID-në e tij te `public.admin_users`, sipas komandës së komentuar në
   fund të skedarit SQL.
4. Verifiko login-in, ruajtjen, renditjen, importin dhe ngarkimin e fotografive.

Kodi zbulon automatikisht nëse kolonat e përkthimit nuk janë aplikuar ende dhe
vazhdon të shfaqë menunë ekzistuese pa e prishur faqen publike.

## Testimi dhe build

Nuk ka varësi të jashtme për t’u instaluar. Mjafton Node.js:

```bash
npm run build
npm run check
```

Kur ndryshohen fotografitë ekzistuese në Supabase, rigjenero kopjet lokale me:

```bash
npm run optimize:catalog
```

Harta e imazheve kontrollon edhe URL-në burimore; një fotografi e re e ngarkuar
nga admini shfaqet menjëherë nga Supabase dhe nuk zëvendësohet gabimisht me një
kopje lokale të vjetër.

Netlify ekzekuton automatikisht `npm run build` dhe publikon root-in e projektit.

## Kufizime të kopjes

Ky sinkronizim përmban skedarët që shërbehen publikisht nga deployment-i live.
Konfigurimet private të projektit Vercel dhe variablat e ambientit nuk mund të
shkarkohen nga faqja publike dhe nuk përfshihen në snapshot.

Konfigurimi Supabase në frontend përmban vetëm çelësin publik të klientit. Ky
repository nuk përmban fjalëkalimin e administratorit, service-role key ose sekrete
të tjera private.

## Rikthimi

Skedarët në root mund të publikohen si faqe statike në Vercel. Menuja dinamike
vazhdon të varet nga projekti Supabase i konfiguruar në `supabase-config.js`.

Kopjet ZIP të datës 3 gusht ruhen si backup historik.
