import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';

// Types for Supabase tables
export interface Client {
  id: string;
  name: string;
  branding_colors: string[];
  created_at: string;
}

export interface VisualMatrix {
  id: string;
  client_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Asset {
  id: string;
  client_id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'copy' | 'voiceover';
  url: string;
  tags: string[];
  metadata: Record<string, any>;
  is_client_provided: boolean;
  created_at: string;
}

export interface Template {
  id: string;
  client_id: string;
  name: string;
  description: string;
  creatomate_id: string;
  aspect_ratio: string;
  dynamic_fields: string[];
  created_at: string;
}

export interface StrategicMotivation {
  id: string;
  client_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface CopyVariation {
  id: string;
  client_id: string;
  motivation_id: string;
  content: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  is_approved: boolean;
  created_at: string;
}

export interface MatrixConfiguration {
  id: string;
  client_id: string;
  template_id: string;
  field_configurations: Record<string, string[]>;
  created_at: string;
}

export interface VisualMatrixItem {
  id: string;
  matrix_id: string;
  client_id: string;
  platform_id: string;
  format_id: string;
  template_id: string;
  copy_id: string;
  asset_ids: string[];
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  created_at: string;
}

export interface Execution {
  id: string;
  client_id: string;
  matrix_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_url: string;
  created_at: string;
}

// Database service
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Client methods
  async getClients() {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    return data as Client[];
  }

  async getClientById(id: string) {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Client;
  }

  async createClient(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  }

  // Asset methods
  async getAssetsByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as Asset[];
  }

  async createAsset(asset: Omit<Asset, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();
    
    if (error) throw error;
    return data as Asset;
  }

  // Template methods
  async getTemplatesByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as Template[];
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data as Template;
  }

  // Strategic motivation methods
  async getMotivationsByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('strategic_motivations')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as StrategicMotivation[];
  }

  async createMotivation(motivation: Omit<StrategicMotivation, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('strategic_motivations')
      .insert(motivation)
      .select()
      .single();
    
    if (error) throw error;
    return data as StrategicMotivation;
  }

  // Copy variation methods
  async getCopyVariationsByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('copy_variations')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as CopyVariation[];
  }

  async createCopyVariation(copyVariation: Omit<CopyVariation, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('copy_variations')
      .insert(copyVariation)
      .select()
      .single();
    
    if (error) throw error;
    return data as CopyVariation;
  }

  // Matrix configuration methods
  async getMatrixConfigurationsByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('matrix_configurations')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as MatrixConfiguration[];
  }

  async createMatrixConfiguration(matrixConfig: Omit<MatrixConfiguration, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('matrix_configurations')
      .insert(matrixConfig)
      .select()
      .single();
    
    if (error) throw error;
    return data as MatrixConfiguration;
  }
  
  // Visual Matrix methods
  async getMatricesByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('visual_matrices')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as VisualMatrix[];
  }

  async createMatrix(matrix: Omit<VisualMatrix, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('visual_matrices')
      .insert(matrix)
      .select()
      .single();
    
    if (error) throw error;
    return data as VisualMatrix;
  }

  async getMatrixItemsByMatrixId(matrixId: string) {
    const { data, error } = await this.supabase
      .from('visual_matrix_items')
      .select('*')
      .eq('matrix_id', matrixId);
    
    if (error) throw error;
    return data as VisualMatrixItem[];
  }

  async createMatrixItem(item: Omit<VisualMatrixItem, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('visual_matrix_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data as VisualMatrixItem;
  }

  // Execution methods
  async getExecutionsByClientId(clientId: string) {
    const { data, error } = await this.supabase
      .from('executions')
      .select('*')
      .eq('client_id', clientId);
    
    if (error) throw error;
    return data as Execution[];
  }

  async createExecution(execution: Omit<Execution, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('executions')
      .insert(execution)
      .select()
      .single();
    
    if (error) throw error;
    return data as Execution;
  }

  async updateExecutionStatus(id: string, status: Execution['status'], outputUrl?: string) {
    const updates: Partial<Execution> = { status };
    if (outputUrl) updates.output_url = outputUrl;

    const { data, error } = await this.supabase
      .from('executions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Execution;
  }
}

export const databaseService = new DatabaseService();
