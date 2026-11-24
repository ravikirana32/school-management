# P05 Billing API

Base path `/api/v1/billing`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/plans` | Public | List public active plans |
| POST | `/organizations/:organizationId/subscription` | Org admin | Start trial/paid subscription record |
| GET | `/organizations/:organizationId/subscription` | Org member | Read subscription |
| GET | `/organizations/:organizationId/invoices` | Org member | List invoices |
| POST | `/organizations/:organizationId/checkout` | Org admin | Create payment attempt placeholder |
| POST | `/webhooks/:provider` | Provider signature | Verify and deduplicate webhook event |
| GET | `/organizations/:organizationId/entitlements/:featureKey` | Org member | Resolve one feature entitlement |

The checkout endpoint does not initiate a payment until a provider adapter is configured. The webhook endpoint stores verified events but does not reconcile payment status in this phase.
