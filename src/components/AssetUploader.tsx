import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAsset } from '../context/AssetContext';
import { Asset } from '../services/databaseService';

const AssetUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string>('');
  const [assetType, setAssetType] = useState<Asset['type']>('image');
  const [isClientProvided, setIsClientProvided] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { uploadAsset, fetchAssets } = useAsset();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': []
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setDialogOpen(true);
    }
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      setUploadError(null);
      
      const tagArray = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Upload each file
      for (const file of files) {
        await uploadAsset(file, assetType, tagArray, isClientProvided);
      }
      
      // Refresh asset list
      await fetchAssets();
      
      // Reset form
      setFiles([]);
      setTags('');
      setAssetType('image');
      setIsClientProvided(false);
      setUploadSuccess(true);
      setDialogOpen(false);
      
      // Reset success message after a delay
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error in upload process:', err);
      setUploadError(err.message || 'Failed to upload assets');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setDialogOpen(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setDialogOpen(false);
      setFiles([]);
    }
  };

  const determineAssetType = (file: File): Asset['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // Default
  };

  return (
    <>
      <Paper
        {...getRootProps()}
        elevation={3}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? '#f0f8ff' : 'white',
          border: isDragActive ? '2px dashed #2196f3' : '2px dashed #ccc',
          '&:hover': {
            bgcolor: '#f9f9f9',
            borderColor: '#999'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: '#757575', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & drop files here
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or click to select files
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Select Files
        </Button>
      </Paper>

      {uploadSuccess && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <Typography color="success">
            Assets uploaded successfully!
          </Typography>
        </Box>
      )}

      {uploadError && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">
            {uploadError}
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Upload Assets</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Box key={index}>
                  <Chip
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    sx={{ mb: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Asset Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['image', 'video', 'audio', 'copy', 'voiceover'].map((type) => (
                <Box key={type}>
                  <Chip
                    label={type}
                    onClick={() => setAssetType(type as Asset['type'])}
                    color={assetType === type ? 'primary' : 'default'}
                    sx={{ mb: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            margin="normal"
            helperText="Example: logo, branding, summer campaign"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isClientProvided}
                onChange={(e) => setIsClientProvided(e.target.checked)}
              />
            }
            label="Client provided asset (should not be heavily manipulated)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || files.length === 0}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetUploader;
