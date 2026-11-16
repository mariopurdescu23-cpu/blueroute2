import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
export type UploadReceipt={key:string;name:string;size:number;requestKey:string;expires:number};
const secret=()=>{const s=process.env.UPLOAD_SIGNING_SECRET;if(!s||s.length<32)throw new Error("Upload signing not configured");return s};
export function signUpload(data:UploadReceipt){const payload=Buffer.from(JSON.stringify(data)).toString("base64url");return `${payload}.${createHmac("sha256",secret()).update(payload).digest("base64url")}`}
export function verifyUpload(token:string,requestKey:string):UploadReceipt|null{
 try{const [payload,signature,...extra]=token.split(".");if(extra.length||!payload||!signature)return null;const expected=createHmac("sha256",secret()).update(payload).digest();const actual=Buffer.from(signature,"base64url");if(actual.length!==expected.length||!timingSafeEqual(expected,actual))return null;const d=JSON.parse(Buffer.from(payload,"base64url").toString()) as UploadReceipt;return d.requestKey===requestKey&&d.expires>Date.now()&&d.key.startsWith(`requests/${requestKey}/`)?d:null}catch{return null}
}
