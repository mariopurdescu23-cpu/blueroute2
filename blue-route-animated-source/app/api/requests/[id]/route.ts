import {getStore} from "@/lib/supabase";
import {isAdmin,sameOrigin} from "@/lib/admin-auth";
import {updateSchema} from "@/lib/request-validation";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin()||!sameOrigin(req))return Response.json({error:"Acces neautorizat."},{status:403});
 let parsed;try{parsed=updateSchema.safeParse(await req.json())}catch{return Response.json({error:"Date invalide."},{status:400})}if(!parsed.success)return Response.json({error:"Date invalide."},{status:400});
 const {id}=await params;const d=parsed.data;const {data,error}=await getStore().from("requests").update({status:d.status,fee:d.fee,delivery:d.delivery,admin_notes:d.adminNotes,quote_text:d.quoteText}).eq("id",id).select("id");
 if(error)return Response.json({error:"Salvarea a eșuat."},{status:503});return data.length?Response.json({ok:true}):Response.json({error:"Solicitare inexistentă."},{status:404});
}
