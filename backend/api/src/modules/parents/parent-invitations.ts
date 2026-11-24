import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";

function encryptionKey() {
  const value=env.PARENT_INVITE_ENCRYPTION_KEY;
  if(!value) throw Object.assign(new Error("Parent invitation delivery encryption is not configured"),{status:503});
  const key=Buffer.from(value,"base64");
  if(key.length!==32) throw Object.assign(new Error("Parent invitation encryption key must decode to exactly 32 bytes"),{status:503});
  return key;
}
export function encryptInvitationPayload(payload: { email:string; token:string; invitationId:string }) {
  const nonce=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",encryptionKey(),nonce);
  const ciphertext=Buffer.concat([cipher.update(JSON.stringify(payload),"utf8"),cipher.final()]);
  return { deliveryCiphertext:ciphertext.toString("base64"),deliveryNonce:nonce.toString("base64"),deliveryTag:cipher.getAuthTag().toString("base64") };
}
export function decryptInvitationPayload(input:{deliveryCiphertext:string;deliveryNonce:string;deliveryTag:string}) {
  const decipher=createDecipheriv("aes-256-gcm",encryptionKey(),Buffer.from(input.deliveryNonce,"base64"));
  decipher.setAuthTag(Buffer.from(input.deliveryTag,"base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(input.deliveryCiphertext,"base64")),decipher.final()]).toString("utf8")) as {email:string;token:string;invitationId:string};
}
