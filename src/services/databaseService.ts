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
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  // Compatibility fields for existing code
  client_id?: string;
  content?: string;
  is_approved?: boolean;
}

export interface CopyVariation {
  id: string;
  motivation_id: string;
  copy_text: string;
  variation_number: number;
  created_at: string;
  metadata?: {
    is_approved?: boolean;
    approved_at?: string;
  };
  // Compatibility fields for existing code
  client_id?: string;
  content?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  is_approved?: boolean;
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
  
  // Public method to get the current user ID
  async getCurrentUserId(): Promise<string | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user?.id || null;
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
    try {
      // Using user_id since the content_motivations table doesn't have client_id
      const { data: userInfo } = await this.supabase.auth.getUser();
      const userId = userInfo.user?.id;
      
      if (!userId) {
        console.error('No user ID available for fetching motivations');
        return [] as StrategicMotivation[];
      }
      
      const { data, error } = await this.supabase
        .from('content_motivations')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching motivations:', error);
        return [] as StrategicMotivation[];
      }
      
      // Map the database fields to what the app expects
      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        // Add compatibility fields
        client_id: clientId,
        content: item.title, // Use title as content for display
        is_approved: true // Default to approved
      })) as StrategicMotivation[];
    } catch (err) {
      console.error('Exception fetching motivations:', err);
      return [] as StrategicMotivation[];
    }
  }

  async createMotivation(motivation: Omit<StrategicMotivation, 'id' | 'created_at'>) {
    try {
      // Get the current user
      const { data: userInfo } = await this.supabase.auth.getUser();
      const userId = userInfo.user?.id;
      
      if (!userId) {
        throw new Error('No user ID available for creating motivation');
      }
      
      // Map from the app's expected fields to the database schema
      const dbMotivation = {
        user_id: userId,
        title: motivation.content || motivation.title || 'Untitled Motivation',
        description: motivation.description || motivation.content || 'No description'
      };
      
      console.log('Creating motivation:', dbMotivation);
      
      const { data, error } = await this.supabase
        .from('content_motivations')
        .insert(dbMotivation)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating motivation:', error);
        throw error;
      }
      
      // Map the response back to what the app expects
      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        created_at: data.created_at,
        // Add compatibility fields
        client_id: motivation.client_id,
        content: data.title,
        is_approved: motivation.is_approved
      } as StrategicMotivation;
    } catch (err) {
      console.error('Exception creating motivation:', err);
      throw err;
    }
  }

  // Copy variation methods
  async getCopyVariationsByClientId(clientId: string) {
    try {
      // In the new schema, we don't have client_id on the copy table,
      // so instead we'll need to get all copy variations associated with motivations
      // that the user has access to
      
      // First, get all motivation IDs for this user
      const { data: userInfo } = await this.supabase.auth.getUser();
      const userId = userInfo.user?.id;
      
      if (!userId) {
        console.error('No user ID available for fetching copy variations');
        return [] as CopyVariation[];
      }
      
      // Get all motivations for this user
      const { data: motivations, error: motivationsError } = await this.supabase
        .from('content_motivations')
        .select('id')
        .eq('user_id', userId);
      
      if (motivationsError) {
        console.error('Error fetching motivations for copy:', motivationsError);
        return [] as CopyVariation[];
      }
      
      if (!motivations || motivations.length === 0) {
        return [] as CopyVariation[];
      }
      
      // Get all copy variations for these motivations
      const motivationIds = motivations.map(m => m.id);
      
      const { data, error } = await this.supabase
        .from('content_copy')
        .select('*')
        .in('motivation_id', motivationIds);
      
      if (error) {
        console.error('Error fetching copy variations:', error);
        return [] as CopyVariation[];
      }
      
      // Map to the expected format
      return data.map(item => ({
        id: item.id,
        motivation_id: item.motivation_id,
        copy_text: item.copy_text,
        variation_number: item.variation_number,
        created_at: item.created_at,
        metadata: item.metadata || { is_approved: false },
        // Add compatibility fields
        client_id: clientId,
        content: item.copy_text,
        tone: 'neutral', // Default value
        length: 'medium', // Default value
        is_approved: item.metadata?.is_approved || false
      })) as CopyVariation[];
    } catch (err) {
      console.error('Exception fetching copy variations:', err);
      return [] as CopyVariation[];
    }
  }

  async createCopyVariation(copyVariation: Omit<CopyVariation, 'id' | 'created_at'>) {
    try {
      console.log('Creating copy variation:', copyVariation);
      
      // Map from the app's expected fields to the database schema
      const dbCopyVariation = {
        motivation_id: copyVariation.motivation_id,
        copy_text: copyVariation.content || copyVariation.copy_text || '', 
        variation_number: copyVariation.variation_number || 1 // Default value if not provided
      };
      
      // Try to get the next variation number for this motivation
      const { data: existingVariations, error: countError } = await this.supabase
        .from('content_copy')
        .select('variation_number')
        .eq('motivation_id', copyVariation.motivation_id)
        .order('variation_number', { ascending: false })
        .limit(1);
        
      if (!countError && existingVariations && existingVariations.length > 0) {
        dbCopyVariation.variation_number = (existingVariations[0].variation_number || 0) + 1;
      }
      
      console.log('Database copy variation:', dbCopyVariation);
      
      const { data, error } = await this.supabase
        .from('content_copy')
        .insert(dbCopyVariation)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating copy variation:', error);
        throw error;
      }
      
      // Map the response back to what the app expects
      return {
        id: data.id,
        motivation_id: data.motivation_id,
        copy_text: data.copy_text,
        variation_number: data.variation_number,
        created_at: data.created_at,
        metadata: data.metadata || { is_approved: false },
        // Add compatibility fields
        client_id: copyVariation.client_id,
        content: data.copy_text,
        tone: copyVariation.tone,
        length: copyVariation.length,
        is_approved: copyVariation.is_approved || data.metadata?.is_approved || false
      } as CopyVariation;
    } catch (err) {
      console.error('Exception creating copy variation:', err);
      throw err;
    }
  }

  // Matrix configuration methods
  async approveCopyVariation(copyId: string) {
    try {
      console.log('Approving copy variation:', copyId);
      
      // First get the current copy variation to get its metadata
      const { data: copyVariation, error: fetchError } = await this.supabase
        .from('content_copy')
        .select('*')
        .eq('id', copyId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching copy variation for approval:', fetchError);
        throw fetchError;
      }
      
      // Prepare the metadata object with approval info
      const metadata = {
        ...copyVariation.metadata,
        is_approved: true,
        approved_at: new Date().toISOString()
      };
      
      // Update the copy variation with the approval metadata
      const { data, error } = await this.supabase
        .from('content_copy')
        .update({ metadata })
        .eq('id', copyId)
        .select()
        .single();
      
      if (error) {
        console.error('Error approving copy variation:', error);
        throw error;
      }
      
      // Map the response back to what the app expects
      return {
        id: data.id,
        motivation_id: data.motivation_id,
        copy_text: data.copy_text,
        variation_number: data.variation_number,
        created_at: data.created_at,
        metadata: data.metadata,
        // Add compatibility fields
        client_id: '',  // Not relevant for approval
        content: data.copy_text,
        tone: '',  // Not relevant for approval
        length: 'medium',  // Not relevant for approval
        is_approved: data.metadata?.is_approved || false
      } as CopyVariation;
    } catch (err) {
      console.error('Exception approving copy variation:', err);
      throw err;
    }
  }
  
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
