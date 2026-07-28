-- Catalog: master categories + full product catalog (seeded from the former hardcoded arrays)
CREATE TABLE public.master_categories (
  name text PRIMARY KEY,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_categories TO authenticated;
GRANT ALL ON public.master_categories TO service_role;
ALTER TABLE public.master_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.master_categories FOR SELECT TO anon, authenticated USING (visible = true);
CREATE POLICY "categories admin read all" ON public.master_categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "categories admin insert" ON public.master_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "categories admin update" ON public.master_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "categories admin delete" ON public.master_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.master_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  master_category text NOT NULL REFERENCES public.master_categories(name) ON UPDATE CASCADE,
  description text NOT NULL,
  url text NOT NULL DEFAULT '#',
  icon_name text NOT NULL,
  status text NOT NULL DEFAULT 'COMING_SOON' CHECK (status IN ('ACTIVE','COMING_SOON')),
  features text[] NOT NULL DEFAULT '{}',
  frontend text[] NOT NULL DEFAULT '{}',
  backend text[] NOT NULL DEFAULT '{}',
  color text NOT NULL DEFAULT 'from-slate-600 to-slate-800',
  price text NOT NULL,
  discount_price text NOT NULL,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_master_category_idx ON public.products (master_category, position);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (visible = true);
CREATE POLICY "products admin read all" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin update" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin delete" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.master_categories (name, position, visible) VALUES
('Education', 10, true),
('Retail & POS', 20, true),
('Healthcare', 30, true),
('Logistics', 40, true),
('Real Estate', 50, true),
('Finance', 60, true),
('Accounting', 70, true),
('Sales & CRM', 80, true),
('Marketing', 90, true),
('HR & Payroll', 100, true),
('ERP', 110, true),
('Enterprise Resource Planning (ERP)', 120, true),
('Inventory, Warehouse & Supply Chain', 130, true),
('E-commerce & Online Marketplaces', 140, true),
('Hospitality (Hotel, Restaurant, Travel)', 150, true),
('Telecom, Call Center & VoIP', 160, true),
('Customer Support & Helpdesk', 170, true),
('Legal, Compliance & Documentation', 180, true),
('Government & e-Governance Systems', 190, true),
('Security, Surveillance & Access Control', 200, true),
('Cyber Security & Data Protection', 210, true),
('Insurance', 220, true),
('Telecom', 230, true),
('Warehouse', 240, true),
('Rental', 250, true),
('Automobile', 260, true),
('Religious', 270, true),
('Public Utilities', 280, true),
('Defense', 290, true),
('Enterprise Admin', 300, true),
('Veterinary', 310, true),
('Food Manufacturing', 320, true),
('Media & Design', 330, true),
('Travel', 340, true),
('Academy', 350, true),
('Productivity', 360, true),
('AI & Automation', 370, true),
('Event', 380, true),
('Construction', 390, true),
('Agriculture', 400, true),
('Manufacturing', 410, true),
('Beauty & Wellness', 420, true),
('Fitness & Sports', 430, true),
('Non-Profit & NGO', 440, true),
('Franchise Management', 450, true),
('Recruitment & Staffing', 460, true),
('Photography & Studio', 470, true),
('Consulting & Advisory', 480, true),
('Publishing & Print', 490, true),
('Fashion & Apparel', 500, true),
('IoT & Smart Devices', 510, true),
('Cloud & DevOps', 520, true),
('Blockchain & Web3', 530, true),
('Gaming & E-Sports', 540, true),
('Podcast & Streaming Media', 550, true),
('Solar & Green Energy', 560, true),
('Waste & Recycling', 570, true);