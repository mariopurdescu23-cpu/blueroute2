import {BlueRoute} from "@/components/blue-route";
import {articles} from "@/lib/content";
import {notFound} from "next/navigation";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:articles.find(s=>s.slug===slug)?.ro};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!articles.some(s=>s.slug===slug))notFound();return <BlueRoute detail={{kind:"article",slug}}/>;}
