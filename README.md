# Bar Martiri Website

Repository privat me kopjen e codebase-it publik të faqes:

- Production: https://barmartiri.netlify.app/
- Burimi i kopjes: deployment-i live në Netlify
- Data e kopjes: 3 gusht 2026

## Përmbajtja

- Faqja publike: `index.html`, `styles.css`, `script.js`
- Menuja: `menu-data.js`, `supabase-config.js`, `supabase-store.js`
- Paneli: `admin.html`, `admin.css`, `admin.js`
- SEO: `robots.txt`, `sitemap.xml`
- Asetet publike të përdorura nga deployment-i
- Backup vetëm-lexim i 71 produkteve publike në `backup/products-2026-08-03.json`

## Kufizime të kopjes

`netlify.toml` dhe kodi burimor i funksionit serverless `google-reviews` nuk mund të
shkarkohen nga faqja publike dhe nuk përfshihen në këtë snapshot. Funksioni live
ishte gjithashtu i pakonfiguruar në momentin e kopjes.

Konfigurimi Supabase në frontend përmban vetëm çelësin publik të klientit. Ky
repository nuk përmban fjalëkalimin e administratorit, service-role key ose sekrete
të tjera private.

## Rikthimi

Skedarët në root mund të ngarkohen si faqe statike në Netlify. Menuja dinamike
vazhdon të varet nga projekti Supabase i konfiguruar në `supabase-config.js`.
