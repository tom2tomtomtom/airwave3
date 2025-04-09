// This file contains the SQL commands to create the database schema in Supabase
// It's meant to be executed in the Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branding_colors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'copy', 'voiceover')),
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_client_provided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  creatomate_id TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  dynamic_fields TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic motivations table
CREATE TABLE IF NOT EXISTS strategic_motivations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy variations table
CREATE TABLE IF NOT EXISTS copy_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  motivation_id UUID REFERENCES strategic_motivations(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tone TEXT,
  length TEXT CHECK (length IN ('short', 'medium', 'long')),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matrix configurations table
CREATE TABLE IF NOT EXISTS matrix_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  field_configurations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executions table
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  matrix_id UUID NOT NULL REFERENCES matrix_configurations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_client_id ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_templates_client_id ON templates(client_id);
CREATE INDEX IF NOT EXISTS idx_strategic_motivations_client_id ON strategic_motivations(client_id);
CREATE INDEX IF NOT EXISTS idx_copy_variations_client_id ON copy_variations(client_id);
CREATE INDEX IF NOT EXISTS idx_matrix_configurations_client_id ON matrix_configurations(client_id);
CREATE INDEX IF NOT EXISTS idx_executions_client_id ON executions(client_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clients" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their clients" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Asset policies
CREATE POLICY "Authenticated users can view assets" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert assets" ON assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assets" ON assets
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete assets" ON assets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
-- Templates
CREATE POLICY "Authenticated users can view templates" ON templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert templates" ON templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Strategic motivations
CREATE POLICY "Authenticated users can view motivations" ON strategic_motivations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert motivations" ON strategic_motivations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Copy variations
CREATE POLICY "Authenticated users can view copy variations" ON copy_variations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert copy variations" ON copy_variations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Matrix configurations
CREATE POLICY "Authenticated users can view matrix configurations" ON matrix_configurations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert matrix configurations" ON matrix_configurations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Executions
CREATE POLICY "Authenticated users can view executions" ON executions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert executions" ON executions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update executions" ON executions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO clients (name, branding_colors)
VALUES 
  ('Demo Client', ARRAY['#FF5733', '#33FF57', '#3357FF']),
  ('Test Brand', ARRAY['#F1C40F', '#3498DB', '#E74C3C']);
