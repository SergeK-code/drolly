# Skill: Safe COD checkout

Checkout is a financial/data-integrity boundary even though payment is cash on delivery.

- Require an authenticated customer.
- Accept product IDs and positive integer quantities, not authoritative prices or totals.
- Derive customer identity from the session.
- Load current active products, prices and stock from PostgreSQL.
- Calculate subtotal, delivery fee and total using integer minor units.
- Apply current store minimum and delivery settings.
- Create order and item snapshots in one atomic database transaction.
- Decrement stock safely under concurrency.
- Use an idempotency key with a unique constraint/recorded result.
- Restrict payment method to cash on delivery.
- Customer can read only their own order.
- Customer cannot set order status.
- Admin status changes must follow a service-level transition map.

If transactionality or concurrency safety is not implemented and tested, clearly state checkout is not production-safe.
