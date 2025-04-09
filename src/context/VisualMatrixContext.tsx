import React, { createContext, useContext, useState } from 'react';
import { useClient } from './ClientContext';
import { useTemplate } from './TemplateContext';
import { useContentGeneration } from './ContentGenerationContext';
import { databaseService, VisualMatrix, VisualMatrixItem } from '../services/databaseService';

interface VisualMatrixContextType {
  matrices: VisualMatrix[];
  currentMatrix: VisualMatrix | null;
  matrixItems: VisualMatrixItem[];
  loading: boolean;
  error: string | null;
  createMatrix: (name: string, description: string) => Promise<VisualMatrix>;
  fetchMatrices: () => Promise<void>;
  setCurrentMatrix: (matrixId: string | null) => Promise<void>;
  addMatrixItem: (
    platformId: string, 
    formatId: string, 
    templateId: string, 
    copyId: string, 
    assetIds: string[]
  ) => Promise<VisualMatrixItem>;
  updateMatrixItem: (
    itemId: string,
    updates: Partial<Omit<VisualMatrixItem, 'id' | 'matrix_id' | 'client_id'>>
  ) => Promise<void>;
  removeMatrixItem: (itemId: string) => Promise<void>;
}

const VisualMatrixContext = createContext<VisualMatrixContextType | undefined>(undefined);

export const VisualMatrixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matrices, setMatrices] = useState<VisualMatrix[]>([]);
  const [currentMatrix, setCurrentMatrixState] = useState<VisualMatrix | null>(null);
  const [matrixItems, setMatrixItems] = useState<VisualMatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedClient } = useClient();
  const { templates } = useTemplate();
  const { copyVariations } = useContentGeneration();

  const fetchMatrices = async () => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedMatrices = await databaseService.getMatricesByClientId(selectedClient.id);
      setMatrices(fetchedMatrices);
    } catch (err: any) {
      console.error('Error fetching matrices:', err);
      setError('Failed to load visual matrices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createMatrix = async (name: string, description: string): Promise<VisualMatrix> => {
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const newMatrix = await databaseService.createMatrix({
        client_id: selectedClient.id,
        name,
        description
      });
      
      setMatrices(prevMatrices => [...prevMatrices, newMatrix]);
      
      return newMatrix;
    } catch (err: any) {
      console.error('Error creating matrix:', err);
      setError(`Failed to create matrix: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setCurrentMatrix = async (matrixId: string | null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!matrixId) {
        setCurrentMatrixState(null);
        setMatrixItems([]);
        return;
      }
      
      const matrix = matrices.find(m => m.id === matrixId);
      if (!matrix) {
        throw new Error('Matrix not found');
      }
      
      setCurrentMatrixState(matrix);
      
      // Fetch matrix items
      if (selectedClient) {
        const items = await databaseService.getMatrixItemsByMatrixId(matrixId);
        setMatrixItems(items);
      }
    } catch (err: any) {
      console.error('Error setting current matrix:', err);
      setError(`Failed to load matrix: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addMatrixItem = async (
    platformId: string, 
    formatId: string, 
    templateId: string, 
    copyId: string, 
    assetIds: string[]
  ): Promise<VisualMatrixItem> => {
    if (!selectedClient || !currentMatrix) {
      throw new Error('No client or matrix selected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const newItem = await databaseService.createMatrixItem({
        matrix_id: currentMatrix.id,
        client_id: selectedClient.id,
        platform_id: platformId,
        format_id: formatId,
        template_id: templateId,
        copy_id: copyId,
        asset_ids: assetIds,
        status: 'draft'
      });
      
      setMatrixItems(prevItems => [...prevItems, newItem]);
      
      return newItem;
    } catch (err: any) {
      console.error('Error adding matrix item:', err);
      setError(`Failed to add matrix item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMatrixItem = async (
    itemId: string,
    updates: Partial<Omit<VisualMatrixItem, 'id' | 'matrix_id' | 'client_id'>>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would update the database
      // For the prototype, we'll just update the local state
      setMatrixItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, ...updates } 
            : item
        )
      );
    } catch (err: any) {
      console.error('Error updating matrix item:', err);
      setError(`Failed to update matrix item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeMatrixItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would delete from the database
      // For the prototype, we'll just update the local state
      setMatrixItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      console.error('Error removing matrix item:', err);
      setError(`Failed to remove matrix item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    matrices,
    currentMatrix,
    matrixItems,
    loading,
    error,
    createMatrix,
    fetchMatrices,
    setCurrentMatrix,
    addMatrixItem,
    updateMatrixItem,
    removeMatrixItem
  };

  return <VisualMatrixContext.Provider value={value}>{children}</VisualMatrixContext.Provider>;
};

export const useVisualMatrix = () => {
  const context = useContext(VisualMatrixContext);
  if (context === undefined) {
    throw new Error('useVisualMatrix must be used within a VisualMatrixProvider');
  }
  return context;
};
