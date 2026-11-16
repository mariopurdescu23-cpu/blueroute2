import {z} from "zod";
import {bucket,configured,getStore} from "@/lib/supabase";
import {sameOrigin} from "@/lib/admin-auth";
import {MAX_UPLOAD,allowedFile,safeFilename} from "@/lib/request-validation";
import {signUpload} from "@/lib/upload-receipt";
export const runtime="nodejs";
const schema=z.object({requestKey:z.string().uuid(),files:z.array(z.object({name:z.string().min(1).max(200).refine(n=>allowedFile.test(n)),size:z.number().int().positive().max(MAX_UPLOAD)})).max(8)});
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:"Origine invalidă"},{status:403});
 if(!configured()||!process.env.UPLOAD_SIGNING_SECRET||process.env.UPLOAD_SIGNING_SECRET.length<32)return Response.json({error:"Încărcarea documentelor va fi disponibilă după configurarea stocării."},{status:503});
 let parsed;try{parsed=schema.safeParse(await req.json())}catch{return Response.json({error:"Date invalide"},{status:400})}
 if(!parsed.success||parsed.data.files.reduce((n,f)=>n+f.size,0)>MAX_UPLOAD)return Response.json({error:"Maximum 8 documente și 25 MB în total."},{status:400});
 try{const uploads=[];for(const f of parsed.data.files){const key=`requests/${parsed.data.requestKey}/${crypto.randomUUID()}`;const {data,error}=await getStore().storage.from(bucket()).createSignedUploadUrl(key);if(error)throw error;uploads.push({url:data.signedUrl,receipt:signUpload({key,name:safeFilename(f.name),size:f.size,requestKey:parsed.data.requestKey,expires:Date.now()+2*3600000})})}return Response.json({uploads},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"Documentele nu pot fi încărcate momentan. Încearcă din nou."},{status:503})}
}
