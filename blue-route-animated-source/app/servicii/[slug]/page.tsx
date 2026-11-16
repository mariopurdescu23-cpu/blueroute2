import {BlueRoute} from "@/components/blue-route";
import {services} from "@/lib/content";
import {notFound} from "next/navigation";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const s=services.find(s=>s.slug===slug);return {title:s?.ro,description:s?.body};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!services.some(s=>s.slug===slug))notFound();return <BlueRoute detail={{kind:"service",slug}}/>;}
