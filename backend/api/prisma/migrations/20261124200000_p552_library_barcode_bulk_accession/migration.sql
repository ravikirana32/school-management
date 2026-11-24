ALTER TABLE "LibraryCopy" ADD COLUMN "barcodeValue" TEXT;
ALTER TABLE "LibraryCopy" ADD COLUMN "qrPayload" TEXT;
CREATE UNIQUE INDEX "LibraryCopy_barcodeValue_key" ON "LibraryCopy"("barcodeValue");
