import type { Metadata } from "next";
import "./site.css";
export const metadata: Metadata = {
 title: {default:"BLUE ROUTE — O direcție clară pentru proiecte ambițioase",template:"%s | BLUE ROUTE"},
 description:"Consultanță în achiziții publice pentru construcții. Documentații de calificare, propuneri tehnice și financiare. Solicită o ofertă pentru licitația ta SEAP.",
 icons:{icon:"/favicon.svg"}, openGraph:{title:"BLUE ROUTE — Public Procurement Consulting",description:"Construim oferte competitive pentru proiecte ambițioase.",locale:"ro_RO",type:"website"},
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ro"><body>{children}</body></html>;}
