import React, { createContext, useContext, useState } from 'react';
import { Asset, databaseService } from '../services/databaseService';
import { useClient } from './ClientContext';
import { supabase } from '../config/supabaseClient';

interface AssetContextType {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  uploadAsset: (file: File, type: Asset['type'], tags: string[], isClientProvided: boolean) => Promise<Asset>;
  fetchAssets: () => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  updateAssetTags: (assetId: string, tags: string[]) => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedClient } = useClient();

  const fetchAssets = async () => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      setError(null);
      const assetData = await databaseService.getAssetsByClientId(selectedClient.id);
      setAssets(assetData);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (file: File, type: Asset['type'], tags: string[] = [], isClientProvided: boolean = false): Promise<Asset> => {
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${selectedClient.id}/${type}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);
      
      // Create asset record in database
      const newAsset = await databaseService.createAsset({
        client_id: selectedClient.id,
        name: file.name,
        type,
        url: publicUrl,
        tags,
        metadata: {
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        is_client_provided: isClientProvided
      });
      
      // Update local state
      setAssets(prevAssets => [...prevAssets, newAsset]);
      
      return newAsset;
    } catch (err: any) {
      console.error('Error uploading asset:', err);
      setError(`Failed to upload asset: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the asset to get its URL
      const asset = assets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      // Extract the path from the URL
      const url = new URL(asset.url);
      const pathParts = url.pathname.split('/');
      const storagePath = pathParts.slice(pathParts.indexOf('assets') + 1).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('assets')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway to delete the database record
      }
      
      // Delete from database (this would be implemented in databaseService)
      // For now, we'll just update the local state
      setAssets(prevAssets => prevAssets.filter(a => a.id !== assetId));
      
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      setError(`Failed to delete asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateAssetTags = async (assetId: string, tags: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update in database (this would be implemented in databaseService)
      // For now, we'll just update the local state
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === assetId 
            ? { ...asset, tags } 
            : asset
        )
      );
      
    } catch (err: any) {
      console.error('Error updating asset tags:', err);
      setError(`Failed to update asset tags: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    assets,
    loading,
    error,
    uploadAsset,
    fetchAssets,
    deleteAsset,
    updateAssetTags
  };

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
};
