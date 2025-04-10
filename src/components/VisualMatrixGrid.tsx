import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useVisualMatrix } from '../context/VisualMatrixContext';
import { useTemplate } from '../context/TemplateContext';
import { useContentGeneration } from '../context/ContentGenerationContext';
import { useAsset } from '../context/AssetContext';
import { VisualMatrixItem } from '../services/databaseService';

// Mock data for platforms and formats
const PLATFORMS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'display', name: 'Display Ads' },
  { id: 'email', name: 'Email' }
];

const FORMATS = [
  { id: 'post', name: 'Post' },
  { id: 'story', name: 'Story' },
  { id: 'reel', name: 'Reel' },
  { id: 'carousel', name: 'Carousel' },
  { id: 'video', name: 'Video' },
  { id: 'banner', name: 'Banner' },
  { id: 'newsletter', name: 'Newsletter' }
];

interface AddMatrixItemDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddMatrixItemDialog: React.FC<AddMatrixItemDialogProps> = ({ open, onClose }) => {
  const [platformId, setPlatformId] = useState('');
  const [formatId, setFormatId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addMatrixItem } = useVisualMatrix();
  const { templates } = useTemplate();
  const { copyVariations } = useContentGeneration();
  const { assets } = useAsset();

  const handleAddItem = async () => {
    if (!platformId || !formatId || !templateId || !copyId) {
      setError('All fields are required');
      return;
    }

    try {
      setAdding(true);
      setError(null);
      await addMatrixItem(
        platformId,
        formatId,
        templateId,
        copyId,
        selectedAssetIds
      );
      onClose();
      // Reset form
      setPlatformId('');
      setFormatId('');
      setTemplateId('');
      setCopyId('');
      setSelectedAssetIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to add matrix item');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (!adding) {
      onClose();
    }
  };

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Content to Visual Matrix</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Add content to the visual matrix by selecting platform, format, template, copy, and assets.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="platform-select-label">Platform</InputLabel>
                <Select
                  labelId="platform-select-label"
                  value={platformId}
                  label="Platform"
                  onChange={(e) => setPlatformId(e.target.value)}
                  disabled={adding}
                >
                  {PLATFORMS.map(platform => (
                    <MenuItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="format-select-label">Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  value={formatId}
                  label="Format"
                  onChange={(e) => setFormatId(e.target.value)}
                  disabled={adding}
                >
                  {FORMATS.map(format => (
                    <MenuItem key={format.id} value={format.id}>
                      {format.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="template-select-label">Template</InputLabel>
              <Select
                labelId="template-select-label"
                value={templateId}
                label="Template"
                onChange={(e) => setTemplateId(e.target.value)}
                disabled={adding}
              >
                {templates.length === 0 ? (
                  <MenuItem disabled value="">
                    No templates available
                  </MenuItem>
                ) : (
                  templates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.aspect_ratio})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="copy-select-label">Copy</InputLabel>
              <Select
                labelId="copy-select-label"
                value={copyId}
                label="Copy"
                onChange={(e) => setCopyId(e.target.value)}
                disabled={adding}
              >
                {copyVariations.length === 0 ? (
                  <MenuItem disabled value="">
                    No copy variations available
                  </MenuItem>
                ) : (
                  copyVariations.map(copy => (
                    <MenuItem key={copy.id} value={copy.id}>
                      {(copy.content || copy.copy_text || '').substring(0, 50)}...
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Select Assets
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {assets.length === 0 ? (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    No assets available
                  </Typography>
                </Box>
              ) : (
                assets.map(asset => (
                  <Box sx={{ width: { xs: '100%', sm: '46%', md: '22%' } }} key={asset.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        border: selectedAssetIds.includes(asset.id) 
                          ? '2px solid #2196f3' 
                          : '1px solid #e0e0e0',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAssetToggle(asset.id)}
                    >
                      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" color="textSecondary">
                          {asset.type.toUpperCase()}
                        </Typography>
                      </Box>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" noWrap>
                          {asset.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={adding}>
          Cancel
        </Button>
        <Button 
          onClick={handleAddItem} 
          variant="contained" 
          disabled={adding || !platformId || !formatId || !templateId || !copyId}
          startIcon={adding ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {adding ? 'Adding...' : 'Add to Matrix'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VisualMatrixGrid: React.FC = () => {
  const { 
    currentMatrix, 
    matrixItems, 
    loading, 
    error, 
    removeMatrixItem, 
    updateMatrixItem 
  } = useVisualMatrix();
  
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [viewItemDialogOpen, setViewItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VisualMatrixItem | null>(null);

  const handleOpenAddItemDialog = () => {
    setAddItemDialogOpen(true);
  };

  const handleCloseAddItemDialog = () => {
    setAddItemDialogOpen(false);
  };

  const handleViewItem = (item: VisualMatrixItem) => {
    setSelectedItem(item);
    setViewItemDialogOpen(true);
  };

  const handleCloseViewItemDialog = () => {
    setViewItemDialogOpen(false);
    setSelectedItem(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeMatrixItem(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleUpdateStatus = async (itemId: string, status: 'draft' | 'in_review' | 'approved' | 'rejected') => {
    try {
      await updateMatrixItem(itemId, { status });
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#757575'; // grey
      case 'in_review': return '#ff9800'; // orange
      case 'approved': return '#4caf50'; // green
      case 'rejected': return '#f44336'; // red
      default: return '#757575'; // grey
    }
  };

  const getPlatformName = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? platform.name : platformId;
  };

  const getFormatName = (formatId: string) => {
    const format = FORMATS.find(f => f.id === formatId);
    return format ? format.name : formatId;
  };

  if (!currentMatrix) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No Matrix Selected
        </Typography>
        <Typography variant="body1">
          Please select or create a visual matrix to view its content.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {currentMatrix.name}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddItemDialog}
        >
          Add Content
        </Button>
      </Box>
      
      {currentMatrix.description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {currentMatrix.description}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : matrixItems.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="body1">
            No content added to this matrix yet. Click "Add Content" to get started.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matrixItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getPlatformName(item.platform_id)}</TableCell>
                  <TableCell>{getFormatName(item.format_id)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status.replace('_', ' ').toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(item.status),
                        color: 'white'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewItem(item)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleRemoveItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <AddMatrixItemDialog 
        open={addItemDialogOpen} 
        onClose={handleCloseAddItemDialog} 
      />
      
      {/* View Item Dialog */}
      <Dialog open={viewItemDialogOpen} onClose={handleCloseViewItemDialog} maxWidth="md" fullWidth>
        <DialogTitle>Content Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <Typography variant="subtitle2">Platform</Typography>
                  <Typography variant="body1" gutterBottom>{getPlatformName(selectedItem.platform_id)}</Typography>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <Typography variant="subtitle2">Format</Typography>
                  <Typography variant="body1" gutterBottom>{getFormatName(selectedItem.format_id)}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2">Status</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Chip 
                    label={selectedItem.status.replace('_', ' ').toUpperCase()} 
                    sx={{ 
                      bgcolor: getStatusColor(selectedItem.status),
                      color: 'white'
                    }} 
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2">Template</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.template_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Copy</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.copy_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Assets</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {selectedItem.asset_ids.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">No assets selected</Typography>
                  ) : (
                    selectedItem.asset_ids.map((assetId) => (
                      <Chip key={assetId} label={assetId} size="small" />
                    ))
                  )}
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Update Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'draft')}
                    disabled={selectedItem.status === 'draft'}
                  >
                    Draft
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'in_review')}
                    disabled={selectedItem.status === 'in_review'}
                  >
                    In Review
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="success"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'approved')}
                    disabled={selectedItem.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="error"
                    onClick={() => handleUpdateStatus(selectedItem.id, 'rejected')}
                    disabled={selectedItem.status === 'rejected'}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewItemDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisualMatrixGrid;
