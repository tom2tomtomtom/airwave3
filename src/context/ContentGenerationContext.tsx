import React, { createContext, useContext, useState } from 'react';
import { useClient } from './ClientContext';
import { databaseService, StrategicMotivation, CopyVariation } from '../services/databaseService';

interface ContentGenerationContextType {
  strategicMotivations: StrategicMotivation[];
  copyVariations: CopyVariation[];
  loadingMotivations: boolean;
  loadingCopy: boolean;
  errorMotivations: string | null;
  errorCopy: string | null;
  generateStrategicMotivations: (clientBrief: string) => Promise<StrategicMotivation[]>;
  generateCopyVariations: (motivationId: string, tone: string, length: CopyVariation['length'], count: number, includeCta: boolean) => Promise<CopyVariation[]>;
  fetchStrategicMotivations: () => Promise<void>;
  fetchCopyVariations: () => Promise<void>;
  approveMotivation: (motivationId: string) => Promise<void>;
  approveCopyVariation: (copyId: string) => Promise<void>;
}

const ContentGenerationContext = createContext<ContentGenerationContextType | undefined>(undefined);

export const ContentGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [strategicMotivations, setStrategicMotivations] = useState<StrategicMotivation[]>([]);
  const [copyVariations, setCopyVariations] = useState<CopyVariation[]>([]);
  const [loadingMotivations, setLoadingMotivations] = useState(false);
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [errorMotivations, setErrorMotivations] = useState<string | null>(null);
  const [errorCopy, setErrorCopy] = useState<string | null>(null);
  
  const { selectedClient } = useClient();

  // Mock OpenAI API call for strategic motivations
  const generateStrategicMotivations = async (clientBrief: string): Promise<StrategicMotivation[]> => {
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    try {
      setLoadingMotivations(true);
      setErrorMotivations(null);
      
      // In a real implementation, this would call the OpenAI API
      // For the prototype, we'll generate mock motivations
      const mockMotivations = [
        "Empower customers to achieve their goals with our innovative solutions",
        "Simplify complex processes to save time and reduce stress",
        "Build trust through transparency and consistent quality",
        "Create memorable experiences that customers want to share",
        "Demonstrate expertise while remaining accessible and approachable",
        "Highlight the unique value proposition that sets us apart from competitors"
      ];
      
      const createdMotivations: StrategicMotivation[] = [];
      
      // Create motivation records in database
      for (const motivationText of mockMotivations) {
        // Use the public method to get user ID instead of accessing private supabase property
        const userId = await databaseService.getCurrentUserId();
        if (!userId) {
          throw new Error('No user ID available');
        }
        
        const motivation = await databaseService.createMotivation({
          user_id: userId,
          title: motivationText,
          description: motivationText,
          client_id: selectedClient.id, // For compatibility
          content: motivationText, // For compatibility
          is_approved: false // For compatibility
        });
        
        createdMotivations.push(motivation);
      }
      
      // Update local state
      setStrategicMotivations(prevMotivations => [...prevMotivations, ...createdMotivations]);
      
      return createdMotivations;
    } catch (err: any) {
      console.error('Error generating strategic motivations:', err);
      setErrorMotivations(`Failed to generate strategic motivations: ${err.message}`);
      throw err;
    } finally {
      setLoadingMotivations(false);
    }
  };

  // Mock OpenAI API call for copy variations
  const generateCopyVariations = async (
    motivationId: string, 
    tone: string, 
    length: CopyVariation['length'], 
    count: number,
    includeCta: boolean
  ): Promise<CopyVariation[]> => {
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    try {
      setLoadingCopy(true);
      setErrorCopy(null);
      
      // Find the motivation to use its content
      const motivation = strategicMotivations.find(m => m.id === motivationId);
      if (!motivation) {
        throw new Error('Motivation not found');
      }
      
      // In a real implementation, this would call the OpenAI API
      // For the prototype, we'll generate mock copy variations
      const mockCopyVariations: string[] = [];
      
      // Generate different copy based on length
      const lengthMap = {
        short: "brief and concise",
        medium: "balanced and informative",
        long: "detailed and comprehensive"
      };
      
      // Generate different copy based on tone
      const toneDescriptions: Record<string, string> = {
        Professional: "formal and business-like",
        Friendly: "warm and approachable",
        Enthusiastic: "excited and energetic",
        Authoritative: "confident and commanding",
        Humorous: "light-hearted and funny"
      };
      
      const toneDescription = toneDescriptions[tone as keyof typeof toneDescriptions] || "conversational";
      const lengthDescription = lengthMap[length as keyof typeof lengthMap] || 'medium length';
      
      for (let i = 0; i < count; i++) {
        let copy = `${motivation.content} with a ${toneDescription} tone. This copy is ${lengthDescription}.`;
        
        // Add CTA if requested
        if (includeCta) {
          copy += " Call now to learn more about our exclusive offers!";
        }
        
        mockCopyVariations.push(copy);
      }
      
      const createdCopyVariations: CopyVariation[] = [];
      
      // Create copy variation records in database
      for (const content of mockCopyVariations) {
        const copyVariation = await databaseService.createCopyVariation({
          // Required fields for the new interface
          motivation_id: motivationId,
          copy_text: content,
          variation_number: i + 1,
          // Compatibility fields
          client_id: selectedClient.id,
          content,
          tone,
          length,
          is_approved: false
        });
        
        createdCopyVariations.push(copyVariation);
      }
      
      // Update local state
      setCopyVariations(prevCopyVariations => [...prevCopyVariations, ...createdCopyVariations]);
      
      return createdCopyVariations;
    } catch (err: any) {
      console.error('Error generating copy variations:', err);
      setErrorCopy(`Failed to generate copy variations: ${err.message}`);
      throw err;
    } finally {
      setLoadingCopy(false);
    }
  };

  const fetchStrategicMotivations = async () => {
    if (!selectedClient) return;
    
    try {
      setLoadingMotivations(true);
      setErrorMotivations(null);
      const motivations = await databaseService.getMotivationsByClientId(selectedClient.id);
      setStrategicMotivations(motivations);
    } catch (err: any) {
      console.error('Error fetching strategic motivations:', err);
      setErrorMotivations('Failed to load strategic motivations. Please try again later.');
    } finally {
      setLoadingMotivations(false);
    }
  };

  const fetchCopyVariations = async () => {
    if (!selectedClient) return;
    
    try {
      setLoadingCopy(true);
      setErrorCopy(null);
      const copyVars = await databaseService.getCopyVariationsByClientId(selectedClient.id);
      setCopyVariations(copyVars);
    } catch (err: any) {
      console.error('Error fetching copy variations:', err);
      setErrorCopy('Failed to load copy variations. Please try again later.');
    } finally {
      setLoadingCopy(false);
    }
  };

  const approveMotivation = async (motivationId: string) => {
    try {
      // In a real implementation, this would update the database
      // For the prototype, we'll just update the local state
      setStrategicMotivations(prevMotivations => 
        prevMotivations.map(motivation => 
          motivation.id === motivationId 
            ? { ...motivation, is_approved: true } 
            : motivation
        )
      );
    } catch (err: any) {
      console.error('Error approving motivation:', err);
      setErrorMotivations(`Failed to approve motivation: ${err.message}`);
    }
  };

  const approveCopyVariation = async (copyId: string) => {
    try {
      // Use the database service method to update the approval status
      const approvedCopy = await databaseService.approveCopyVariation(copyId);
      
      // Update the local state with the updated copy
      setCopyVariations(prevCopyVariations => 
        prevCopyVariations.map(copy => 
          copy.id === copyId 
            ? { ...copy, is_approved: approvedCopy.is_approved } 
            : copy
        )
      );
    } catch (err: any) {
      console.error('Error approving copy variation:', err);
      setErrorCopy(`Failed to approve copy variation: ${err.message}`);
    }
  };

  const value = {
    strategicMotivations,
    copyVariations,
    loadingMotivations,
    loadingCopy,
    errorMotivations,
    errorCopy,
    generateStrategicMotivations,
    generateCopyVariations,
    fetchStrategicMotivations,
    fetchCopyVariations,
    approveMotivation,
    approveCopyVariation
  };

  return <ContentGenerationContext.Provider value={value}>{children}</ContentGenerationContext.Provider>;
};

export const useContentGeneration = () => {
  const context = useContext(ContentGenerationContext);
  if (context === undefined) {
    throw new Error('useContentGeneration must be used within a ContentGenerationProvider');
  }
  return context;
};
