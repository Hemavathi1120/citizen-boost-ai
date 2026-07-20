
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'citizen');
CREATE TYPE public.doc_type AS ENUM ('aadhaar','pan','income_certificate','caste_certificate','ration_card','domicile','bank_passbook','disability_certificate','birth_certificate','marksheet','photo','other');
CREATE TYPE public.doc_status AS ENUM ('pending','processing','verified','failed');
CREATE TYPE public.app_status AS ENUM ('draft','prepared','submitted','under_review','approved','rejected');
CREATE TYPE public.scheme_level AS ENUM ('central','state');

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  state TEXT,
  city TEXT,
  pincode TEXT,
  category TEXT,
  annual_income NUMERIC,
  occupation TEXT,
  education TEXT,
  marital_status TEXT,
  disability_status BOOLEAN DEFAULT false,
  aadhaar_last4 TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  eligibility_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END; $$;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Family
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  occupation TEXT,
  annual_income NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own family" ON public.family_members FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_family_updated BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  doc_type doc_type NOT NULL DEFAULT 'other',
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  ocr_text TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  ai_confidence NUMERIC DEFAULT 0,
  status doc_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own documents" ON public.documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Schemes (public catalog)
CREATE TABLE public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  category TEXT NOT NULL,
  level scheme_level NOT NULL DEFAULT 'central',
  state TEXT,
  ministry TEXT,
  benefits TEXT,
  eligibility_criteria JSONB DEFAULT '{}'::jsonb,
  required_documents TEXT[] DEFAULT '{}',
  application_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO authenticated, anon;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schemes readable by all" ON public.schemes FOR SELECT USING (true);

-- Saved schemes
CREATE TABLE public.saved_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.schemes ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scheme_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_schemes TO authenticated;
GRANT ALL ON public.saved_schemes TO service_role;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved" ON public.saved_schemes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.schemes ON DELETE CASCADE,
  status app_status NOT NULL DEFAULT 'draft',
  progress INT NOT NULL DEFAULT 0,
  form_data JSONB DEFAULT '{}'::jsonb,
  ai_prepared_summary TEXT,
  submitted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifs" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat" ON public.chat_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage policies for documents bucket
CREATE POLICY "read own docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "upload own docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "update own docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "delete own docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed schemes (20 real Indian schemes)
INSERT INTO public.schemes (slug, name, short_description, description, category, level, ministry, benefits, eligibility_criteria, required_documents, application_url, tags) VALUES
('pm-kisan','PM Kisan Samman Nidhi','₹6,000 per year to eligible farmer families','Direct income support of ₹6,000/year to small and marginal farmer families paid in three equal installments.','Agriculture','central','Ministry of Agriculture','₹6,000/year in 3 installments','{"occupation":["farmer"],"land_ownership":true}','{aadhaar,bank_passbook,land_records}','https://pmkisan.gov.in','{farmer,income-support,DBT}'),
('ayushman-bharat','Ayushman Bharat PM-JAY','Health cover of ₹5 lakh per family per year','World''s largest health insurance scheme providing cashless secondary and tertiary care hospitalization up to ₹5 lakh per family per year.','Health','central','Ministry of Health & Family Welfare','₹5,00,000 per family per year cashless treatment','{"annual_income_max":180000,"category":["SC","ST","OBC","General"]}','{aadhaar,ration_card,income_certificate}','https://pmjay.gov.in','{health,insurance,hospitalization}'),
('pmay-g','Pradhan Mantri Awas Yojana (Gramin)','Pucca house for rural homeless','Financial assistance for construction of pucca houses in rural areas for houseless and those living in kutcha houses.','Housing','central','Ministry of Rural Development','₹1.2L (plain)/₹1.3L (hilly) construction assistance','{"annual_income_max":300000,"rural":true}','{aadhaar,ration_card,bank_passbook,income_certificate}','https://pmayg.nic.in','{housing,rural}'),
('pmay-u','Pradhan Mantri Awas Yojana (Urban)','Affordable housing in urban areas','Interest subsidy on home loans and affordable housing for urban poor.','Housing','central','Ministry of Housing & Urban Affairs','Interest subsidy up to ₹2.67 lakh','{"annual_income_max":1800000,"urban":true}','{aadhaar,income_certificate,bank_passbook}','https://pmaymis.gov.in','{housing,urban,subsidy}'),
('ujjwala','Pradhan Mantri Ujjwala Yojana','Free LPG connection for women','Free LPG connections to women from BPL households to reduce indoor air pollution.','Energy','central','Ministry of Petroleum','Free LPG connection + first refill','{"gender":"female","bpl":true}','{aadhaar,ration_card,bank_passbook}','https://pmuy.gov.in','{women,LPG,BPL}'),
('pmjdy','Pradhan Mantri Jan Dhan Yojana','Zero balance bank account with ₹2L accident cover','Financial inclusion through zero-balance bank accounts, RuPay debit card, accident insurance, and overdraft facility.','Financial Inclusion','central','Ministry of Finance','Zero balance account, ₹2L accident insurance, ₹10K overdraft','{}','{aadhaar}','https://pmjdy.gov.in','{banking,insurance}'),
('pmsby','Pradhan Mantri Suraksha Bima Yojana','₹2 lakh accident insurance for ₹20/year','Accidental death and disability insurance for people aged 18-70 with a bank account.','Insurance','central','Ministry of Finance','₹2L accident cover for ₹20/year','{"age_min":18,"age_max":70}','{aadhaar,bank_passbook}','https://jansuraksha.gov.in','{insurance,low-cost}'),
('pmjjby','Pradhan Mantri Jeevan Jyoti Bima Yojana','₹2 lakh life insurance for ₹436/year','Life insurance cover of ₹2 lakh for people aged 18-50 with a bank account.','Insurance','central','Ministry of Finance','₹2L life cover for ₹436/year','{"age_min":18,"age_max":50}','{aadhaar,bank_passbook}','https://jansuraksha.gov.in','{life-insurance}'),
('atal-pension','Atal Pension Yojana','Guaranteed pension of ₹1,000-₹5,000/month','Government-backed pension scheme for unorganized sector workers aged 18-40.','Pension','central','Ministry of Finance','Monthly pension ₹1K–₹5K after 60','{"age_min":18,"age_max":40}','{aadhaar,bank_passbook}','https://npscra.nsdl.co.in','{pension,retirement}'),
('sukanya','Sukanya Samriddhi Yojana','Small savings scheme for girl child','High-interest small savings account for the girl child up to age 10.','Savings','central','Ministry of Finance','~8% p.a. tax-free, EEE','{"beneficiary":"girl_child","age_max":10}','{aadhaar,birth_certificate}','https://www.india.gov.in/sukanya','{girl-child,savings}'),
('scholarship-sc','Post-Matric Scholarship for SC Students','Scholarship for SC students in post-matric education','Financial assistance for SC students pursuing post-matriculation education.','Education','central','Ministry of Social Justice','Tuition + maintenance allowance','{"category":["SC"],"education":"post_matric","annual_income_max":250000}','{aadhaar,caste_certificate,income_certificate,marksheet}','https://scholarships.gov.in','{education,SC,scholarship}'),
('scholarship-obc','Post-Matric Scholarship for OBC','Scholarship for OBC students','Financial assistance for OBC students in post-matric education.','Education','central','Ministry of Social Justice','Tuition + maintenance allowance','{"category":["OBC"],"annual_income_max":150000}','{aadhaar,caste_certificate,income_certificate,marksheet}','https://scholarships.gov.in','{education,OBC}'),
('mudra','Pradhan Mantri MUDRA Yojana','Micro-loans up to ₹10 lakh for small businesses','Collateral-free loans to non-corporate, non-farm small/micro enterprises.','Business','central','Ministry of Finance','Loans up to ₹10L (Shishu/Kishore/Tarun)','{"occupation":["entrepreneur","self_employed"]}','{aadhaar,pan,bank_passbook}','https://www.mudra.org.in','{business,loan,MSME}'),
('standup-india','Stand-Up India','Bank loans ₹10L–₹1Cr for SC/ST/women entrepreneurs','Bank loans for greenfield enterprises by SC/ST and women entrepreneurs.','Business','central','Ministry of Finance','Loan ₹10L–₹1Cr','{"category":["SC","ST"],"gender":"female"}','{aadhaar,pan,bank_passbook,caste_certificate}','https://www.standupmitra.in','{business,women,SC,ST}'),
('nsap-igns','Indira Gandhi National Old Age Pension','Monthly pension for BPL elderly','Monthly pension to BPL persons aged 60+.','Pension','central','Ministry of Rural Development','₹200–₹500/month','{"age_min":60,"bpl":true}','{aadhaar,bpl_card,bank_passbook}','https://nsap.nic.in','{pension,elderly,BPL}'),
('nsap-igwps','Indira Gandhi National Widow Pension','Monthly pension for BPL widows','Monthly pension for BPL widows aged 40-79.','Pension','central','Ministry of Rural Development','₹300/month','{"age_min":40,"age_max":79,"marital_status":"widow","bpl":true}','{aadhaar,bpl_card,bank_passbook}','https://nsap.nic.in','{widow,pension}'),
('nsap-igdps','Indira Gandhi National Disability Pension','Monthly pension for BPL persons with disability','Monthly pension for BPL persons with severe disability (80%+) aged 18-79.','Pension','central','Ministry of Rural Development','₹300/month','{"age_min":18,"age_max":79,"disability":true,"bpl":true}','{aadhaar,disability_certificate,bpl_card,bank_passbook}','https://nsap.nic.in','{disability,pension}'),
('e-shram','e-Shram Card','National database + ₹2L accident cover for unorganized workers','Registration for unorganized workers providing social security benefits.','Labour','central','Ministry of Labour','₹2L accident insurance + welfare benefits','{"age_min":16,"age_max":59,"occupation":["unorganized_worker"]}','{aadhaar,bank_passbook}','https://eshram.gov.in','{labour,unorganized}'),
('nrega','MGNREGA','100 days guaranteed rural employment','Guarantees 100 days of wage employment per year to rural households.','Employment','central','Ministry of Rural Development','100 days wage employment/year','{"rural":true}','{aadhaar,ration_card,bank_passbook}','https://nrega.nic.in','{employment,rural,MGNREGA}'),
('skill-india','Pradhan Mantri Kaushal Vikas Yojana','Free skill training with certification','Free short-term skill training for youth with certification and placement assistance.','Skill','central','Ministry of Skill Development','Free training + certification','{"age_min":15,"age_max":45}','{aadhaar}','https://www.pmkvyofficial.org','{skill,training,youth}');
