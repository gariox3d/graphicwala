# Homepage Service Image Management

## What will change
- Replace the generated service icons in the existing homepage DESIGN, PRINT, and CUSTOMIZE cards with image thumbnails.
- Keep the current card layout, colors, links, text, and surrounding homepage sections unchanged.
- Add a protected **Service Images** page to the existing Admin Panel.
- Show all 19 requested services, grouped under DESIGN, PRINT, and CUSTOMIZE.
- Let an administrator upload, replace, or delete each thumbnail, with loading states and clear success/error messages.

## Image behavior
- Store uploaded files in the existing public image storage area under a dedicated homepage-services folder.
- Optimize and validate uploads using the website’s existing image upload pipeline.
- Preserve image proportions and display thumbnails without cropping.
- If a service has no uploaded image, show a neutral empty-image placeholder rather than a generated icon.
- Replacing or deleting an image will remove the old stored file to avoid unused storage.

## Data and access
- Add one small table that maps each fixed service key to its uploaded image URL.
- Allow the public website to read thumbnails.
- Allow only authenticated administrators to add, replace, or delete them.
- Keep pricing, checkout, WhatsApp, authentication, products, and all other functionality untouched.

## Verification
- Confirm image upload, replacement, deletion, and homepage display while signed in as an administrator.
- Check the homepage on desktop and mobile widths.
- Confirm the app builds without errors.

## Technical details
- Reuse the existing `ad-images` storage bucket and image validation/optimization helpers.
- Add an admin route and sidebar entry for service-image management.
- Fetch the thumbnail map once for the homepage card section and match it by stable service keys.
