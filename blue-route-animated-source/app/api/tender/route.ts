
import {sameOrigin} from "@/lib/admin-auth";
export async function POST(req:Request){if(!sameOrigin(req))return Response.json({error:"Origine invalidă"},{status:403});let code="",lang="ro";try{const d=await req.json() as {code?:string;lang:string};code=String(d.code||"").trim();lang=d.lang}catch{return Response.json({error:"Date invalide"},{status:400})}if(code.length<3||code.length>500)return Response.json({error:"Număr sau link invalid"},{status:400});
 const fallback=lang==="en"?"No authorised SEAP data source is connected. Continue by entering the details manually; your request can still be submitted.":"Nu este conectată o sursă autorizată de date SEAP. Completează manual detaliile de mai jos; poți trimite solicitarea în continuare.";
 if(!process.env.SEAP_PROVIDER_URL)return Response.json({message:fallback});
 try{const url=new URL(process.env.SEAP_PROVIDER_URL);if(url.protocol!=="https:")throw new Error();url.searchParams.set("code",code);const r=await fetch(url,{headers:process.env.SEAP_PROVIDER_TOKEN?{Authorization:`Bearer ${process.env.SEAP_PROVIDER_TOKEN}`}:{},signal:AbortSignal.timeout(6000)});if(!r.ok)throw new Error();const d=await r.json() as Record<string,unknown>;const details:Record<string,string>={};for(const k of ["title","authority","deadline","value"])if(typeof d[k]==="string"&&d[k].length<500)details[k]=d[k] as string;return Response.json({details,message:lang==="en"?"Available details filled in. Please review them against the procedure documentation.":"Detaliile disponibile au fost completate. Verifică-le în documentația procedurii."})}catch{return Response.json({message:fallback})}
}


