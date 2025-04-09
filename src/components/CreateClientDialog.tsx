import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { useClient } from '../context/ClientContext';

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateClientDialog: React.FC<CreateClientDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [brandingColors, setBrandingColors] = useState<string[]>(['#FF5733', '#33FF57', '#3357FF']);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createClient } = useClient();

  const handleColorChange = (color: any) => {
    const newColors = [...brandingColors];
    newColors[currentColorIndex] = color.hex;
    setBrandingColors(newColors);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createClient(name.trim(), brandingColors);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Client</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          label="Client Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="subtitle1" gutterBottom>
          Branding Colors
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {brandingColors.map((color, index) => (
            <Box key={index}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: color,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: currentColorIndex === index ? '3px solid #000' : '1px solid #ddd'
                }}
                onClick={() => setCurrentColorIndex(index)}
              />
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ChromePicker
            color={brandingColors[currentColorIndex]}
            onChange={handleColorChange}
            disableAlpha
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateClientDialog;
