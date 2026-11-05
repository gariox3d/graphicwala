
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.graphicwala.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-square.png`;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

const Seo = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}: SeoProps) => {
  // Normalize internal URLs to avoid accidental duplicate canonicals.
  const normalizedPath = `/${path
    .trim()
    .replace(/^\/+/, '')
    .split('?')[0]
    .split('#')[0]}`;

  const cleanPath =
    normalizedPath === '/'
      ? '/'
      : normalizedPath.replace(/\/+$/, '');

  const url = `${SITE_URL}${cleanPath}`;

  const imageUrl = image.startsWith('/')
    ? `${SITE_URL}${image}`
    : image;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, follow'
            : 'index, follow, max-image-preview:large'
        }
      />

      {!noindex && (
        <link rel="canonical" href={url} />
      )}

      <meta property="og:site_name" content="Graphic Wala" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default Seo;
