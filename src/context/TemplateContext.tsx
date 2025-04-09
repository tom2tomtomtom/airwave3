import React, { createContext, useContext, useState, useEffect } from 'react';
import { Template, databaseService } from '../services/databaseService';
import { useClient } from './ClientContext';

interface TemplateContextType {
  templates: Template[];
  loading: boolean;
  error: string | null;
  importTemplate: (name: string, description: string, creatomateId: string, aspectRatio: string, dynamicFields: string[]) => Promise<Template>;
  fetchTemplates: () => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedClient } = useClient();

  const fetchTemplates = async () => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      setError(null);
      const templateData = await databaseService.getTemplatesByClientId(selectedClient.id);
      setTemplates(templateData);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const importTemplate = async (
    name: string, 
    description: string, 
    creatomateId: string, 
    aspectRatio: string, 
    dynamicFields: string[]
  ): Promise<Template> => {
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create template record in database
      const newTemplate = await databaseService.createTemplate({
        client_id: selectedClient.id,
        name,
        description,
        creatomate_id: creatomateId,
        aspect_ratio: aspectRatio,
        dynamic_fields: dynamicFields
      });
      
      // Update local state
      setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
      
      return newTemplate;
    } catch (err: any) {
      console.error('Error importing template:', err);
      setError(`Failed to import template: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete from database (this would be implemented in databaseService)
      // For now, we'll just update the local state
      setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateId));
      
    } catch (err: any) {
      console.error('Error deleting template:', err);
      setError(`Failed to delete template: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates when selected client changes
  useEffect(() => {
    if (selectedClient) {
      fetchTemplates();
    } else {
      setTemplates([]);
    }
  }, [selectedClient]);

  const value = {
    templates,
    loading,
    error,
    importTemplate,
    fetchTemplates,
    deleteTemplate
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};
