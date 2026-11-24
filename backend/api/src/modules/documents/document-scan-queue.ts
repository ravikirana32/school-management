import { Queue } from "bullmq";
import { env } from "../../config/env.js";
export const DOCUMENT_SCAN_QUEUE="document-malware-scan";
let queue:Queue|undefined;
function connection(){const u=new URL(env.REDIS_URL);return {host:u.hostname,port:Number(u.port||6379),...(u.username?{username:decodeURIComponent(u.username)}:{}),...(u.password?{password:decodeURIComponent(u.password)}:{}),...(u.protocol==="rediss:"?{tls:{}}:{}),...(u.pathname.length>1?{db:Number(u.pathname.slice(1))}:{}),maxRetriesPerRequest:null as null};}
export function documentScanQueue(){if(!queue)queue=new Queue(DOCUMENT_SCAN_QUEUE,{connection:connection()});return queue;}
export async function enqueueDocumentScan(kind:"student"|"staff"|"homework"|"school-logo"|"refund-evidence"|"admission",documentId:string,retryToken?:string){return documentScanQueue().add("scan",{kind,documentId},{jobId:retryToken?`${kind}-${documentId}-${retryToken}`:`${kind}-${documentId}`,attempts:5,backoff:{type:"exponential",delay:20_000},removeOnComplete:{age:604800,count:10000},removeOnFail:false});}
