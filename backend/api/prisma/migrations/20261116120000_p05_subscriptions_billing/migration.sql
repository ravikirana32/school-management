CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY','QUARTERLY','YEARLY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT','TRIALING','ACTIVE','PAST_DUE','PAUSED','CANCELED','EXPIRED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT','OPEN','PAID','VOID','UNCOLLECTIBLE');
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED','REQUIRES_ACTION','PROCESSING','SUCCEEDED','FAILED','CANCELED','REFUNDED');

CREATE TABLE "SubscriptionPlan" (
  "id" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL, "description" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'INR', "monthlyPrice" DECIMAL(12,2) NOT NULL,
  "quarterlyPrice" DECIMAL(12,2), "yearlyPrice" DECIMAL(12,2),
  "trialDays" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isPublic" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "entitlements" JSONB NOT NULL, "limits" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "SubscriptionPlan_active_public_sort_idx" ON "SubscriptionPlan"("isActive","isPublic","sortOrder");

CREATE TABLE "OrganizationSubscription" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "planId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
  "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
  "currency" TEXT NOT NULL DEFAULT 'INR', "unitPrice" DECIMAL(12,2) NOT NULL,
  "trialStartsAt" TIMESTAMP(3), "trialEndsAt" TIMESTAMP(3),
  "currentPeriodStartsAt" TIMESTAMP(3) NOT NULL, "currentPeriodEndsAt" TIMESTAMP(3) NOT NULL,
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false, "canceledAt" TIMESTAMP(3), "endedAt" TIMESTAMP(3),
  "externalCustomerId" TEXT, "externalSubscriptionId" TEXT, "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationSubscription_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT,
  CONSTRAINT "OrganizationSubscription_plan_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT,
  CONSTRAINT "OrganizationSubscription_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT
);
CREATE INDEX "OrganizationSubscription_org_status_idx" ON "OrganizationSubscription"("organizationId","status");
CREATE INDEX "OrganizationSubscription_period_status_idx" ON "OrganizationSubscription"("currentPeriodEndsAt","status");
CREATE INDEX "OrganizationSubscription_external_idx" ON "OrganizationSubscription"("externalSubscriptionId");
CREATE UNIQUE INDEX "OrganizationSubscription_one_live_per_org_idx"
  ON "OrganizationSubscription"("organizationId")
  WHERE "status" IN ('PENDING_PAYMENT','TRIALING','ACTIVE','PAST_DUE','PAUSED');

CREATE TABLE "BillingInvoice" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "subscriptionId" TEXT,
  "invoiceNumber" TEXT NOT NULL UNIQUE, "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL DEFAULT 'INR', "subtotal" DECIMAL(12,2) NOT NULL,
  "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0, "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL, "amountDue" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0, "issuedAt" TIMESTAMP(3), "dueAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3), "billingSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingInvoice_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT,
  CONSTRAINT "BillingInvoice_subscription_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "OrganizationSubscription"("id") ON DELETE SET NULL
);
CREATE INDEX "BillingInvoice_org_status_created_idx" ON "BillingInvoice"("organizationId","status","createdAt");
CREATE INDEX "BillingInvoice_subscription_idx" ON "BillingInvoice"("subscriptionId");

CREATE TABLE "BillingInvoiceLine" (
  "id" TEXT PRIMARY KEY, "invoiceId" TEXT NOT NULL, "description" TEXT NOT NULL,
  "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1, "unitAmount" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0, "lineSubtotal" DECIMAL(12,2) NOT NULL,
  "lineTax" DECIMAL(12,2) NOT NULL DEFAULT 0, "lineTotal" DECIMAL(12,2) NOT NULL,
  "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingInvoiceLine_invoice_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE
);
CREATE INDEX "BillingInvoiceLine_invoice_idx" ON "BillingInvoiceLine"("invoiceId");

CREATE TABLE "PaymentAttempt" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "invoiceId" TEXT, "subscriptionId" TEXT,
  "provider" TEXT NOT NULL, "providerReference" TEXT, "idempotencyKey" TEXT NOT NULL,
  "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED', "currency" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "checkoutUrl" TEXT, "failureCode" TEXT, "failureMessage" TEXT,
  "processedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT,
  CONSTRAINT "PaymentAttempt_invoice_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE SET NULL,
  CONSTRAINT "PaymentAttempt_subscription_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "OrganizationSubscription"("id") ON DELETE SET NULL,
  CONSTRAINT "PaymentAttempt_org_idempotency_key" UNIQUE ("organizationId","idempotencyKey")
);
CREATE INDEX "PaymentAttempt_org_status_created_idx" ON "PaymentAttempt"("organizationId","status","createdAt");
CREATE INDEX "PaymentAttempt_provider_reference_idx" ON "PaymentAttempt"("provider","providerReference");

CREATE TABLE "PaymentWebhookEvent" (
  "id" TEXT PRIMARY KEY, "provider" TEXT NOT NULL, "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL, "payloadHash" TEXT NOT NULL, "processedAt" TIMESTAMP(3),
  "processingError" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhookEvent_provider_event_key" UNIQUE ("provider","providerEventId")
);
CREATE INDEX "PaymentWebhookEvent_processed_created_idx" ON "PaymentWebhookEvent"("processedAt","createdAt");

CREATE TABLE "OrganizationEntitlementOverride" (
  "id" TEXT PRIMARY KEY, "organizationId" TEXT NOT NULL, "featureKey" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL, "limitValue" JSONB, "reason" TEXT NOT NULL, "createdBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationEntitlementOverride_org_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "OrganizationEntitlementOverride_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "OrganizationEntitlementOverride_org_feature_key" UNIQUE ("organizationId","featureKey")
);
CREATE INDEX "OrganizationEntitlementOverride_org_expiry_idx" ON "OrganizationEntitlementOverride"("organizationId","expiresAt");

-- Tenant RLS: subscription, invoice and payment attempt data is organization-scoped.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['OrganizationSubscription','BillingInvoice','PaymentAttempt','OrganizationEntitlementOverride']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING ("organizationId" = current_setting(''app.current_organization_id'', true) OR current_setting(''app.is_platform_admin'', true) = ''true'') WITH CHECK ("organizationId" = current_setting(''app.current_organization_id'', true) OR current_setting(''app.is_platform_admin'', true) = ''true'')',
      lower(t || '_tenant_isolation'), t
    );
  END LOOP;
END $$;
