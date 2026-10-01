# Graphic Wala Redesign: Design, Print and Customize

The goal: anyone who opens the site understands within 5 seconds that Graphic Wala does **Design + Print + Customize**, not just gifts. Your existing products, cart, checkout, Razorpay, WhatsApp, admin and accounts all stay as they are.

## What changes

**Header and mobile bar**
- New menu: Home, Design & Print, Custom Products, Wedding, Business Printing, Corporate Gifting, Portfolio, About, Contact. On mobile it moves into a slide-out menu.
- A red "Order on WhatsApp" button in the header.
- The bottom bar on phones becomes WhatsApp / Call / Order Now. The cart stays in the header.
- Logo text: "GRAPHIC WALA" with the tagline "DESIGN • PRINT • CUSTOMIZE" and "डिजाइन की नई पहचान".

**Home page, in this order**
1. Hero: "DESIGN. PRINT. CUSTOMIZE.", your subheadline, and two buttons: Explore Services and Order on WhatsApp. The picture is a clean collage of 6 tiles (banner, visiting card, wedding card, frame, mug/t-shirt, keychain), built from your current product photos.
2. Three big cards: DESIGN / PRINT / CUSTOMIZE, each with its list of services and a button.
3. Popular Products: your current bestsellers from the shop.
4. Business Printing & Branding block with a "Get a Business Quote" button.
5. How It Works in 4 steps: design first, then approval, then payment, then printing.
6. Payment Policy: full payment only, no COD, no half payment.
7. Why Choose Graphic Wala: 8 points with no invented numbers.
8. Wedding block with a link to invites.graphicwala.com.
9. Portfolio preview, testimonials, FAQ and the closing call to action.
- The "4.9 / 5 · 10K+ Orders" badge and other unverified numbers come off.

**New pages**
- `/design-print`: Graphic Design, Business Printing and Wedding Printing service cards. Each card has an image, a short description, "Starting at" (only when you set a price), a Get Quote button and a WhatsApp Order button.
- `/custom-products`: Photo Products, Sublimation and PVC/ID groups, plus your real shop products with filter chips. Order Now adds the item to the cart as it does today.
- `/business-printing`: a page just for business printing.
- `/wedding`: wedding services and a strong "Explore Digital Wedding Invitations" button that opens invites.graphicwala.com.
- `/corporate-gifting`: corporate products and a Bulk Quote form (Name, Company, Phone, Email, Product, Quantity, Message). Messages go into your existing admin Messages inbox.
- `/portfolio`: a gallery with filters (Graphic Design, Printing, Wedding, Photo Editing, Sublimation, Gifts, Branding). It uses your approved customer gallery and before/after photos.
- The Products page gets the filter chips: All, Design, Printing, Business Printing, Wedding, Photo Products, Sublimation, Customized Gifts, PVC/ID, Corporate Gifts.
- About and Contact get the new positioning, plus Get a Quote / WhatsApp Us / Call Now buttons.

**SEO**
- Each new page gets its own title, description, H1/H2 structure, alt text and social preview text, aimed at Katihar searches (graphic designer, printing press, visiting card, banner, wedding card, mug and t-shirt printing, PVC card, corporate gifts) without keyword stuffing.
- The local business details are updated and the new pages are added to the sitemap.

**Look and feel**
- Same red / black / white colours and the same Outfit font.
- Fewer gradients and lighter animation. Card corners, spacing and buttons follow one consistent style. Built for phones first.

## Things to confirm before or after building
- **Service photos:** for services with no product photo yet (logo design, bill books, letterheads and similar), I'll use clean icon-style tiles instead of stock photos. You can upload real photos later.
- **Prices:** services show "Get Quote" unless you tell me a starting price.
- **Portfolio:** it starts with your existing gallery photos. You'll be able to add more work there later.

## Technical details
- New data file `src/data/services.ts` holds the service lists. Each entry has a slug, name, description, optional price, filter group and icon.
- New pages are lazy-loaded through routes in `App.tsx`. Header.tsx and MobileBottomBar.tsx get the new menu.
- New home components: `HeroSection` rewrite, `PillarCards`, `BusinessBlock`, `PaymentPolicy`, `WeddingBlock`, `PortfolioPreview`. HowItWorks and WhyBuyFromUs are updated.
- The products filter maps each chip to category names, using the existing categories table.
- The corporate enquiry form inserts into the existing `contact_messages` table, with the extra fields folded into the message, so no database change is needed.
- Existing cart, checkout, Razorpay, Shiprocket and admin code is not touched. Routes are added to the sitemap edge function.
