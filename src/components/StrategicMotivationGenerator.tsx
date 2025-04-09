import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import { 
  ThumbUp as ThumbUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useContentGeneration } from '../context/ContentGenerationContext';
import { StrategicMotivation } from '../services/databaseService';

const StrategicMotivationGenerator: React.FC = () => {
  const [clientBrief, setClientBrief] = useState('');
  const [generatedMotivations, setGeneratedMotivations] = useState<StrategicMotivation[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    strategicMotivations, 
    loadingMotivations, 
    errorMotivations, 
    generateStrategicMotivations,
    fetchStrategicMotivations,
    approveMotivation
  } = useContentGeneration();

  const handleGenerateMotivations = async () => {
    if (!clientBrief.trim()) {
      setError('Please enter a client brief');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const motivations = await generateStrategicMotivations(clientBrief);
      setGeneratedMotivations(motivations);
    } catch (err: any) {
      console.error('Error generating motivations:', err);
      setError(err.message || 'Failed to generate motivations');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveMotivation = async (motivationId: string) => {
    try {
      await approveMotivation(motivationId);
      // Refresh the list
      await fetchStrategicMotivations();
    } catch (err: any) {
      console.error('Error approving motivation:', err);
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate Strategic Motivations
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Enter a client brief to generate strategic motivations using AI. These motivations will guide the content creation process.
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
        
        <TextField
          label="Client Brief"
          multiline
          rows={4}
          fullWidth
          value={clientBrief}
          onChange={(e) => setClientBrief(e.target.value)}
          placeholder="Describe the client's business, target audience, goals, and any specific requirements..."
          disabled={generating || loadingMotivations}
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          onClick={handleGenerateMotivations}
          disabled={generating || loadingMotivations || !clientBrief.trim()}
          startIcon={generating || loadingMotivations ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {generating || loadingMotivations ? 'Generating...' : 'Generate Motivations'}
        </Button>
      </Paper>

      {generatedMotivations.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generated Motivations
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Review and approve the generated strategic motivations.
          </Typography>
          
          <List>
            {generatedMotivations.map((motivation) => (
              <React.Fragment key={motivation.id}>
                <ListItem
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleApproveMotivation(motivation.id)}
                      disabled={motivation.is_approved}
                      color={motivation.is_approved ? "success" : "default"}
                    >
                      <ThumbUpIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={motivation.content}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {motivation.is_approved ? (
                          <Chip label="Approved" color="success" size="small" />
                        ) : (
                          <Chip label="Pending Approval" size="small" />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Strategic Motivations
        </Typography>
        
        {loadingMotivations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : strategicMotivations.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {strategicMotivations.map((motivation) => (
              <Box key={motivation.id} sx={{ width: '100%' }}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    bgcolor: motivation.is_approved ? '#f1f8e9' : '#fff',
                    border: motivation.is_approved ? '1px solid #c5e1a5' : '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body1">{motivation.content}</Typography>
                    <Box>
                      {motivation.is_approved ? (
                        <Chip label="Approved" color="success" size="small" />
                      ) : (
                        <IconButton 
                          size="small" 
                          onClick={() => handleApproveMotivation(motivation.id)}
                          color="primary"
                        >
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No strategic motivations found. Generate some using the form above.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StrategicMotivationGenerator;
