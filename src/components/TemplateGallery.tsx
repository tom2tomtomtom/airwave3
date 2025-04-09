import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  AspectRatio as AspectRatioIcon
} from '@mui/icons-material';
import { useTemplate } from '../context/TemplateContext';
import { Template } from '../services/databaseService';

const TemplateGallery: React.FC = () => {
  const { templates, loading, error, fetchTemplates, deleteTemplate } = useTemplate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDeleteClick = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template);
    setDetailsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    
    await deleteTemplate(selectedTemplate.id);
    setDeleteDialogOpen(false);
    await fetchTemplates();
  };

  const getAspectRatioColor = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '16:9': return '#4caf50'; // green
      case '9:16': return '#2196f3'; // blue
      case '1:1': return '#ff9800'; // orange
      case '4:5': return '#e91e63'; // pink
      case '2.39:1': return '#9c27b0'; // purple
      default: return '#757575'; // grey
    }
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : templates.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1">
            No templates found. Import templates from Creatomate to get started.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {templates.map((template) => (
            <Box key={template.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
              <Card>
                <Box 
                  sx={{ 
                    height: 140, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    position: 'relative'
                  }}
                >
                  <AspectRatioIcon sx={{ fontSize: 48, color: '#757575' }} />
                  <Chip 
                    label={template.aspect_ratio} 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      bgcolor: getAspectRatioColor(template.aspect_ratio),
                      color: 'white'
                    }} 
                  />
                </Box>
                <CardContent sx={{ pt: 2, pb: 1 }}>
                  <Typography variant="subtitle1" noWrap title={template.name}>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                    {template.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                    Creatomate ID: {template.creatomate_id}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {template.dynamic_fields.map((field, index) => (
                      <Chip 
                        key={index} 
                        label={field} 
                        size="small" 
                        sx={{ height: 20, fontSize: '0.7rem' }} 
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleViewDetails(template)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(template)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button size="small" sx={{ ml: 'auto' }}>
                    Use Template
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
              <Box>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={selectedTemplate.name}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Box>
              <Box>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={selectedTemplate.description}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <TextField
                    label="Creatomate Template ID"
                    fullWidth
                    value={selectedTemplate.creatomate_id}
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <TextField
                    label="Aspect Ratio"
                    fullWidth
                    value={selectedTemplate.aspect_ratio}
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Dynamic Fields
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedTemplate.dynamic_fields.map((field, index) => (
                    <Chip key={index} label={field} />
                  ))}
                  {selectedTemplate.dynamic_fields.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      No dynamic fields defined
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateGallery;
