import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const heroSubtexts = [
  "Photo Frames for Every Special Moment",
  "PVC Cards & Keychains with Your Photos",
  "Visiting Cards & ID Cards",
  "Delivered Across Bihar • Premium Print • Prepaid Only",
];

const trustBadges = [
  { icon: Truck, text: "Bihar Delivery" },
  { icon: Shield, text: "Premium Quality" },
  { icon: CreditCard, text: "Prepaid Only" },
];

const deliveryPoints = [
  "Delivery Available Across Bihar",
  "No Cash on Delivery",
  "Online Prepaid Orders Only",
];

const HeroSection = () => {
  const [currentSubtext, setCurrentSubtext] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentSubtext((prev) => (prev + 1) % heroSubtexts.length);
        setIsAnimating(true);
      }, 300);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      className="relative min-h-[95vh] md:min-h-[90vh] flex items-center overflow-hidden"
      aria-label="Graphic Wala - Custom Printing Store Bihar"
    >
      {/* Premium Animated Gradient Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] opacity-40 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, hsl(0, 85%, 35%) 0%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, hsl(0, 70%, 25%) 0%, transparent 70%)',
            bottom: '-15%',
            right: '-5%',
            animationDuration: '8s',
            animationDelay: '2s',
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, hsl(350, 80%, 20%) 0%, transparent 70%)',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            animationDuration: '10s',
            animationDelay: '1s',
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20 animate-pulse"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 4 + 3}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="container relative z-10 py-16 md:py-20">
        <header className="max-w-4xl mx-auto text-center">
          {/* Top Badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-sm font-bold mb-8 animate-fade-in backdrop-blur-md"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Bihar's Favorite Custom Gift Store
          </div>

          {/* Main Heading */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6 animate-fade-in"
            style={{ 
              textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(220,38,38,0.15)',
              animationDelay: '0.2s'
            }}
          >
            Personalized Gifts Made from
            <br />
            <span className="text-primary">Your Memories</span> 🎁
          </h1>

          {/* Animated Subtext */}
          <div className="h-[60px] md:h-[70px] flex items-center justify-center mb-6">
            <p 
              className={`text-lg md:text-xl lg:text-2xl text-white/85 font-medium transition-all duration-500 ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
            >
              {heroSubtexts[currentSubtext]}
            </p>
          </div>

          {/* Emotional Quote */}
          <blockquote 
            className="text-base md:text-lg text-white/60 italic mb-8 max-w-2xl mx-auto animate-fade-in px-4"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="text-primary/70">"</span>
            Because the best gifts are not bought,
            <br className="hidden sm:block" />
            they are created with memories.
            <span className="text-primary/70">"</span>
          </blockquote>

          {/* Bihar Delivery Points */}
          <div 
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 animate-fade-in px-4"
            style={{ animationDelay: '0.5s' }}
          >
            {deliveryPoints.map((point) => (
              <div 
                key={point}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium text-green-300">{point}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div 
            className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10 animate-fade-in px-4"
            style={{ animationDelay: '0.55s' }}
            role="list"
            aria-label="Store features"
          >
            {trustBadges.map((badge) => (
              <div 
                key={badge.text}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                role="listitem"
              >
                <badge.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-semibold text-white/90">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <nav 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in px-4"
            style={{ animationDelay: '0.6s' }}
            aria-label="Shop actions"
          >
            <Link to="/products" aria-label="Create your personalized gift">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1 border border-primary/50"
              >
                Create Your Gift
                <ArrowRight className="h-5 w-5 ml-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/products" aria-label="Browse gift categories">
              <Button 
                variant="outline" 
                size="xl"
                className="w-full sm:w-auto border-2 border-white/30 bg-white/5 text-white hover:bg-white hover:text-black font-bold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
              >
                Browse Gift Categories
              </Button>
            </Link>
          </nav>

          {/* Hidden SEO Content */}
          <p className="sr-only">
            Graphic Wala Store offers premium custom printing services in Bihar including personalized photo frames, 
            PVC card printing, ID card printing, visiting card printing, and keychain printing. 
            We provide home delivery across Bihar with prepaid orders only. 
            Order your custom printed gifts online and get them delivered to your doorstep.
          </p>
        </header>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block" aria-hidden="true">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
