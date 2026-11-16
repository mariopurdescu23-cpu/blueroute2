import {z} from "zod";
import {bucket,configured,getStore} from "@/lib/supabase";
import {requestSchema,MAX_UPLOAD} from "@/lib/request-validation";
import {isAdmin,sameOrigin} from "@/lib/admin-auth";
import {byRequestKey,displayRow} from "@/lib/request-store";
import {verifyUpload} from "@/lib/upload-receipt";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const submission=requestSchema.extend({uploads:z.array(z.string().max(2000)).max(8).default([])});
export async function GET(){
 if(!await isAdmin())return Response.json({error:"Acces neautorizat."},{status:403});
 const {data,error}=await getStore().from("requests").select("*").order("created_at",{ascending:false}).limit(500);
 return error?Response.json({error:"Solicitările nu pot fi încărcate momentan."},{status:503}):Response.json({requests:data.map(displayRow)},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:"Origine invalidă."},{status:403});
 let parsed;try{parsed=submission.safeParse(await req.json())}catch{return Response.json({error:"Date invalide."},{status:400})}
 if(!parsed.success)return Response.json({error:"Verifică datele obligatorii, adresa de e-mail și serviciile selectate."},{status:400});
 if(!configured())return Response.json({error:"Solicitările vor putea fi trimise după activarea formularului. Te rugăm să revii."},{status:503});
 const data=parsed.data;
 try{
 const db=getStore();const previous=await byRequestKey(data.requestKey);if(previous)return Response.json(previous);
 const receipts=data.uploads.map(t=>verifyUpload(t,data.requestKey));if(receipts.some(r=>!r))return Response.json({error:"Autorizarea documentelor a expirat. Reîncarcă documentele."},{status:400});
 const files=receipts.filter((r):r is NonNullable<typeof r>=>r!==null);
 if(files.reduce((n,f)=>n+f.size,0)>MAX_UPLOAD||new Set(files.map(f=>f.key)).size!==files.length)return Response.json({error:"Documente invalide."},{status:400});
 for(const file of files){const {data:info,error}=await db.storage.from(bucket()).info(file.key);if(error||!info||Number(info.size??info.metadata?.size)!==file.size)return Response.json({error:"Un document nu a fost încărcat complet. Încearcă din nou."},{status:400})}
 const id=crypto.randomUUID();const reference=`BR-${new Date().getUTCFullYear()}-${id.slice(0,8).toUpperCase()}`;
 const {website,requestKey,uploads,...record}=data;void website;void uploads;
 const {error}=await db.from("requests").insert({id,reference,request_key:requestKey,data:record,files:files.map(({key,name,size})=>({key,name,size}))});
 if(error){const duplicate=await byRequestKey(requestKey);if(duplicate)return Response.json(duplicate);throw error}
 if(process.env.RESEND_API_KEY&&process.env.NOTIFY_EMAIL&&process.env.MAIL_FROM){
  try{const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.MAIL_FROM,to:[process.env.NOTIFY_EMAIL],subject:`BLUE ROUTE · ${reference}`,text:`Solicitare ${reference}\nCompanie: ${data.company}\nContact: ${data.name}, ${data.email}, ${data.phone}\nProcedură: ${data.code}\nProiect: ${data.title}\nServicii: ${data.services.join(", ")}\nTermen: ${data.deadline||"nespecificat"}\nDocumente: ${files.length}\nDetaliile sunt disponibile în panoul de administrare.`,reply_to:data.email})});await db.from("requests").update({notification:r.ok?"sent":"failed"}).eq("id",id)}catch{await db.from("requests").update({notification:"failed"}).eq("id",id)}
 }
 return Response.json({reference},{status:201});
 }catch{return Response.json({error:"Solicitarea nu a putut fi salvată. Te rugăm să încerci din nou."},{status:503})}
}

