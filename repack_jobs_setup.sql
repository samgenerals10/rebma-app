-- Run this in your Supabase SQL Editor to create the repack_jobs table

CREATE TABLE IF NOT EXISTS public.repack_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_number TEXT NOT NULL UNIQUE,
    source_product TEXT NOT NULL,
    target_pack TEXT NOT NULL,
    input_qty NUMERIC NOT NULL,
    output_qty NUMERIC,
    output_qty_expected NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending_finance',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.repack_jobs ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Allow all for authenticated users in this enterprise context)
CREATE POLICY "Enable read access for all authenticated users" ON public.repack_jobs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all authenticated users" ON public.repack_jobs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users" ON public.repack_jobs
    FOR UPDATE TO authenticated USING (true);
