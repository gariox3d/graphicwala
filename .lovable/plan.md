# Valentine's Day Theme Implementation Plan

1. **Theme Setting Database setup**
   - The `festival_settings` table already exists. We will use `theme_name = 'valentine'` to manage the setting (enabled, greeting, etc.).

2. **Hook Creation (`src/hooks/useValentineSettings.ts`)**
   - Create a duplicate of `useFestivalSettings.ts` specifically tailored for `valentine`. This separates concerns from Ramadan.

3. **Global CSS Update (`src/index.css`)**
   - Add `.valentine-theme` overrides for root variables (shifting the brand red/black to lovely pinks, soft reds, and rose tones).
   - Add CSS keyframes for floating/falling hearts animations and smooth transitions.

4. **Component Creation (`src/components/festival/ValentineThemeProvider.tsx`)**
   - This component will check `useValentineSettings()`.
   - If enabled, it adds the `.valentine-theme` class to `document.documentElement` and renders an overlay of floating CSS-based hearts across the site.
   - It will also optionally display a greeting banner if configured.

5. **Admin Panel Page (`src/pages/admin/AdminValentineTheme.tsx`)**
   - Create a new admin page specifically for toggling the Valentine's Day theme.
   - It will use `useValentineSettings()` and `useAdminDraftState()` to manage the `is_enabled`, `greeting_text`, etc.
   - It will have a visual preview mode and save button.

6. **Routing & App Integration (`src/App.tsx` & `src/components/admin/AdminLayout.tsx`)**
   - Add the `<ValentineThemeProvider />` globally in `App.tsx`.
   - Add the `/admin/valentine-theme` route to `App.tsx`.
   - Add a navigation link to `AdminLayout.tsx` for the Valentine's theme dashboard.