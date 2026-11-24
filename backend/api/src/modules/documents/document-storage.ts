import { S3Client, HeadObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { env } from "../../config/env.js";

let client: S3Client | undefined;
function storage() {
  if (!env.S3_BUCKET) throw Object.assign(new Error("Private document storage is not configured"), { status: 503 });
  if (!client) client = new S3Client({
    region: env.S3_REGION,
    ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: env.S3_FORCE_PATH_STYLE } : {}),
    ...(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? { credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY } } : {})
  });
  return { client, bucket: env.S3_BUCKET };
}
export async function createUploadUrl(key: string, mimeType: string, documentId: string) {
  const s = storage();
  return createPresignedPost(s.client, { Bucket: s.bucket, Key: key, Expires: 300, Fields: { "Content-Type": mimeType, "x-amz-meta-document-id": documentId }, Conditions: [["content-length-range", 1, 25 * 1024 * 1024], ["eq", "$Content-Type", mimeType], ["eq", "$x-amz-meta-document-id", documentId]] });
}
export async function verifyUploadedObject(key: string) {
  const s = storage();
  const result = await s.client.send(new HeadObjectCommand({ Bucket: s.bucket, Key: key }));
  return { sizeBytes: Number(result.ContentLength || 0), mimeType: result.ContentType || "", documentId: result.Metadata?.["document-id"] || "" };
}
export async function createScanDownloadUrl(key: string) {
  const s = storage();
  return getSignedUrl(s.client, new GetObjectCommand({ Bucket: s.bucket, Key: key }), { expiresIn: 120 });
}
export async function createDownloadUrl(key: string) {
  const s = storage();
  return getSignedUrl(s.client, new GetObjectCommand({ Bucket: s.bucket, Key: key, ResponseContentDisposition: "attachment" }), { expiresIn: 60 });
}
export async function createInlinePreviewUrl(key: string, mimeType: string) {
  const s = storage();
  return getSignedUrl(s.client, new GetObjectCommand({ Bucket: s.bucket, Key: key, ResponseContentType: mimeType, ResponseContentDisposition: "inline" }), { expiresIn: 60 });
}
export async function promoteCleanObject(quarantineKey: string, cleanKey: string) {
  const s = storage();
  try {
    await s.client.send(new HeadObjectCommand({ Bucket: s.bucket, Key: cleanKey }));
    await s.client.send(new DeleteObjectCommand({ Bucket: s.bucket, Key: quarantineKey }));
    return;
  } catch { /* clean object is not present yet; continue with promotion */ }
  const copySource = `${s.bucket}/${quarantineKey.split("/").map(encodeURIComponent).join("/")}`;
  await s.client.send(new CopyObjectCommand({ Bucket: s.bucket, Key: cleanKey, CopySource: copySource, MetadataDirective: "COPY" }));
  await s.client.send(new DeleteObjectCommand({ Bucket: s.bucket, Key: quarantineKey }));
}
export async function deleteObject(key: string) {
  const s = storage();
  await s.client.send(new DeleteObjectCommand({ Bucket: s.bucket, Key: key }));
}


// Server-generated private artifacts (for example approved report-card PDFs).
export async function getPrivateObjectBuffer(key: string): Promise<Buffer> {
  const s = storage();
  const result = await s.client.send(new GetObjectCommand({ Bucket: s.bucket, Key: key }));
  if (!result.Body) throw Object.assign(new Error("Private object body is empty"), { status: 404 });
  return Buffer.from(await result.Body.transformToByteArray());
}

export async function putPrivateObject(key: string, body: Buffer, contentType: string, metadata: Record<string,string> = {}) {
  const s = storage();
  await s.client.send(new PutObjectCommand({ Bucket: s.bucket, Key: key, Body: body, ContentType: contentType, Metadata: metadata, ServerSideEncryption: "AES256" }));
}
