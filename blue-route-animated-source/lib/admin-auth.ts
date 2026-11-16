import "server-only";
import {cookies} from "next/headers";
import {configured,getStore} from "./supabase";
export const SESSION_COOKIE="br_admin";
export function allowedEmail(email:string){return (process.env.ADMIN_EMAILS||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())}
export async function isAdmin(){
 if(!configured())return false;
 const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return false;
 try{const {data,error}=await getStore().auth.getUser(token);return !error&&Boolean(data.user?.email&&allowedEmail(data.user.email))}catch{return false}
}
export function sameOrigin(req:Request){const origin=req.headers.get("origin");if(!origin)return true;try{const source=new URL(origin);const host=req.headers.get("host")||new URL(req.url).host;return ["http:","https:"].includes(source.protocol)&&source.host===host}catch{return false}}
