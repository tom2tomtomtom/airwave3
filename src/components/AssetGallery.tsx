import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAsset } from '../context/AssetContext';
import { Asset } from '../services/databaseService';

const AssetGallery: React.FC = () => {
  const { assets, loading, error, fetchAssets, deleteAsset, updateAssetTags } = useAsset();
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTags, setNewTags] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    // Apply filters and search
    let result = [...assets];
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(asset => asset.type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(term) || 
        asset.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredAssets(result);
  }, [assets, filterType, searchTerm]);

  const handleEditClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewTags(asset.tags.join(', '));
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const handleSaveTags = async () => {
    if (!selectedAsset) return;
    
    const tagArray = newTags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    await updateAssetTags(selectedAsset.id, tagArray);
    setEditDialogOpen(false);
    await fetchAssets();
  };

  const handleConfirmDelete = async () => {
    if (!selectedAsset) return;
    
    await deleteAsset(selectedAsset.id);
    setDeleteDialogOpen(false);
    await fetchAssets();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Calculate pagination
  const pageCount = Math.ceil(filteredAssets.length / itemsPerPage);
  const displayedAssets = filteredAssets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderAssetPreview = (asset: Asset) => {
    switch (asset.type) {
      case 'image':
        return (
          <CardMedia
            component="img"
            height="140"
            image={asset.url}
            alt={asset.name}
          />
        );
      case 'video':
        return (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
            <video width="100%" height="100%" controls>
              <source src={asset.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      case 'audio':
        return (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
            <audio controls>
              <source src={asset.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </Box>
        );
      default:
        return (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="textSecondary">
              {asset.type.toUpperCase()}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search assets..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="filter-type-label">Asset Type</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            label="Asset Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="image">Images</MenuItem>
            <MenuItem value="video">Videos</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
            <MenuItem value="copy">Copy</MenuItem>
            <MenuItem value="voiceover">Voiceovers</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : filteredAssets.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1">
            No assets found. Upload some assets to get started.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {displayedAssets.map((asset) => (
              <Box key={asset.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%', lg: '22%' } }}>
                <Card>
                  {renderAssetPreview(asset)}
                  <CardContent sx={{ pt: 2, pb: 1 }}>
                    <Typography variant="subtitle1" noWrap title={asset.name}>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {asset.type}
                      {asset.is_client_provided && (
                        <Chip 
                          label="Client Provided" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {asset.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }} 
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => handleEditClick(asset)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(asset)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Button size="small" href={asset.url} target="_blank" sx={{ ml: 'auto' }}>
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Tags Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Asset Tags</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            margin="normal"
            helperText="Example: logo, branding, summer campaign"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTags} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this asset? This action cannot be undone.
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
    </Box>
  );
};

export default AssetGallery;
