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
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useTemplate } from '../context/TemplateContext';

interface ImportTemplateDialogProps {
  open: boolean;
  onClose: () => void;
}

const ImportTemplateDialog: React.FC<ImportTemplateDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creatomateId, setCreatomateId] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);
  const [newField, setNewField] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { importTemplate } = useTemplate();

  const handleAddField = () => {
    if (newField.trim() && !dynamicFields.includes(newField.trim())) {
      setDynamicFields([...dynamicFields, newField.trim()]);
      setNewField('');
    }
  };

  const handleRemoveField = (field: string) => {
    setDynamicFields(dynamicFields.filter(f => f !== field));
  };

  const handleAspectRatioChange = (event: SelectChangeEvent) => {
    setAspectRatio(event.target.value);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!creatomateId.trim()) {
      setError('Creatomate Template ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await importTemplate(
        name.trim(),
        description.trim(),
        creatomateId.trim(),
        aspectRatio,
        dynamicFields
      );
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setCreatomateId('');
      setAspectRatio('16:9');
      setDynamicFields([]);
    } catch (err: any) {
      setError(err.message || 'Failed to import template');
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Template from Creatomate</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Import a template from Creatomate by providing the template ID and configuration details.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <Box>
            <TextField
              autoFocus
              label="Template Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </Box>
          
          <Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </Box>
          
          <Box>
            <TextField
              label="Creatomate Template ID"
              fullWidth
              value={creatomateId}
              onChange={(e) => setCreatomateId(e.target.value)}
              disabled={loading}
              required
              helperText="The ID of the template from your Creatomate account"
            />
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="aspect-ratio-label">Aspect Ratio</InputLabel>
              <Select
                labelId="aspect-ratio-label"
                value={aspectRatio}
                label="Aspect Ratio"
                onChange={handleAspectRatioChange}
              >
                <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
                <MenuItem value="9:16">9:16 (Portrait)</MenuItem>
                <MenuItem value="1:1">1:1 (Square)</MenuItem>
                <MenuItem value="4:5">4:5 (Instagram)</MenuItem>
                <MenuItem value="2.39:1">2.39:1 (Cinematic)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Dynamic Fields
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Add the dynamic fields that can be modified in this template
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Field Name"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                disabled={loading}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddField}
                disabled={loading || !newField.trim()}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dynamicFields.map((field) => (
                <Chip
                  key={field}
                  label={field}
                  onDelete={() => handleRemoveField(field)}
                  disabled={loading}
                />
              ))}
              {dynamicFields.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No dynamic fields added yet
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !name.trim() || !creatomateId.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Import Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportTemplateDialog;
