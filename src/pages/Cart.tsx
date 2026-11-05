
import SmartImage from '@/components/SmartImage';

import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Seo from '@/components/seo/Seo';

import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Image as ImageIcon,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
} from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

import {
  Product,
  UploadField,
  getEffectivePrice,
} from '@/lib/types';

import DesignUpload from '@/components/DesignUpload';
import PriceBreakdown from '@/components/PriceBreakdown';
import DeliveryInfoBanner from '@/components/DeliveryInfoBanner';

import { toast } from 'sonner';


const Cart = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
    loading,
  } = useCart();

  const navigate = useNavigate();

  const [productDesigns, setProductDesigns] = useState<
    Record<string, Record<string, string>>
  >({});

  const [expandedUploads, setExpandedUploads] = useState<Set<string>>(
    new Set()
  );


  /* =====================================================
     LOAD SAVED DESIGNS
  ===================================================== */

  useEffect(() => {
    try {
      const savedDesigns = sessionStorage.getItem('productDesigns');

      if (savedDesigns) {
        const parsed = JSON.parse(savedDesigns);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setProductDesigns(parsed);
        }
      }
    } catch (error) {
      console.error('Unable to restore saved designs:', error);
      sessionStorage.removeItem('productDesigns');
    }
  }, []);


  /* =====================================================
     DELIVERY CHARGE
  ===================================================== */

  const deliveryCharge = cartItems.reduce((total, item) => {
    const product = item.products as Product & {
      delivery_charge?: number | null;
    };

    return total + (Number(product?.delivery_charge) || 0);
  }, 0);

  const totalPayable = cartTotal + deliveryCharge;


  /* =====================================================
     UPLOAD CONFIGURATION
  ===================================================== */

  const getUploadConfig = (
    product: Product | undefined
  ): UploadField[] => {
    if (
      !product ||
      !Array.isArray(product.upload_config) ||
      product.upload_config.length === 0
    ) {
      return [];
    }

    return product.upload_config as UploadField[];
  };


  /* =====================================================
     CHECK REQUIRED UPLOADS
  ===================================================== */

  const getMissingRequiredUploads = () => {
    const missing: {
      itemId: string;
      productName: string;
      fields: string[];
    }[] = [];

    cartItems.forEach((item) => {
      const product = item.products as Product;

      const config = getUploadConfig(product);

      const requiredFields = config.filter((field) => field.required);

      const designs = productDesigns[item.product_id] || {};

      const missingFields = requiredFields
        .filter((field) => !designs[field.id])
        .map((field) => field.label);

      if (missingFields.length > 0) {
        missing.push({
          itemId: item.id,
          productName: product?.name || 'Unknown Product',
          fields: missingFields,
        });
      }
    });

    return missing;
  };


  /* =====================================================
     HANDLE DESIGN UPLOAD
  ===================================================== */

  const handleDesignUpload = (
    productId: string,
    urls: Record<string, string>
  ) => {
    setProductDesigns((previous) => {
      const updated = {
        ...previous,
        [productId]: {
          ...(previous[productId] || {}),
          ...urls,
        },
      };

      try {
        sessionStorage.setItem(
          'productDesigns',
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error('Unable to save designs:', error);
        toast.error('Unable to save your design details in this session.');
      }

      return updated;
    });
  };


  /* =====================================================
     TOGGLE UPLOAD SECTION
  ===================================================== */

  const toggleUploadSection = (itemId: string) => {
    setExpandedUploads((previous) => {
      const updated = new Set(previous);

      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }

      return updated;
    });
  };


  /* =====================================================
     REMOVE PRODUCT
  ===================================================== */

  const handleRemoveProduct = (itemId: string) => {
    removeFromCart(itemId);
  };


  /* =====================================================
     CHECKOUT
  ===================================================== */

  const missingUploads = getMissingRequiredUploads();

  const canCheckout = missingUploads.length === 0;

  const handleProceedToCheckout = () => {
    const missing = getMissingRequiredUploads();

    if (missing.length > 0) {
      toast.error('Please upload all required photos before checkout.');

      setExpandedUploads((previous) => {
        const updated = new Set(previous);

        missing.forEach((item) => updated.add(item.itemId));

        return updated;
      });

      return;
    }

    navigate('/checkout');
  };


  /* =====================================================
     AUTH LOADING
  ===================================================== */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">

        <div className="flex flex-col items-center gap-4">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00AEEF]/20 border-t-[#00AEEF]" />

          <p className="text-sm font-semibold text-slate-500">
            Loading your account...
          </p>

        </div>

      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }


  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="flex min-h-screen flex-col bg-white">

      <Seo
        title="Shopping Cart | Graphic Wala"
        description="Review your cart and checkout. Custom photo frames, PVC cards and personalized gifts from Graphic Wala."
        path="/cart"
        noindex
      />

      <Header />


      <main className="relative flex-1 overflow-hidden">

        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">

          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#00AEEF]/[0.05] blur-[100px]" />

          <div className="absolute -left-40 top-80 h-96 w-96 rounded-full bg-[#E6007E]/[0.04] blur-[100px]" />

        </div>


        <div className="container py-10 sm:py-14">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-9">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#00AEEF]/[0.08] px-4 py-2">

              <ShoppingBag className="h-4 w-4 text-[#00AEEF]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-700 sm:text-xs">
                Your Shopping Bag
              </span>

            </div>


            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
                  My Cart
                  <span className="text-[#00AEEF]">.</span>
                </h1>

                <p className="mt-3 text-sm text-slate-500 sm:text-base">
                  Review your items and get ready to place your order.
                </p>

              </div>


              {!loading && cartItems.length > 0 && (

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">

                  <Package className="h-4 w-4 text-[#00AEEF]" />

                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              LOADING STATE
          ================================================= */}

          {loading ? (

            <div className="grid gap-8 lg:grid-cols-3">

              <div className="space-y-4 lg:col-span-2">

                {[1, 2, 3].map((item) => (

                  <div
                    key={item}
                    className="animate-pulse rounded-2xl bg-slate-50 p-5"
                  >

                    <div className="flex gap-4">

                      <div className="h-24 w-24 rounded-xl bg-slate-200" />

                      <div className="flex-1 space-y-3">

                        <div className="h-4 w-2/3 rounded bg-slate-200" />

                        <div className="h-4 w-1/3 rounded bg-slate-200" />

                        <div className="h-8 w-28 rounded-lg bg-slate-200" />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />

            </div>


          ) : cartItems.length === 0 ? (


            /* =================================================
               EMPTY CART
            ================================================= */

            <div className="mx-auto max-w-xl py-12 text-center sm:py-20">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#00AEEF]/[0.08]">

                <ShoppingBag className="h-11 w-11 text-[#00AEEF]" />

              </div>


              <h2 className="mt-7 font-outfit text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Your Cart is Empty
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
                Looks like you haven't added anything yet. Explore our collection of customized gifts and printing products.
              </p>


              <Link to="/products">

                <Button
                  className="mt-7 h-12 rounded-xl bg-[#111111] px-7 font-bold text-white hover:bg-slate-800"
                >

                  Start Shopping

                  <ArrowRight className="ml-2 h-4 w-4" />

                </Button>

              </Link>

            </div>


          ) : (


            /* =================================================
               CART CONTENT
            ================================================= */

            <div className="grid items-start gap-8 lg:grid-cols-3">


              {/* =================================================
                  LEFT COLUMN — CART PRODUCTS
              ================================================= */}

              <div className="space-y-5 lg:col-span-2">


                {/* REQUIRED UPLOAD WARNING */}

                {missingUploads.length > 0 && (

                  <div className="rounded-2xl bg-[#FFED00]/[0.13] p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFED00]/40">

                        <AlertCircle className="h-5 w-5 text-[#111111]" />

                      </div>


                      <div className="min-w-0 flex-1">

                        <h3 className="font-outfit text-base font-bold text-slate-900">
                          Photo Upload Required
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Please upload the following required photos before proceeding to checkout.
                        </p>


                        <ul className="mt-3 space-y-2">

                          {missingUploads.map((item) => (

                            <li
                              key={item.itemId}
                              className="text-xs leading-5 text-slate-700"
                            >

                              <strong>{item.productName}:</strong>{' '}

                              {item.fields.join(', ')}

                            </li>

                          ))}

                        </ul>

                      </div>

                    </div>

                  </div>

                )}


                {/* CART SECTION HEADING */}

                <div className="flex items-center justify-between">

                  <h2 className="font-outfit text-xl font-bold text-slate-900">
                    Cart Items
                  </h2>

                  <span className="text-xs font-medium text-slate-500">
                    {cartItems.length} Products
                  </span>

                </div>


                {/* PRODUCT CARDS */}

                {cartItems.map((item) => {

                  const product = item.products as Product;

                  const uploadConfig = getUploadConfig(product);

                  const hasCustomization = uploadConfig.length > 0;

                  const designs = productDesigns[item.product_id] || {};

                  const requiredFields = uploadConfig.filter(
                    (field) => field.required
                  );

                  const allRequiredUploaded = requiredFields.every(
                    (field) => Boolean(designs[field.id])
                  );

                  const isExpanded = expandedUploads.has(item.id);

                  const effectivePrice = getEffectivePrice(product);

                  const originalPrice = Number(product?.price) || 0;

                  const productSlug = (product as any)?.slug || product?.id;


                  return (

                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_5px_25px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-5"
                    >


                      {/* PRODUCT INFORMATION */}

                      <div className="flex gap-4 sm:gap-5">


                        {/* IMAGE */}

                        <Link
                          to={`/product/${productSlug}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-32 sm:w-32"
                        >

                          {product?.image_url ? (

                            <SmartImage
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full bg-white object-contain p-2"
                              widths={[80, 160, 320]}
                              fallbackWidth={160}
                              quality={80}
                              resize="contain"
                              sizes="(max-width: 640px) 96px, 128px"
                              width={160}
                              height={160}
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center">

                              <ImageIcon className="h-8 w-8 text-slate-300" />

                            </div>

                          )}

                        </Link>


                        {/* PRODUCT DETAILS */}

                        <div className="min-w-0 flex-1">


                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <Link
                                to={`/product/${productSlug}`}
                                className="font-outfit text-base font-bold leading-snug text-slate-900 transition hover:text-[#00AEEF] sm:text-lg"
                              >
                                {product?.name || 'Product'}
                              </Link>


                              <div className="mt-2 flex flex-wrap items-center gap-2">

                                <span className="text-base font-extrabold text-[#00AEEF]">
                                  ₹{effectivePrice.toFixed(2)}
                                </span>


                                {effectivePrice < originalPrice && (

                                  <span className="text-xs font-medium text-slate-400 line-through">
                                    ₹{originalPrice.toFixed(2)}
                                  </span>

                                )}

                              </div>

                            </div>


                            {/* REMOVE */}

                            <button
                              type="button"
                              aria-label={`Remove ${product?.name || 'product'} from cart`}
                              onClick={() => handleRemoveProduct(item.id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >

                              <Trash2 className="h-4 w-4" />

                            </button>

                          </div>


                          {/* QUANTITY & UPLOAD ACTIONS */}

                          <div className="mt-4 flex flex-wrap items-center gap-3">


                            {/* QUANTITY */}

                            <div className="inline-flex h-9 items-center rounded-xl bg-slate-100 p-1">

                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                              >

                                <Minus className="h-3.5 w-3.5" />

                              </button>


                              <span className="w-8 text-center text-sm font-bold text-slate-900">
                                {item.quantity}
                              </span>


                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
                              >

                                <Plus className="h-3.5 w-3.5" />

                              </button>

                            </div>


                            {/* PHOTO UPLOAD */}

                            {hasCustomization && (

                              <button
                                type="button"
                                onClick={() => toggleUploadSection(item.id)}
                                className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                                  allRequiredUploaded
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-[#00AEEF]/[0.09] text-[#0095CC] hover:bg-[#00AEEF]/[0.15]'
                                }`}
                              >

                                {allRequiredUploaded ? (

                                  <CheckCircle2 className="h-4 w-4" />

                                ) : (

                                  <Upload className="h-4 w-4" />

                                )}

                                {allRequiredUploaded
                                  ? 'Photos Uploaded'
                                  : 'Upload Photos'}

                              </button>

                            )}

                          </div>

                        </div>

                      </div>


                      {/* UPLOAD SECTION */}

                      {hasCustomization && isExpanded && (

                        <div className="mt-5 rounded-xl bg-slate-50 p-4 sm:p-5">

                          <div className="mb-4 flex items-center gap-2">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00AEEF]/10">

                              <ImageIcon className="h-4 w-4 text-[#00AEEF]" />

                            </div>

                            <div>

                              <h3 className="text-sm font-bold text-slate-900">
                                Customize Your Product
                              </h3>

                              <p className="text-xs text-slate-500">
                                Upload the required photos and designs.
                              </p>

                            </div>

                          </div>


                          <DesignUpload
                            productId={item.product_id}
                            productName={product?.name || ''}
                            uploadConfig={uploadConfig}
                            onUploadComplete={(urls) =>
                              handleDesignUpload(item.product_id, urls)
                            }
                            existingDesigns={designs}
                            isCartMode={true}
                          />

                        </div>

                      )}


                    </div>

                  );

                })}


                {/* CONTINUE SHOPPING */}

                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 py-3 text-sm font-bold text-slate-600 transition hover:text-[#00AEEF]"
                >

                  <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />

                  Continue Shopping

                </Link>

              </div>


              {/* =================================================
                  RIGHT COLUMN — ORDER SUMMARY
              ================================================= */}

              <aside className="space-y-5 lg:sticky lg:top-24">


                {/* SUMMARY CARD */}

                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_35px_rgba(15,23,42,0.07)]">


                  {/* SUMMARY HEADER */}

                  <div className="bg-[#111111] px-5 py-5 sm:px-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">

                        <ShoppingBag className="h-5 w-5 text-white" />

                      </div>

                      <div>

                        <h2 className="font-outfit text-lg font-bold text-white">
                          Order Summary
                        </h2>

                        <p className="text-xs text-white/60">
                          Your order details
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* SUMMARY CONTENT */}

                  <div className="space-y-5 p-5 sm:p-6">


                    <PriceBreakdown
                      productTotal={cartTotal}
                      deliveryCharge={deliveryCharge}
                      showDetails={true}
                    />


                    {/* TOTAL */}

                    <div className="rounded-xl bg-[#00AEEF]/[0.07] p-4">

                      <div className="flex items-center justify-between gap-2">

                        <span className="text-sm font-semibold text-slate-700">
                          Total Payable
                        </span>

                        <span className="font-outfit text-2xl font-extrabold tracking-tight text-[#111111]">
                          ₹{totalPayable.toFixed(2)}
                        </span>

                      </div>

                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Including applicable delivery charges
                      </p>

                    </div>


                    {/* CHECKOUT BUTTON */}

                    <Button
                      className="group h-14 w-full rounded-xl bg-[#00AEEF] text-sm font-extrabold text-white shadow-lg shadow-[#00AEEF]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0095CC] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleProceedToCheckout}
                      disabled={!canCheckout}
                    >

                      <Zap className="mr-2 h-5 w-5" />

                      {canCheckout
                        ? 'Proceed to Checkout'
                        : 'Upload Photos First'}

                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

                    </Button>


                    {!canCheckout && (

                      <p className="text-center text-xs font-medium text-red-500">
                        Please upload all required photos before checkout.
                      </p>

                    )}


                    {/* TRUST INFORMATION */}

                    <div className="space-y-3 border-t border-slate-100 pt-5">

                      <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">

                        <ShieldCheck className="h-4 w-4 shrink-0 text-[#00AEEF]" />

                        Secure Order Processing

                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E6007E]" />

                        Quality Printing

                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">

                        <Package className="h-4 w-4 shrink-0 text-slate-900" />

                        All India Delivery

                      </div>

                    </div>


                  </div>

                </div>


                {/* DELIVERY INFORMATION */}

                <DeliveryInfoBanner variant="compact" />


                {/* PAYMENT INFORMATION */}

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">

                      <Sparkles className="h-4 w-4 text-[#E6007E]" />

                    </div>

                    <div>

                      <h3 className="text-xs font-bold text-slate-900">
                        Made With Creativity
                      </h3>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Your personalized products are prepared with care and attention to detail.
                      </p>

                    </div>

                  </div>

                </div>


              </aside>


            </div>

          )}

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default Cart;
