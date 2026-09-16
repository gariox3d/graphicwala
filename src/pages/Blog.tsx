import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { blogPosts, BLOG_CATEGORIES } from '@/data/blogPosts';

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Graphicwala Journal',
  description:
    'Printing guides, graphic design tutorials and branding advice from the Graphicwala studio.',
  url: 'https://www.graphicwala.com/blog',
  blogPost: blogPosts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    author: { '@type': 'Person', name: p.author },
    url: `https://www.graphicwala.com/blog/${p.slug}`,
  })),
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const Blog = () => {
  const [active, setActive] = useState<string>('All');
  const posts = active === 'All' ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Printing &amp; Design Blog | Graphicwala Journal</title>
        <meta
          name="description"
          content="Practical printing guides, graphic design tutorials and branding advice from the Graphicwala studio — GSM paper weights, CMYK colour, vector files and card design."
        />
        <link rel="canonical" href="https://www.graphicwala.com/blog" />
        <meta property="og:title" content="Printing & Design Blog | Graphicwala Journal" />
        <meta
          property="og:description"
          content="Printing guides, design tutorials and branding advice from the Graphicwala studio."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.graphicwala.com/blog" />
        <script type="application/ld+json">{JSON.stringify(blogJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="py-14 md:py-20 bg-foreground text-background">
          <div className="container text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
              Graphicwala Journal
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Printing &amp; Design Insights</h1>
            <p className="text-background/70 max-w-2xl mx-auto">
              In-depth guides written by our own production and design team — file preparation,
              paper stocks, colour management, vector artwork and brand identity for Indian
              businesses.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container">
            <nav className="flex flex-wrap gap-2 justify-center mb-10" aria-label="Blog categories">
              {BLOG_CATEGORIES.map((c) => (
                <Button
                  key={c}
                  variant={active === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActive(c)}
                >
                  {c}
                </Button>
              ))}
            </nav>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {post.category}
                  </span>
                  <h2 className="mt-4 text-xl font-bold leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                    {post.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.readMinutes} min read
                    </span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
