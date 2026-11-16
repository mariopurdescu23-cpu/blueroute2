import {NextResponse} from "next/server";
import {getStore,configured} from "@/lib/supabase";
import {allowedEmail,sameOrigin,SESSION_COOKIE} from "@/lib/admin-auth";
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:"Origine invalidă."},{status:403});
 if(!configured())return NextResponse.json({error:"Autentificarea va fi disponibilă după configurarea aplicației."},{status:503});
 let email="",password="";try{const d=await req.json();email=String(d.email||"").trim();password=String(d.password||"")}catch{return NextResponse.json({error:"Date invalide."},{status:400})}
 if(!email||!password||email.length>200||password.length>500)return NextResponse.json({error:"Completează e-mailul și parola."},{status:400});
 const {data,error}=await getStore().auth.signInWithPassword({email,password});
 if(error||!data.session||!data.user.email||!allowedEmail(data.user.email))return NextResponse.json({error:"Date de autentificare invalide sau cont neautorizat."},{status:401});
 const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:Math.min(data.session.expires_in,3600)});return response;
}
