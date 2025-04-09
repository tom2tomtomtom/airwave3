-- Database schema for AIrWAVE platform

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branding_colors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
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
CREATE TABLE templates (
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
CREATE TABLE strategic_motivations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy variations table
CREATE TABLE copy_variations (
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
CREATE TABLE matrix_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  field_configurations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executions table
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  matrix_id UUID NOT NULL REFERENCES matrix_configurations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_assets_client_id ON assets(client_id);
CREATE INDEX idx_templates_client_id ON templates(client_id);
CREATE INDEX idx_strategic_motivations_client_id ON strategic_motivations(client_id);
CREATE INDEX idx_copy_variations_client_id ON copy_variations(client_id);
CREATE INDEX idx_matrix_configurations_client_id ON matrix_configurations(client_id);
CREATE INDEX idx_executions_client_id ON executions(client_id);

-- Create RLS policies for security
-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_motivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

-- Create policies (to be customized based on actual auth requirements)
-- Example policy for clients table
CREATE POLICY "Users can view their clients" ON clients
  FOR SELECT USING (true);

-- Example policy for assets table
CREATE POLICY "Users can view assets for their clients" ON assets
  FOR SELECT USING (true);
