import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Clock, MessageCircle, Home } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_NUMBER } from "@/lib/types";

const InviteConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const { data } = await supabase
        .from("invite_orders")
        .select("id, video_title, whatsapp_number, customer_name, amount, expected_delivery_at, created_at")
        .eq("id", orderId)
        .maybeSingle();
      setOrder(data);
    })();
  }, [orderId]);

  useEffect(() => {
    if (!order?.expected_delivery_at) return;
    const target = new Date(order.expected_delivery_at).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft("Any moment now…"); return; }
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      setTimeLeft(`${h}h ${m}m remaining`);
    };
    tick();
    const i = setInterval(tick, 30000);
    return () => clearInterval(i);
  }, [order]);

  const wa = WHATSAPP_NUMBER.replace(/\D/g, "");
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(
    `Hi, I just placed a Video Invite order #${orderId?.slice(0, 8)}. Please confirm delivery.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Order Confirmed — Video Invitation | Graphic Wala</title>
      </Helmet>
      <Header />
      <main className="flex-1 container py-10 md:py-16">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl shadow-soft p-6 md:p-10 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you{order?.customer_name ? `, ${order.customer_name}` : ""}! Your payment has been received.
            </p>
          </div>

          {order && (
            <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Video</span>
                <span className="font-medium text-right">{order.video_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-primary">₹{Number(order.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery WhatsApp</span>
                <span className="font-medium">+91 {order.whatsapp_number}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-1">
              <Clock className="h-5 w-5" />
              <span>Delivery within 24 hours</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {timeLeft || "We'll send your personalised video to your WhatsApp."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="default">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" /> Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InviteConfirmation;