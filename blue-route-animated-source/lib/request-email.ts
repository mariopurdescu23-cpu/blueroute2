import "server-only";
import type {z} from "zod";
import {company} from "./company";
import {services} from "./content";
import type {requestSchema} from "./request-validation";

type RequestDetails = Omit<z.output<typeof requestSchema>, "website" | "requestKey">;
type Document = {name: string; size: number};

function escapeHtml(value: string) {
 return value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
}

function formatRequestEmail(reference: string, data: RequestDetails, files: Document[]) {
 const siteUrl = "https://blue-route-animated-source.vercel.app";
 const adminUrl = `${siteUrl}/admin`;
 const groups = [
  {title: "Licitație", fields: [
   ["Număr de procedură", data.code],
   ["Proiect", data.title],
   ["Autoritate contractantă", data.authority],
   ["Termen", data.deadline],
   ["Valoare estimată", data.value ? `${data.value} lei` : ""],
  ]},
  {title: "Servicii solicitate", fields: [
   ["Servicii", data.services.map(slug => services.find(service => service.slug === slug)?.ro ?? slug).join("\n")],
  ]},
  {title: "Firmă și persoană de contact", fields: [
   ["Denumirea firmei", data.company],
   ["CUI / Cod fiscal", data.cui],
   ["Persoană de contact", data.name],
   ["E-mail", data.email],
   ["Telefon", data.phone],
   ["Detalii suplimentare", data.notes],
  ]},
  {title: "Documente și confirmare", fields: [
   ["Documente încărcate", files.map(file => `${file.name} (${Math.ceil(file.size / 1024)} KB)`).join("\n") || "Fără documente"],
   ["Limba formularului", data.lang === "en" ? "Engleză" : "Română"],
   ["Informare privind datele personale", data.consent ? "Confirmată" : ""],
  ]},
 ];
 const sections = groups.map(({title, fields}) => `
  <h2 style="margin:24px 0 8px;color:#175bfb;font-size:17px">${title}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed">
   ${fields.map(([label, value]) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #e0e6ed">
     <div style="color:#536276;font-size:12px;font-weight:bold">${label}</div>
     <div style="padding-top:4px;color:#10233a;font-size:15px;line-height:1.5;overflow-wrap:anywhere;word-wrap:break-word">${escapeHtml(value || "—").replace(/\r\n?|\n/g, "<br>")}</div>
    </td></tr>`).join("")}
  </table>`).join("");
 const html = `<!doctype html>
 <html lang="ro"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
 <body style="margin:0;background:#f2f5fa;font-family:Arial,sans-serif;color:#10233a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f5fa">
   <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border:1px solid #e0e6ed;border-radius:12px">
     <tr><td style="padding:22px 24px;background:#fff;border-top:4px solid #175bfb;border-bottom:1px solid #e0e6ed;border-radius:12px 12px 0 0">
      <img src="${siteUrl}/blue-route-logo.png" alt="BLUE ROUTE" width="210" height="35" style="display:block;width:210px;max-width:100%;height:auto;color:#071b35;font-size:20px;font-weight:bold">
      <h1 style="margin:20px 0 6px;color:#071b35;font-size:25px;line-height:1.2">Solicitare nouă de ofertă</h1>
      <div style="color:#536276;font-size:14px">${escapeHtml(reference)}</div>
     </td></tr>
     <tr><td style="padding:0 24px 24px">
      ${sections}
      <p style="margin:24px 0 12px;font-size:13px;line-height:1.5">Documentele pot fi accesate din panoul de administrare după autentificare.</p>
      <a href="${adminUrl}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#175bfb;color:#fff;text-decoration:none;font-weight:bold">Deschide panoul</a>
     </td></tr>
    </table>
   </td></tr>
  </table>
 </body></html>`;
 const text = [
  `BLUE ROUTE — Solicitare nouă de ofertă ${reference}`,
  ...groups.map(({title, fields}) => [title, ...fields.map(([label, value]) => `${label}: ${value || "—"}`)].join("\n")),
  `Panou de administrare: ${adminUrl}`,
 ].join("\n\n");
 return {html, text};
}

export async function sendRequestEmail(reference: string, data: RequestDetails, files: Document[]) {
 const {RESEND_API_KEY: apiKey, MAIL_FROM: from} = process.env;
 if (!apiKey || !from) return "not_configured";
 try {
  const response = await fetch("https://api.resend.com/emails", {
   method: "POST",
   headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Idempotency-Key": `blueroute-request/${reference}`,
   },
   body: JSON.stringify({
    from,
    to: [company.email],
    reply_to: data.email,
    subject: `BLUE ROUTE · Solicitare ${reference}`,
    ...formatRequestEmail(reference, data, files),
   }),
   signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) console.error("Request email rejected", {reference, status: response.status});
  return response.ok ? "sent" : "failed";
 } catch {
  console.error("Request email transport failed", {reference});
  return "failed";
 }
}
