import { createHmac, timingSafeEqual } from "node:crypto";

export function isDocumentDownloadable(status: string): boolean { return status === "CLEAN"; }
export function verifyDocumentScanSignature(rawBody: Buffer, signature: string, secret: string, timestamp: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature) || !/^\d{10}$/.test(timestamp)) return false;
  const issuedAt=Number(timestamp)*1000;
  if (!Number.isFinite(issuedAt) || Math.abs(Date.now()-issuedAt)>5*60*1000) return false;
  const expected=createHmac("sha256",secret).update(timestamp).update(".").update(rawBody).digest();
  const supplied=Buffer.from(signature,"hex");
  return supplied.length===expected.length && timingSafeEqual(supplied,expected);
}
export function validDocumentObjectMetadata(input:{expectedId:string;expectedSize:number;expectedMime:string;actualId:string;actualSize:number;actualMime:string}):boolean {
  return input.expectedId===input.actualId && input.expectedSize===input.actualSize && input.expectedMime===input.actualMime && input.actualSize>0;
}
