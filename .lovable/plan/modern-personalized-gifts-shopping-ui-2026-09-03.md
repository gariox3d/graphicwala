# Modern personalized-gifts shopping UI

## What will change
- Rework the existing homepage hero into a clean, vibrant e-commerce composition inspired by the selected 21st.dev commerce hero pattern, while keeping Graphicwala’s red, white, and black brand system.
- Replace the long alternating category presentation with a compact responsive category grid focused on Photo Frames, Ceramic Mugs, T-Shirts, and Acrylic Keychains. Category images will continue to come from the admin-managed category/product data.
- Add a focused product customizer card on customizable product pages with photo upload, custom text, upload status/preview, and a WhatsApp order CTA.

## Interaction details
- Category tiles navigate to the matching category pages and remain usable on mobile.
- Existing secure JPG/PNG upload and login requirements remain unchanged.
- Custom text is retained per product in the browser session and included in the WhatsApp enquiry message.
- The normal Add to Cart and Buy Now flows remain available and unchanged.

## Technical details
- Adapt the retrieved 21st.dev commerce hero’s responsive composition and motion patterns to existing React, Tailwind, shadcn, and semantic design tokens rather than copying its navbar or external assets.
- Update `HeroSection.tsx` and `CategoryShowcase.tsx`; add a small product-customizer component and connect it in `ProductDetail.tsx`.
- Reuse `Button`, existing upload/auth/storage logic, `SmartImage`, route helpers, and the normalized WhatsApp number utility.
- Verify with the project test command and a desktop/mobile browser render, including upload-card layout and no horizontal overflow.
