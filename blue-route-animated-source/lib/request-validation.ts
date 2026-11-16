import {z} from "zod";
export const serviceIds=["analiza-preliminara","documentatie-calificare","propunere-tehnica","propunere-financiara","oferta-completa","clarificari"] as const;
export const requestSchema=z.object({
 code:z.string().trim().min(3).max(500),title:z.string().trim().min(3).max(500),authority:z.string().trim().max(500).default(""),deadline:z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/).default(""),value:z.string().max(30).refine(v=>v===""||Number.isFinite(Number(v))&&Number(v)>=0).default(""),company:z.string().trim().min(2).max(200),cui:z.string().trim().max(40).default(""),name:z.string().trim().min(2).max(150),email:z.string().trim().email().max(200),phone:z.string().trim().min(6).max(35),notes:z.string().trim().max(4000).default(""),services:z.array(z.enum(serviceIds)).min(1).max(6).transform(a=>[...new Set(a)]),consent:z.literal(true),lang:z.enum(["ro","en"]).default("ro"),website:z.string().max(0).default(""),requestKey:z.string().uuid(),
});
export const statuses=["De analizat","În pregătire","Ofertă trimisă","Finalizat","Arhivat"] as const;
export const updateSchema=z.object({status:z.enum(statuses),fee:z.string().max(40),delivery:z.string().max(100),adminNotes:z.string().max(6000),quoteText:z.string().max(8000)});
export const allowedFile=/\.(pdf|doc|docx|xls|xlsx|zip)$/i;
export const MAX_UPLOAD=25*1024*1024;
export function safeFilename(name:string){return name.replace(/[^\p{L}\p{N}._ -]/gu,"_").slice(-160)||"document";}
