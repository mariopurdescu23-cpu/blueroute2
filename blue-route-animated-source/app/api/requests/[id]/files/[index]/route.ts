import {getStore,bucket} from "@/lib/supabase";
import {isAdmin} from "@/lib/admin-auth";
export async function GET(_req:Request,{params}:{params:Promise<{id:string;index:string}>}){
 if(!await isAdmin())return new Response("Acces neautorizat",{status:403});const {id,index}=await params;if(!/^\d+$/.test(index))return new Response("Inexistent",{status:404});
 const {data:row,error}=await getStore().from("requests").select("files").eq("id",id).maybeSingle();if(error||!row)return new Response("Inexistent",{status:404});
 const f=row.files[Number(index)];if(!f)return new Response("Inexistent",{status:404});
 const {data,error:downloadError}=await getStore().storage.from(bucket()).createSignedUrl(f.key,60,{download:f.name});if(downloadError)return new Response("Fișier indisponibil",{status:503});return new Response(null,{status:302,headers:{Location:data.signedUrl,"Cache-Control":"private, no-store"}});
}
