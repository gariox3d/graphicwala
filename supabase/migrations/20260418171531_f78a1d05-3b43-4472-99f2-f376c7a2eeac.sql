
-- Bills table for saving admin-generated invoices/estimates
CREATE TABLE public.admin_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_type TEXT NOT NULL DEFAULT 'invoice',
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  amount_due NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bills"
ON public.admin_bills
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_admin_bills_updated_at
BEFORE UPDATE ON public.admin_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_admin_bills_created_at ON public.admin_bills(created_at DESC);
CREATE INDEX idx_admin_bills_payment_status ON public.admin_bills(payment_status);
CREATE INDEX idx_admin_bills_customer_phone ON public.admin_bills(customer_phone);
