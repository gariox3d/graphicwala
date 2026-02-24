import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import RamadanThemeProvider from "@/components/festival/RamadanThemeProvider";
import AdminFestivalTheme from "./pages/admin/AdminFestivalTheme";
import AdminAds from "./pages/admin/AdminAds";
import AdminLoyalty from "./pages/admin/AdminLoyalty";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminCustomers from "./pages/admin/AdminCustomers";
import ProductForm from "./pages/admin/ProductForm";
import NotFound from "./pages/NotFound";
import ShareRedirect from "./pages/ShareRedirect";
import Wishlist from "./pages/Wishlist";
import AIAssistant from "./pages/AIAssistant";
import ScrollToTop from "./components/ScrollToTop";
import AdminGuard from "./components/admin/AdminGuard";
import WelcomeBackPopup from "./components/WelcomeBackPopup";
import AddressGate from "./components/AddressGate";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <WelcomeBackPopup />
            <RamadanThemeProvider />
            <AddressGate>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
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
                <Route path="/ai-assistant" element={<AIAssistant />} />
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
                <Route path="/admin/festival-theme" element={<AdminGuard><AdminFestivalTheme /></AdminGuard>} />
                <Route path="/admin/ads" element={<AdminGuard><AdminAds /></AdminGuard>} />
                <Route path="/admin/loyalty" element={<AdminGuard><AdminLoyalty /></AdminGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </AddressGate>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
