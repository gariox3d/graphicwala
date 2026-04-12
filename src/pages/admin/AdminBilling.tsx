import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Download, FileText, Eye, MessageCircle, IndianRupee, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
}

const SHOP_INFO = {
  name: 'Graphic Wala',
  tagline: 'Premium Printing & Design Studio',
  address: 'Nasirganj, Katihar, Bihar - 854105',
  phone: '+91 6207142994',
  email: 'graphicwalaktr@gmail.com',
  website: 'graphicwala.com',
  gst: '',
};

const generateBillNumber = () => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `GW-${y}${m}${d}-${r}`;
};
interface ProductOption {
  id: string;
  name: string;
  price: number;
}
const ProductSearchInput = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ProductOption[];
  onChange: (name: string, price?: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder="Product / service naam likho..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-10"
      />
      {open && search.length > 0 && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex justify-between"
              onMouseDown={() => {
                onChange(p.name, p.price);
                setSearch(p.name);
                setOpen(false);
              }}
            >
              <span>{p.name}</span>
              <span className="text-muted-foreground">₹{p.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminBilling = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [billNumber] = useState(generateBillNumber);
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [billType, setBillType] = useState<'estimate' | 'invoice'>('invoice');
  const [pageSize, setPageSize] = useState<'a4' | 'a4-half'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');
  const [amountPaid, setAmountPaid] = useState(0);

  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Products from DB
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, sale_price')
        .order('name');
      if (error) {
        toast.error('Products load nahi hue, page refresh karke try karein');
        return;
      }

      if (data) {
        setProductOptions(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.sale_price ? Number(p.sale_price) : Number(p.price),
        })));
      }
    };
    fetchProducts();
  }, []);

  // Items
  const [items, setItems] = useState<BillItem[]>([
    { id: crypto.randomUUID(), name: '', quantity: 1, rate: 0 },
  ]);

  // Extras
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(prevItems => prevItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const discountAmount = discount;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const formattedDate = new Date(billDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleDownloadPDF = useCallback(() => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (items.every(i => !i.name.trim())) {
      toast.error('Please add at least one item');
      return;
    }
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 300);
  }, [customerName, items]);

  const handleWhatsAppShare = useCallback(() => {
    if (!customerPhone.trim()) {
      toast.error('Customer ka phone number daalna zaroori hai WhatsApp share ke liye');
      return;
    }
    const validItems = items.filter(i => i.name.trim());
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const itemLines = validItems.map((item, idx) =>
      `${idx + 1}. ${item.name} × ${item.quantity} = ₹${(item.quantity * item.rate).toLocaleString('en-IN')}`
    ).join('\n');

    const billTypeLabel = billType === 'invoice' ? 'Invoice' : 'Estimate';

    let message = `🧾 *${SHOP_INFO.name} — ${billTypeLabel}*\n`;
    message += `📋 Bill No: ${billNumber}\n`;
    message += `📅 Date: ${formattedDate}\n\n`;
    message += `👤 *Customer:* ${customerName}\n`;
    if (customerAddress.trim()) message += `📍 ${customerAddress}\n`;
    message += `\n━━━━━━━━━━━━━━━━\n`;
    message += `📦 *Items:*\n${itemLines}\n`;
    message += `━━━━━━━━━━━━━━━━\n`;
    message += `💰 Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (discountAmount > 0) message += `🎁 Discount: -₹${discountAmount.toLocaleString('en-IN')}\n`;
    message += `\n🏷️ *Grand Total: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
    if (paymentStatus === 'paid') message += `✅ *Status: PAID*\n`;
    else if (paymentStatus === 'partial') {
      message += `⏳ *Paid: ₹${amountPaid.toLocaleString('en-IN')}*\n`;
      message += `💸 *Due: ₹${(grandTotal - amountPaid).toLocaleString('en-IN')}*\n`;
    } else {
      message += `❌ *Status: UNPAID — ₹${grandTotal.toLocaleString('en-IN')} Due*\n`;
    }
    if (notes.trim()) message += `\n📝 ${notes}\n`;
    message += `\n🌐 ${SHOP_INFO.website}\n📞 ${SHOP_INFO.phone}`;

    const phone = normalizeIndianPhoneForWhatsApp(customerPhone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp pe bill share ho raha hai!');
  }, [customerName, customerPhone, customerAddress, items, billNumber, billType, formattedDate, subtotal, discountAmount, grandTotal, notes, paymentStatus, amountPaid]);

  if (authLoading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse">Loading...</div></div></AdminLayout>;
  }
  if (!isAdmin) return null;


  return (
    <>
      {/* Editable Form - hidden when printing */}
      <div className="print:hidden">
        <AdminLayout>
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Bill / Estimate Generator
              </h1>
              <p className="text-muted-foreground">Create professional bills and download as PDF</p>
            </div>

            {/* Bill Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Bill Number</Label>
                  <Input value={billNumber} readOnly className="font-mono bg-muted" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={billType} onValueChange={(v: 'estimate' | 'invoice') => setBillType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Invoice / Bill</SelectItem>
                      <SelectItem value="estimate">Estimate / Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input placeholder="Customer ka naam" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="Phone number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea placeholder="House/Shop No, Street, Locality, City, State - PIN" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={paymentStatus} onValueChange={(v: 'unpaid' | 'partial' | 'paid') => setPaymentStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">❌ Unpaid</SelectItem>
                      <SelectItem value="partial">⏳ Partial Paid</SelectItem>
                      <SelectItem value="paid">✅ Fully Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentStatus === 'partial' && (
                  <div>
                    <Label>Amount Paid (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={amountPaid || ''}
                      onChange={e => setAmountPaid(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      placeholder="Kitna diya hai"
                    />
                  </div>
                )}
                <div className="flex items-end">
                  {paymentStatus === 'paid' && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1.5">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Fully Paid
                    </Badge>
                  )}
                  {paymentStatus === 'partial' && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1.5">
                      <Clock className="h-4 w-4 mr-1" /> Partial — ₹{(grandTotal - amountPaid).toLocaleString('en-IN')} Due
                    </Badge>
                  )}
                  {paymentStatus === 'unpaid' && (
                    <Badge className="bg-red-100 text-red-800 border-red-300 text-sm px-3 py-1.5">
                      <AlertCircle className="h-4 w-4 mr-1" /> Unpaid — ₹{grandTotal.toLocaleString('en-IN')} Due
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-1 text-center text-sm font-medium text-muted-foreground pt-6">
                      {idx + 1}
                    </div>
                    <div className="col-span-5">
                      {idx === 0 && <Label className="text-xs">Product / Service</Label>}
                      <ProductSearchInput
                        value={item.name}
                        options={productOptions}
                        onChange={(name, price) => {
                          updateItem(item.id, 'name', name);
                          if (price !== undefined) updateItem(item.id, 'rate', price);
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Qty</Label>}
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity || ''}
                        onChange={e => updateItem(item.id, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label className="text-xs">Rate (₹)</Label>}
                      <Input
                        type="number"
                        min={0}
                        value={item.rate || ''}
                        onChange={e => updateItem(item.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 text-right font-semibold text-sm pt-1">
                      {idx === 0 && <Label className="text-xs block">&nbsp;</Label>}
                      ₹{(item.quantity * item.rate).toLocaleString()}
                    </div>
                    <div className="col-span-1">
                      {idx === 0 && <Label className="text-xs block">&nbsp;</Label>}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>

                {/* Totals */}
                <div className="border-t pt-4 mt-4 space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span>Discount (₹)</span>
                    <Input
                      type="number"
                      min={0}
                      value={discount || ''}
                      onChange={e => setDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      className="w-24 h-8 text-right"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes & Actions */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Notes / Terms</Label>
                  <Textarea
                    placeholder="Any additional notes, terms, or conditions..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={pageSize} onValueChange={(v: 'a4' | 'a4-half') => setPageSize(v)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 Full Page</SelectItem>
                      <SelectItem value="a4-half">A4 Half Page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orientation} onValueChange={(v: 'portrait' | 'landscape') => setOrientation(v)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button onClick={handleDownloadPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handleWhatsAppShare}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inline Preview */}
            {showPreview && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Bill Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-white p-4 overflow-auto">
                    <div className="mx-auto" style={{ maxWidth: pageSize === 'a4' ? '210mm' : '210mm' }}>
                      <BillTemplate
                        billNumber={billNumber}
                        billDate={formattedDate}
                        billType={billType}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        customerAddress={customerAddress}
                        items={items.filter(i => i.name.trim())}
                        subtotal={subtotal}
                        discount={discountAmount}
                        grandTotal={grandTotal}
                        notes={notes}
                        pageSize={pageSize}
                        paymentStatus={paymentStatus}
                        amountPaid={amountPaid}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </AdminLayout>
      </div>

      {/* Print-only bill */}
      <div className="hidden print:block" ref={printRef}>
        <style>{`
          @media print {
            @page {
              size: A4 ${orientation};
              margin: ${pageSize === 'a4' ? '12mm 15mm' : '8mm 15mm'};
            }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
        <BillTemplate
          billNumber={billNumber}
          billDate={formattedDate}
          billType={billType}
          customerName={customerName}
          customerPhone={customerPhone}
          customerAddress={customerAddress}
          items={items.filter(i => i.name.trim())}
          subtotal={subtotal}
          discount={discountAmount}
          grandTotal={grandTotal}
          notes={notes}
          pageSize={pageSize}
          paymentStatus={paymentStatus}
          amountPaid={amountPaid}
        />
      </div>
    </>
  );
};

/* ─── Bill Template ──────────────────────────────────────────── */

interface BillTemplateProps {
  billNumber: string;
  billDate: string;
  billType: 'estimate' | 'invoice';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  notes: string;
  pageSize: 'a4' | 'a4-half';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
}

const BillTemplate = ({
  billNumber, billDate, billType, customerName, customerPhone, customerAddress,
  items, subtotal, discount, grandTotal, notes, pageSize, paymentStatus, amountPaid,
}: BillTemplateProps) => {
  const isHalf = pageSize === 'a4-half';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: '#111827',
        fontSize: isHalf ? '11px' : '13px',
        lineHeight: 1.5,
        maxWidth: '210mm',
        minHeight: isHalf ? '148mm' : undefined,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #E11D48',
        paddingBottom: isHalf ? '8px' : '14px',
        marginBottom: isHalf ? '10px' : '18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/images/logo-circle.png"
            alt="Graphic Wala"
            style={{ width: isHalf ? '40px' : '56px', height: isHalf ? '40px' : '56px', borderRadius: '50%' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <h1 style={{
              fontSize: isHalf ? '20px' : '28px',
              fontWeight: 800,
              color: '#E11D48',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              {SHOP_INFO.name}
            </h1>
            <p style={{ fontSize: isHalf ? '9px' : '11px', color: '#6B7280', margin: 0 }}>
              {SHOP_INFO.tagline}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: isHalf ? '9px' : '11px', color: '#6B7280' }}>
          <p style={{ margin: '0 0 1px 0' }}>{SHOP_INFO.address}</p>
          <p style={{ margin: '0 0 1px 0' }}>📞 {SHOP_INFO.phone}</p>
          <p style={{ margin: '0 0 1px 0' }}>✉️ {SHOP_INFO.email}</p>
          <p style={{ margin: 0, fontWeight: 600, color: '#E11D48' }}>🌐 {SHOP_INFO.website}</p>
        </div>
      </div>

      {/* Bill Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: isHalf ? '10px' : '16px',
      }}>
        <h2 style={{
          fontSize: isHalf ? '16px' : '22px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#111827',
          margin: 0,
          background: '#FEF2F2',
          display: 'inline-block',
          padding: isHalf ? '4px 20px' : '6px 28px',
          borderRadius: '6px',
          border: '1px solid #FECACA',
        }}>
          {billType === 'estimate' ? '📋 Estimate' : '🧾 Invoice'}
        </h2>
      </div>

      {/* Bill Info + Customer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: isHalf ? '10px' : '16px',
        gap: '20px',
      }}>
        <div style={{
          flex: 1,
          background: '#F9FAFB',
          padding: isHalf ? '8px 12px' : '12px 16px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}>
          <p style={{ margin: '0 0 2px 0', fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Bill To</p>
          <p style={{ margin: '0 0 2px 0', fontWeight: 700, fontSize: isHalf ? '14px' : '16px' }}>{customerName || '—'}</p>
          {customerPhone && <p style={{ margin: '0 0 2px 0', color: '#6B7280' }}>📞 {customerPhone}</p>}
          {customerAddress && <p style={{ margin: 0, color: '#6B7280' }}>{customerAddress}</p>}
        </div>
        <div style={{
          background: '#F9FAFB',
          padding: isHalf ? '8px 12px' : '12px 16px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          textAlign: 'right',
          minWidth: '160px',
        }}>
          <p style={{ margin: '0 0 4px 0' }}>
            <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {billType === 'estimate' ? 'Estimate No.' : 'Invoice No.'}
            </span>
            <br />
            <span style={{ fontWeight: 700, fontFamily: "'Courier New', monospace", color: '#E11D48' }}>{billNumber}</span>
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
            <br />
            <span style={{ fontWeight: 600 }}>{billDate}</span>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: isHalf ? '10px' : '16px',
      }}>
        <thead>
          <tr style={{ background: '#E11D48', color: '#FFFFFF' }}>
            <th style={{ padding: isHalf ? '6px 8px' : '10px 12px', textAlign: 'left', borderRadius: '6px 0 0 0', fontWeight: 600, width: '40px' }}>#</th>
            <th style={{ padding: isHalf ? '6px 8px' : '10px 12px', textAlign: 'left', fontWeight: 600 }}>Item / Description</th>
            <th style={{ padding: isHalf ? '6px 8px' : '10px 12px', textAlign: 'center', fontWeight: 600, width: '60px' }}>Qty</th>
            <th style={{ padding: isHalf ? '6px 8px' : '10px 12px', textAlign: 'right', fontWeight: 600, width: '100px' }}>Rate</th>
            <th style={{ padding: isHalf ? '6px 8px' : '10px 12px', textAlign: 'right', borderRadius: '0 6px 0 0', fontWeight: 600, width: '110px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB', background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
              <td style={{ padding: isHalf ? '5px 8px' : '8px 12px', color: '#9CA3AF' }}>{idx + 1}</td>
              <td style={{ padding: isHalf ? '5px 8px' : '8px 12px', fontWeight: 500 }}>{item.name}</td>
              <td style={{ padding: isHalf ? '5px 8px' : '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: isHalf ? '5px 8px' : '8px 12px', textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td style={{ padding: isHalf ? '5px 8px' : '8px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(item.quantity * item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isHalf ? '10px' : '16px' }}>
        <div style={{
          width: '240px',
          background: '#F9FAFB',
          borderRadius: '8px',
          padding: isHalf ? '8px 12px' : '12px 16px',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#6B7280' }}>Subtotal</span>
            <span style={{ fontWeight: 500 }}>{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#10B981' }}>
              <span>Discount</span>
              <span>- {fmt(discount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #E11D48',
            paddingTop: '6px',
            marginTop: '4px',
            fontSize: isHalf ? '14px' : '18px',
            fontWeight: 700,
          }}>
            <span>Grand Total</span>
            <span style={{ color: '#E11D48' }}>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Status Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: isHalf ? '8px' : '14px',
      }}>
        <div style={{
          padding: isHalf ? '6px 16px' : '8px 24px',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: isHalf ? '12px' : '14px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          ...(paymentStatus === 'paid'
            ? { background: '#D1FAE5', color: '#065F46', border: '2px solid #6EE7B7' }
            : paymentStatus === 'partial'
            ? { background: '#FEF3C7', color: '#92400E', border: '2px solid #FCD34D' }
            : { background: '#FEE2E2', color: '#991B1B', border: '2px solid #FCA5A5' }
          ),
        }}>
          {paymentStatus === 'paid' && '✅ PAID'}
          {paymentStatus === 'partial' && `⏳ PARTIAL — Paid: ${fmt(amountPaid)} | Due: ${fmt(grandTotal - amountPaid)}`}
          {paymentStatus === 'unpaid' && `❌ UNPAID — Due: ${fmt(grandTotal)}`}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '6px',
          padding: isHalf ? '6px 10px' : '10px 14px',
          marginBottom: isHalf ? '8px' : '14px',
          fontSize: isHalf ? '10px' : '11px',
          color: '#92400E',
        }}>
          <strong>Note:</strong> {notes}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #E5E7EB',
        paddingTop: isHalf ? '8px' : '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div style={{ fontSize: isHalf ? '9px' : '10px', color: '#9CA3AF' }}>
          <p style={{ margin: '0 0 2px 0' }}>This is a computer generated {billType === 'estimate' ? 'estimate' : 'invoice'}.</p>
          <p style={{ margin: 0 }}>Thank you for your business! 🙏</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            borderTop: '1px solid #111827',
            paddingTop: '4px',
            minWidth: '140px',
            textAlign: 'center',
            fontSize: isHalf ? '10px' : '12px',
            fontWeight: 600,
          }}>
            Authorized Signature
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
