import {isAdmin} from "@/lib/admin-auth";
import {AdminDashboard} from "@/components/admin-dashboard";
import {AdminLogin} from "@/components/admin-login";
export const dynamic="force-dynamic";
export const metadata={title:"Administrare",robots:{index:false,follow:false}};
export default async function Page(){return await isAdmin()?<AdminDashboard/>:<AdminLogin/>;}
