import React from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  SelectChangeEvent,
  Button,
  Chip
} from '@mui/material';
import { useClient } from '../context/ClientContext';

const ClientSelector: React.FC = () => {
  const { selectedClient, clients, selectClient, loading } = useClient();

  const handleChange = (event: SelectChangeEvent<string>) => {
    selectClient(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">Loading clients...</Typography>
      </Box>
    );
  }

  if (clients.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">No clients available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel id="client-select-label">Active Client</InputLabel>
        <Select
          labelId="client-select-label"
          id="client-select"
          value={selectedClient?.id || ''}
          label="Active Client"
          onChange={handleChange}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedClient && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedClient.branding_colors.map((color, index) => (
            <Box 
              key={index}
              sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: color, 
                borderRadius: '50%',
                border: '1px solid #ddd'
              }} 
            />
          ))}
          <Chip 
            label={selectedClient.name} 
            size="small" 
            sx={{ bgcolor: selectedClient.branding_colors[0], color: '#fff' }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ClientSelector;
