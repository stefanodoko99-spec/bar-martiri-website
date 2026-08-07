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
sipas gjuhës së zgjedhur. Emrat tregtarë të markave nuk përkthehen. Përkthimet
lidhen me ID-në e produktit, ndaj çmimet dhe të dhënat burimore në Supabase nuk
ndryshohen.

Paneli i adminit mbështet renditje manuale me shigjeta, alfabetike dhe sipas
çmimit. Renditja ruhet te fusha ekzistuese `sort_order`.

Butoni “Apliko përshkrimet draft” plotëson vetëm përshkrimet bosh dhe korrigjon
dy produkte alkoolike të vendosura gabimisht te kategoria e akullores. Tekstet
duhet të verifikohen nga administratori përpara publikimit përfundimtar.

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
