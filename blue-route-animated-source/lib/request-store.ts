import "server-only";
import {getStore} from "./supabase";
export function displayRow(r:Record<string,unknown>){return {id:r.id,reference:r.reference,requestKey:r.request_key,createdAt:r.created_at,status:r.status,data:r.data,files:r.files,fee:r.fee,delivery:r.delivery,adminNotes:r.admin_notes,quoteText:r.quote_text,notification:r.notification}}
export async function byRequestKey(key:string){const {data,error}=await getStore().from("requests").select("reference").eq("request_key",key).maybeSingle();if(error)throw error;return data as {reference:string}|null}
