/**
 * Column list used for product *listing* queries (cards, grids, carousels).
 * Keeps list payloads small — full product rows are only fetched on the
 * product detail page.
 */
export const PRODUCT_CARD_FIELDS =
  'id, name, slug, description, short_description, service_group, price_starting_from, whatsapp_order_enabled, price, sale_price, sale_start, sale_end, image_url, image_urls, upload_config, stock_quantity, delivery_days, category_id, is_active, display_order, created_at';

export const PRODUCT_CARD_FIELDS_WITH_CATEGORY = `${PRODUCT_CARD_FIELDS}, categories(id, name)`;
