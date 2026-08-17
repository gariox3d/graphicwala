import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.graphicwala.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-square.png`;

interface SeoProps {
  title: string;
  description: string;
  /** Path beginning with "/" — used for canonical and og:url */
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

/**
 * Per-route head tags: canonical + OpenGraph + Twitter card.
 */
const Seo = ({ title, description, path, image = DEFAULT_IMAGE, type = 'website', noindex = false }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:site_name" content="Graphic Wala" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default Seo;