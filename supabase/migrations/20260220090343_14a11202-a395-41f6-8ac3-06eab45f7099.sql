
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create audits table
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  url TEXT NOT NULL,
  overall_score INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  readability_level TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits" ON public.audits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audits" ON public.audits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audits" ON public.audits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audits" ON public.audits FOR DELETE USING (auth.uid() = user_id);

-- Create audit_findings table
CREATE TABLE public.audit_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SEO', 'Readability')),
  issue_description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view findings for own audits" ON public.audit_findings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid()));
CREATE POLICY "Users can insert findings for own audits" ON public.audit_findings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid()));
