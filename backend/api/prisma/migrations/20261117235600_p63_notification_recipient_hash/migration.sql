-- P63: persist only the keyed recipient hash needed to create school-local suppression
-- after provider bounce/complaint callbacks. Plaintext email is never persisted.
ALTER TABLE "NotificationOutbox"
  ADD COLUMN "recipientEmailHash" VARCHAR(64),
  ADD COLUMN "recipientEmailHashVersion" VARCHAR(20);
