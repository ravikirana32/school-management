import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { isDocumentDownloadable, verifyDocumentScanSignature, validDocumentObjectMetadata } from "./document-security.js";

describe("private document security gates",()=>{
  it("only permits downloads after a clean scanner verdict",()=>{
    expect(isDocumentDownloadable("CLEAN")).toBe(true);
    for(const state of ["PENDING_UPLOAD","QUARANTINED","REJECTED","PENDING","VERIFIED"]) expect(isDocumentDownloadable(state)).toBe(false);
  });
  it("authenticates timestamped scanner callbacks and rejects stale replay",()=>{
    const body=Buffer.from('{"verdict":"CLEAN"}');const secret="a-secure-scanner-secret-of-at-least-32-chars";const timestamp=String(Math.floor(Date.now()/1000));
    const signature=createHmac("sha256",secret).update(timestamp).update(".").update(body).digest("hex");
    expect(verifyDocumentScanSignature(body,signature,secret,timestamp)).toBe(true);
    expect(verifyDocumentScanSignature(body,signature,"different-secret-of-at-least-32-characters",timestamp)).toBe(false);
    expect(verifyDocumentScanSignature(body,signature,secret,String(Math.floor(Date.now()/1000)-600))).toBe(false);
    expect(verifyDocumentScanSignature(body,signature,secret,String(Math.floor(Date.now()/1000)+600))).toBe(false);
    expect(verifyDocumentScanSignature(body,"bad",secret,timestamp)).toBe(false);
  });
  it("rejects uploaded objects with mismatched id, size or detected mime type",()=>{
    const valid={expectedId:"doc-1",expectedSize:100,expectedMime:"application/pdf",actualId:"doc-1",actualSize:100,actualMime:"application/pdf"};
    expect(validDocumentObjectMetadata(valid)).toBe(true);
    expect(validDocumentObjectMetadata({...valid,actualSize:99})).toBe(false);
    expect(validDocumentObjectMetadata({...valid,actualMime:"text/html"})).toBe(false);
  });
});
