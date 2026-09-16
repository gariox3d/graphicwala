import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { blogPosts, getPostBySlug } from '@/data/blogPosts';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const url = `https://www.graphicwala.com/blog/${post.slug}`;
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    inLanguage: 'en-IN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: post.author, jobTitle: post.authorRole },
    publisher: {
      '@type': 'Organization',
      name: 'Graphicwala',
      logo: { '@type': 'ImageObject', url: 'https://www.graphicwala.com/logo.png' },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`${post.title} | Graphicwala Blog`}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="flex-1 py-10 md:py-16">
        <article className="container max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all articles
          </Link>

          <span className="mt-6 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-b border-border pb-6">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <strong className="text-foreground font-semibold">{post.author}</strong>
                <span className="block text-xs">{post.authorRole}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readMinutes} min read
            </span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>

          <p className="mt-8 text-lg leading-relaxed text-foreground/90">{post.intro}</p>

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mb-4 leading-relaxed text-foreground/85">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc ml-6 space-y-2 text-foreground/85 leading-relaxed">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <aside className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-lg font-bold mb-2">Key takeaway</h2>
            <p className="text-foreground/85 leading-relaxed">{post.takeaway}</p>
          </aside>

          <div className="mt-10 rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold mb-2">Need this printed?</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Our studio in Katihar prints photo frames, PVC and ID cards, visiting cards and
              keychains, with prepaid delivery across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Talk to our team
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold mb-4">Continue reading</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs font-semibold text-primary">{r.category}</span>
                    <h3 className="mt-2 font-semibold leading-snug">{r.title}</h3>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {r.readMinutes} min read
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
