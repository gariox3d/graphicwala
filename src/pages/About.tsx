import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Graphic Wala</h1>
          <p className="text-background/70 max-w-2xl mx-auto">Your trusted partner for premium printing solutions since 2020.</p>
        </div>
      </section>
      <section className="py-16 container">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground leading-relaxed">Graphic Wala is a leading printing service provider committed to delivering exceptional quality products. From photo frames to business cards, we bring your ideas to life with precision and care.</p>
          <p className="text-muted-foreground leading-relaxed mt-4">Our mission is to make premium printing accessible to everyone, with fast delivery, competitive pricing, and unmatched customer service.</p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
