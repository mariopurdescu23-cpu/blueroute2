"use client";

import {useEffect,useRef,useState} from "react";
import {Cookie} from "lucide-react";

export const preferenceKey="br-cookie-preference";
export const languageKey="br-language";
type Language="ro"|"en";

export function CookiePreferences({lang,open,onClose}:{lang:Language;open:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLElement|null>(null);
 const [details,setDetails]=useState(false);
 const [remember,setRemember]=useState(false);
 const t=(ro:string,en:string)=>lang==="ro"?ro:en;

 useEffect(()=>{
  const panel=dialog.current;
  if(open&&panel&&!panel.open){
   trigger.current=document.activeElement as HTMLElement|null;
   try{setRemember(localStorage.getItem(preferenceKey)==="language")}catch{setRemember(false)}
   setDetails(false);
   panel.showModal();
  }
 },[open]);

 function close(){
  dialog.current?.close();
  trigger.current?.focus();
  onClose();
 }

 function save(allow:boolean){
  try{
   localStorage.setItem(preferenceKey,allow?"language":"necessary");
   if(allow)localStorage.setItem(languageKey,lang);
   else localStorage.removeItem(languageKey);
  }catch{
   // Browser storage can be unavailable. The current page still honours the choice.
  }
  close();
 }

 return <dialog ref={dialog} className="cookie-panel" aria-labelledby="cookie-title" onCancel={event=>{event.preventDefault();close()}}>
  <div className="cookie-panel-inner">
   <span className="cookie-symbol"><Cookie size={28} aria-hidden="true"/></span>
   <div className="cookie-information">
    <h2 id="cookie-title">{t("Preferințe cookies","Cookie preferences")}</h2>
    <p>{t("Reținem alegerea ta privind stocarea în browser. Opțional, putem reține și limba aleasă pentru vizitele viitoare.","We remember your storage choice. You can also let us remember your language for future visits.")} <a href="/confidentialitate">{t("Detalii despre confidențialitate","Privacy details")}</a>.</p>
    {details&&<label className="cookie-option">
     <input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)}/>
     {t("Reține limba site-ului","Remember the site language")}
    </label>}
   </div>
   <div className="cookie-actions">
    {details
     ? <button type="button" className="cookie-outline" onClick={()=>save(remember)}>{t("Salvează preferințele","Save preferences")}</button>
     : <button type="button" className="cookie-outline" onClick={()=>setDetails(true)}>{t("Configurează","Settings")}</button>}
    <button type="button" onClick={()=>save(false)}>{t("Refuză opționalele","Reject optional")}</button>
    <button type="button" onClick={()=>save(true)}>{t("Acceptă opționalele","Accept optional")}</button>
   </div>
  </div>
 </dialog>;
}
