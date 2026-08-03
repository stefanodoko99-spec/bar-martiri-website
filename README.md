# Bar Martiri Website

Repository privat me kopjen e codebase-it publik të faqes:

- Production: https://barmartiri.netlify.app/
- Burimi i kopjes: deployment-i live në Netlify
- Data e kopjes: 3 gusht 2026

## Përmbajtja

- 12 skedarët kryesorë të kodit janë të lexueshëm në root.
- Eksporti vetëm-lexim i 71 produkteve publike: `products-2026-08-03.json`
- Kopja e plotë me strukturën e dosjeve dhe të gjitha asetet publike:
  `bar-martiri-production-snapshot-2026-08-03.zip`

## Kufizime të kopjes

`netlify.toml` dhe kodi burimor i funksionit serverless `google-reviews` nuk mund të
shkarkohen nga faqja publike dhe nuk përfshihen në këtë snapshot. Funksioni live
ishte gjithashtu i pakonfiguruar në momentin e kopjes.

Konfigurimi Supabase në frontend përmban vetëm çelësin publik të klientit. Ky
repository nuk përmban fjalëkalimin e administratorit, service-role key ose sekrete
të tjera private.

## Rikthimi

Shkarko dhe çkompreso `bar-martiri-production-snapshot-2026-08-03.zip`. Dosja e
çkompresuar mund të ngarkohet si faqe statike në Netlify. Menuja dinamike vazhdon
të varet nga projekti Supabase i konfiguruar në `supabase-config.js`.
