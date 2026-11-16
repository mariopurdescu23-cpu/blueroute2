import {NextResponse} from "next/server";
import {sameOrigin,SESSION_COOKIE} from "@/lib/admin-auth";
export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:"Origine invalidă"},{status:403});const r=NextResponse.json({ok:true});r.cookies.set(SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});return r;}
