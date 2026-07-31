ALTER TABLE public.master_categories
  ADD COLUMN IF NOT EXISTS icon_name text NOT NULL DEFAULT 'Package',
  ADD COLUMN IF NOT EXISTS gradient text NOT NULL DEFAULT 'from-cyan-500 to-blue-600',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT true;

UPDATE public.master_categories SET icon_name = v.icon, gradient = v.grad
FROM (VALUES
  ('Education','GraduationCap','from-blue-500 to-indigo-600'),
  ('Healthcare','Stethoscope','from-pink-500 to-rose-600'),
  ('Retail & POS','ShoppingBag','from-amber-500 to-orange-600'),
  ('Real Estate','Home','from-amber-500 to-yellow-600'),
  ('Automotive','Car','from-red-500 to-orange-600'),
  ('Finance','CreditCard','from-emerald-500 to-teal-600'),
  ('Accounting','Wallet','from-lime-500 to-green-600'),
  ('Marketing','Megaphone','from-rose-500 to-red-600'),
  ('Sales & CRM','Users','from-violet-500 to-purple-600'),
  ('HR & Payroll','Briefcase','from-indigo-500 to-blue-600'),
  ('Logistics','Truck','from-cyan-500 to-teal-600'),
  ('Manufacturing','Factory','from-blue-500 to-cyan-600'),
  ('Legal','Scale','from-yellow-600 to-amber-700'),
  ('Security','Shield','from-red-600 to-rose-700'),
  ('AI & Automation','Bot','from-fuchsia-500 to-purple-600'),
  ('Cloud & DevOps','Cloud','from-sky-500 to-cyan-600'),
  ('Productivity','Zap','from-teal-500 to-emerald-600'),
  ('E-commerce & Online Marketplaces','ShoppingCart','from-orange-500 to-red-500'),
  ('Real Estate & Construction','Building','from-amber-600 to-orange-700')
) AS v(name, icon, grad)
WHERE public.master_categories.name = v.name;