import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip
} from '@mui/material';
import { 
  ThumbUp as ThumbUpIcon,
  ContentCopy as ContentCopyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useContentGeneration } from '../context/ContentGenerationContext';
import { StrategicMotivation, CopyVariation } from '../services/databaseService';

const CopyGenerator: React.FC = () => {
  const [selectedMotivationId, setSelectedMotivationId] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');
  const [length, setLength] = useState<CopyVariation['length']>('medium');
  const [count, setCount] = useState<number>(3);
  const [includeCta, setIncludeCta] = useState<boolean>(false);
  const [generatedCopy, setGeneratedCopy] = useState<CopyVariation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    strategicMotivations, 
    copyVariations,
    loadingMotivations,
    loadingCopy,
    errorMotivations,
    errorCopy,
    generateCopyVariations,
    fetchStrategicMotivations,
    fetchCopyVariations,
    approveCopyVariation
  } = useContentGeneration();

  useEffect(() => {
    fetchStrategicMotivations();
    fetchCopyVariations();
  }, [fetchStrategicMotivations, fetchCopyVariations]);

  const handleGenerateCopy = async () => {
    if (!selectedMotivationId) {
      setError('Please select a strategic motivation');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const copyVariations = await generateCopyVariations(
        selectedMotivationId,
        tone,
        length,
        count,
        includeCta
      );
      setGeneratedCopy(copyVariations);
    } catch (err: any) {
      console.error('Error generating copy:', err);
      setError(err.message || 'Failed to generate copy');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveCopy = async (copyId: string) => {
    try {
      await approveCopyVariation(copyId);
      // Refresh the list
      await fetchCopyVariations();
    } catch (err: any) {
      console.error('Error approving copy:', err);
    }
  };

  const handleCopyCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Could show a temporary success message here
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const approvedMotivations = strategicMotivations.filter(m => m.is_approved);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate Copy Variations
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Select an approved strategic motivation and configure settings to generate copy variations using AI.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {errorMotivations && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMotivations}
          </Alert>
        )}
        
        {errorCopy && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorCopy}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ width: '100%' }}>
            <FormControl fullWidth disabled={loadingMotivations || generating}>
              <InputLabel id="motivation-select-label">Strategic Motivation</InputLabel>
              <Select
                labelId="motivation-select-label"
                value={selectedMotivationId}
                label="Strategic Motivation"
                onChange={(e) => setSelectedMotivationId(e.target.value)}
              >
                {approvedMotivations.length === 0 ? (
                  <MenuItem disabled value="">
                    No approved motivations available
                  </MenuItem>
                ) : (
                  approvedMotivations.map((motivation) => (
                    <MenuItem key={motivation.id} value={motivation.id}>
                      {motivation.content}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth disabled={generating}>
                <InputLabel id="tone-select-label">Tone</InputLabel>
                <Select
                  labelId="tone-select-label"
                  value={tone}
                  label="Tone"
                  onChange={(e) => setTone(e.target.value)}
                >
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Friendly">Friendly</MenuItem>
                  <MenuItem value="Enthusiastic">Enthusiastic</MenuItem>
                  <MenuItem value="Authoritative">Authoritative</MenuItem>
                  <MenuItem value="Humorous">Humorous</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
              <FormControl fullWidth disabled={generating}>
                <InputLabel id="length-select-label">Length</InputLabel>
                <Select
                  labelId="length-select-label"
                  value={length}
                  label="Length"
                  onChange={(e) => setLength(e.target.value as CopyVariation['length'])}
                >
                  <MenuItem value="short">Short</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="long">Long</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Typography gutterBottom>Number of Variations: {count}</Typography>
            <Slider
              value={count}
              onChange={(_, newValue) => setCount(newValue as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              disabled={generating}
            />
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCta}
                  onChange={(e) => setIncludeCta(e.target.checked)}
                  disabled={generating}
                />
              }
              label="Include Call to Action"
            />
          </Box>
        </Box>
        
        <Button
          variant="contained"
          onClick={handleGenerateCopy}
          disabled={generating || loadingCopy || !selectedMotivationId}
          startIcon={generating || loadingCopy ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{ mt: 3 }}
        >
          {generating || loadingCopy ? 'Generating...' : 'Generate Copy'}
        </Button>
      </Paper>

      {generatedCopy.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generated Copy Variations
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Review and approve the generated copy variations.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {generatedCopy.map((copy) => (
              <Box key={copy.id} sx={{ width: '100%' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1">{copy.content}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Chip label={`Tone: ${copy.tone}`} size="small" />
                      <Chip label={`Length: ${copy.length}`} size="small" />
                      {copy.is_approved && (
                        <Chip label="Approved" color="success" size="small" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCopyToClipboard(copy.content)}
                      title="Copy to clipboard"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleApproveCopy(copy.id)}
                      disabled={copy.is_approved}
                      color={copy.is_approved ? "success" : "default"}
                      title="Approve copy"
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Copy Variations
        </Typography>
        
        {loadingCopy ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : copyVariations.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {copyVariations.map((copy) => (
              <Box key={copy.id} sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
                <Card variant="outlined" sx={{ 
                  bgcolor: copy.is_approved ? '#f1f8e9' : '#fff',
                  border: copy.is_approved ? '1px solid #c5e1a5' : '1px solid #e0e0e0'
                }}>
                  <CardContent>
                    <Typography variant="body1">{copy.content}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Tone: ${copy.tone}`} size="small" />
                      <Chip label={`Length: ${copy.length}`} size="small" />
                      {copy.is_approved && (
                        <Chip label="Approved" color="success" size="small" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCopyToClipboard(copy.content)}
                      title="Copy to clipboard"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {!copy.is_approved && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleApproveCopy(copy.id)}
                        color="primary"
                        title="Approve copy"
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No copy variations found. Generate some using the form above.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CopyGenerator;
