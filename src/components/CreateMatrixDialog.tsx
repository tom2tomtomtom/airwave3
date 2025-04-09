import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useVisualMatrix } from '../context/VisualMatrixContext';

interface CreateMatrixDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateMatrixDialog: React.FC<CreateMatrixDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createMatrix } = useVisualMatrix();

  const handleCreateMatrix = async () => {
    if (!name.trim()) {
      setError('Matrix name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createMatrix(name.trim(), description.trim());
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create matrix');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Visual Matrix</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Create a new visual matrix to organize content across platforms and formats.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <Box>
            <TextField
              autoFocus
              label="Matrix Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              required
              margin="normal"
            />
          </Box>
          
          <Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              margin="normal"
              placeholder="Describe the purpose of this visual matrix..."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={creating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateMatrix} 
          variant="contained" 
          disabled={creating || !name.trim()}
          startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {creating ? 'Creating...' : 'Create Matrix'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMatrixDialog;
