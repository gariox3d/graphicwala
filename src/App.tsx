import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import RamadanThemeProvider from "@/components/festival/RamadanThemeProvider";
import ValentineThemeProvider from "@/components/festival/ValentineThemeProvider";
import Index from "./pages/Index";

// Every non-home route is code-split so the first paint only downloads home page JS.
const Products = lazy(() => import("./pages/Products"));
const CategoryLanding = lazy(() => import("./pages/CategoryLanding"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ShareRedirect = lazy(() => import("./pages/ShareRedirect"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Sale = lazy(() => import("./pages/Sale"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));

// Admin panel is the heaviest area — kept fully out of the customer bundle.
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminShipping = lazy(() => import("./pages/admin/AdminShipping"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminValentineTheme = lazy(() => import("./pages/admin/AdminValentineTheme"));
const AdminFestivalTheme = lazy(() => import("./pages/admin/AdminFestivalTheme"));
const AdminAds = lazy(() => import("./pages/admin/AdminAds"));
const AdminLoyalty = lazy(() => import("./pages/admin/AdminLoyalty"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminStorage = lazy(() => import("./pages/admin/AdminStorage"));
const AdminBeforeAfter = lazy(() => import("./pages/admin/AdminBeforeAfter"));
const AdminAbandonedCarts = lazy(() => import("./pages/admin/AdminAbandonedCarts"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminPickupEarnings = lazy(() => import("./pages/admin/AdminPickupEarnings"));
const AdminHeroShowcase = lazy(() => import("./pages/admin/AdminHeroShowcase"));
import ScrollToTop from "./components/ScrollToTop";
import BreadcrumbSchema from "./components/seo/BreadcrumbSchema";
import AdminGuard from "./components/admin/AdminGuard";
import WelcomeBackPopup from "./components/WelcomeBackPopup";
import AddressGate from "./components/AddressGate";
import SplashScreen from "./components/SplashScreen";
import MobileBottomBar from "./components/MobileBottomBar";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" />
  </div>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('splash_shown');
  });
  const handleSplashFinish = useCallback(() => {
    localStorage.setItem('splash_shown', '1');
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <WelcomeBackPopup />
            <ValentineThemeProvider />
            <RamadanThemeProvider />
            <AddressGate>
            <BrowserRouter>
              <ScrollToTop />
              <BreadcrumbSchema />
              <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/category/:slug" element={<CategoryLanding />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/share/product/:id" element={<ShareRedirect />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/sale" element={<Sale />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                {/* Admin Routes - Protected by AdminGuard */}
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                <Route path="/admin/products/new" element={<AdminGuard><ProductForm /></AdminGuard>} />
                <Route path="/admin/products/:id" element={<AdminGuard><ProductForm /></AdminGuard>} />
                <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                <Route path="/admin/reviews" element={<AdminGuard><AdminReviews /></AdminGuard>} />
                <Route path="/admin/categories" element={<AdminGuard><AdminCategories /></AdminGuard>} />
                <Route path="/admin/coupons" element={<AdminGuard><AdminCoupons /></AdminGuard>} />
                <Route path="/admin/messages" element={<AdminGuard><AdminMessages /></AdminGuard>} />
                <Route path="/admin/customers" element={<AdminGuard><AdminCustomers /></AdminGuard>} />
                <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                <Route path="/admin/shipping" element={<AdminGuard><AdminShipping /></AdminGuard>} />
                <Route path="/admin/festival-theme" element={<AdminGuard><AdminFestivalTheme /></AdminGuard>} />
                <Route path="/admin/valentine-theme" element={<AdminGuard><AdminValentineTheme /></AdminGuard>} />
                <Route path="/admin/ads" element={<AdminGuard><AdminAds /></AdminGuard>} />
                <Route path="/admin/loyalty" element={<AdminGuard><AdminLoyalty /></AdminGuard>} />
                <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
                <Route path="/admin/storage" element={<AdminGuard><AdminStorage /></AdminGuard>} />
                <Route path="/admin/before-after" element={<AdminGuard><AdminBeforeAfter /></AdminGuard>} />
                <Route path="/admin/abandoned-carts" element={<AdminGuard><AdminAbandonedCarts /></AdminGuard>} />
                <Route path="/admin/pickup-earnings" element={<AdminGuard><AdminPickupEarnings /></AdminGuard>} />
                <Route path="/admin/billing" element={<AdminGuard><AdminBilling /></AdminGuard>} />
                <Route path="/admin/hero-showcase" element={<AdminGuard><AdminHeroShowcase /></AdminGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </ErrorBoundary>
              <MobileBottomBar />
              <FloatingWhatsApp />
            </BrowserRouter>
            </AddressGate>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </>
  );
};

export default App;
