import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, databaseService } from '../services/databaseService';

interface ClientContextType {
  selectedClient: Client | null;
  clients: Client[];
  loading: boolean;
  error: string | null;
  selectClient: (clientId: string) => void;
  createClient: (name: string, brandingColors: string[]) => Promise<Client>;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients on mount and set selected client from localStorage if available
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const clientData = await databaseService.getClients();
        setClients(clientData);
        
        // Check for saved client selection in localStorage
        const savedClientId = localStorage.getItem('selectedClientId');
        if (savedClientId && clientData.length > 0) {
          const savedClient = clientData.find(client => client.id === savedClientId);
          if (savedClient) {
            setSelectedClient(savedClient);
          } else if (clientData.length > 0) {
            // If saved client not found, select the first available client
            setSelectedClient(clientData[0]);
            localStorage.setItem('selectedClientId', clientData[0].id);
          }
        } else if (clientData.length > 0) {
          // If no saved selection and clients exist, select the first one
          setSelectedClient(clientData[0]);
          localStorage.setItem('selectedClientId', clientData[0].id);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const selectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      localStorage.setItem('selectedClientId', clientId);
    }
  };

  const createClient = async (name: string, brandingColors: string[]): Promise<Client> => {
    try {
      const newClient = await databaseService.createClient({
        name,
        branding_colors: brandingColors
      });
      
      // Update clients list
      setClients(prevClients => [...prevClients, newClient]);
      
      // If this is the first client, select it automatically
      if (clients.length === 0) {
        setSelectedClient(newClient);
        localStorage.setItem('selectedClientId', newClient.id);
      }
      
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      throw new Error('Failed to create client. Please try again.');
    }
  };

  const refreshClients = async () => {
    try {
      setLoading(true);
      const clientData = await databaseService.getClients();
      setClients(clientData);
      
      // If selected client exists, update it with fresh data
      if (selectedClient) {
        const updatedSelectedClient = clientData.find(client => client.id === selectedClient.id);
        if (updatedSelectedClient) {
          setSelectedClient(updatedSelectedClient);
        }
      }
    } catch (err) {
      console.error('Error refreshing clients:', err);
      setError('Failed to refresh clients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedClient,
    clients,
    loading,
    error,
    selectClient,
    createClient,
    refreshClients
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
