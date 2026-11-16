# BLUE ROUTE — Next.js / Vercel

Site responsive RO/EN pentru consultanță în achiziții publice, cu pagini de servicii, resurse, formular de ofertare în patru pași și panou de administrare.

## Deploy pe Vercel

1. Importă repository-ul `blue-route` în Vercel.
2. Framework: **Next.js**. Root Directory: rădăcina repository-ului. Build: `npm run build`. Instalare: `npm ci`. Node.js: **22.x** sau **24.x**.
3. Poți publica interfața fără variabile de mediu. Formularul și autentificarea afișează un mesaj clar până când serviciile de mai jos sunt configurate.
4. Pentru funcționalitatea completă, creează un proiect Supabase și execută `supabase/schema.sql` în SQL Editor. Scriptul creează tabelul și bucket-ul privat.
5. Configurează în Vercel variabilele din `.env.example`, apoi fă Redeploy.
6. În Supabase Authentication → Users, creează contul echipei și trece adresa lui în `ADMIN_EMAILS`. Dezactivează înregistrarea publică dacă nu este folosită pentru alte aplicații din același proiect. Accesează `/admin` cu e-mailul și parola acelui cont.

### Variabile obligatorii pentru formular și administrare

- `SUPABASE_URL`: URL-ul proiectului Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: cheia service role, numai pe server. Nu folosi prefixul `NEXT_PUBLIC_` și nu o comite în Git.
- `SUPABASE_STORAGE_BUCKET`: implicit `blue-route-documents`.
- `ADMIN_EMAILS`: adrese autorizate, separate prin virgulă. Autentificarea se verifică pe server prin Supabase; un cont autentificat care nu apare aici nu are acces.
- `UPLOAD_SIGNING_SECRET`: șir aleator de minimum 32 caractere, pentru semnarea dovezilor de încărcare. Poți genera unul local cu `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

### Opționale

`RESEND_API_KEY`, `NOTIFY_EMAIL`, `MAIL_FROM`: notificarea echipei la primirea unei solicitări. Domeniul expeditorului trebuie validat la Resend. Fără configurare, solicitările se salvează în panou; nu se trimite e-mail.

`SEAP_PROVIDER_URL`, `SEAP_PROVIDER_TOKEN`: sursă HTTPS autorizată pentru precompletare. GET cu parametrul `code`; răspuns JSON cu stringurile `title`, `authority`, `deadline` (YYYY-MM-DD), `value`. În lipsa integrării sau la eroare, formularul permite completarea manuală. Nu sunt extrase automat date din paginile SEAP.

## Documente și protecția datelor

Maximum 8 documente, 25 MB cumulat. Fișierele se încarcă direct din browser în bucket-ul privat, prin URL-uri semnate. Astfel nu trec prin limita de 4,5 MB a funcțiilor Vercel. Înainte de salvarea solicitării, serverul verifică dovezile semnate, apartenența la solicitare și dimensiunea efectivă a fișierelor. Descărcarea necesită autorizarea administratorului; URL-ul de descărcare este valabil 60 de secunde.

Tabelul are RLS activat și nu permite acces direct pentru cheile anon/authenticated. Nu adăuga politici publice pentru tabel sau bucket. Secretul service role este folosit exclusiv pe server.

Solicitările au o cheie unică pentru a evita duplicatele la retry. Fișierele abandonate în timpul completării formularului pot fi curățate periodic, cu verificarea referințelor din tabel. Înainte de promovarea publică, configurează limite/rate limiting pentru rutele publice în Vercel Firewall și politica proprie de retenție.

Sesiunea de administrare folosește un cookie HttpOnly, Secure în producție, SameSite=Strict, cu durată de maximum o oră. Nu există parole implicite sau bypass pentru administrare.

## Funcționalități

- RO/EN, navigare mobilă, animații cu preferință de mișcare redusă, pagini de servicii și articole.
- Formular: licitație, servicii, companie/contact/documente, verificare și referință de înregistrare.
- Administrare: căutare, filtre, statusuri, termene apropiate, documente, onorariu și calendar de prestare, note interne, CSV, ofertă imprimabilă/PDF și deschidere e-mail pentru verificare.
- Datele firmei și contactele sunt placeholders în `lib/company.ts`, conform cererii utilizatorului. Completează și informarea de confidențialitate și subsolul ofertei PDF înainte de utilizare reală.
- Portofoliul conține scenarii explicit ilustrative. Nu sunt declarate proiecte sau rezultate neverificate.

## Dezvoltare

```
npm ci
npm run dev
npm run build
npm start
```

Copiază `.env.example` în `.env.local` pentru servicii locale reale. Datele existente în versiunea Cloudflare nu sunt migrate automat în Supabase. Varianta Sites existentă rămâne separată.

Designul este original, inspirat ca direcție vizuală de https://github.com/mariopurdescu23-cpu/aura-project. Fotografiile sunt ilustrative din Unsplash, nu proiecte revendicate de BLUE ROUTE. Imagine pod: Jakub Pabis, https://unsplash.com/photos/a-bridge-that-is-going-over-a-road-uqiFJNXMDek. Fonturi: Manrope și DM Sans prin Google Fonts.
