# Homepage category navigation

- Make the entire DESIGN, PRINT and CUSTOMIZE homepage cards clickable without changing their appearance.
- Open a category-specific view containing exactly the services listed for that category, using the existing shared service definitions and admin-managed thumbnails.
- Show only matching active products from the existing catalogue; retain their existing product links and ordering flow. Do not create products or change any backend data.
- Keep all other pages, pricing, checkout, WhatsApp, payments and admin authentication unchanged.

## Technical details
- Add one reusable `/services/:group` view for the three homepage groups.
- Reuse shared service keys, existing service descriptions, product cards and read-only catalogue queries.
- Verify all three card destinations and filtering on desktop and mobile.