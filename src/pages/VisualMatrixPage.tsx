import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useClient } from '../context/ClientContext';
import { useVisualMatrix } from '../context/VisualMatrixContext';
import CreateMatrixDialog from '../components/CreateMatrixDialog';
import VisualMatrixGrid from '../components/VisualMatrixGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`matrix-tabpanel-${index}`}
      aria-labelledby={`matrix-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const VisualMatrixPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { selectedClient } = useClient();
  const { 
    matrices, 
    currentMatrix, 
    loading, 
    error, 
    fetchMatrices, 
    setCurrentMatrix 
  } = useVisualMatrix();

  useEffect(() => {
    if (selectedClient) {
      fetchMatrices();
    }
  }, [selectedClient, fetchMatrices]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    fetchMatrices();
  };

  const handleSelectMatrix = async (matrixId: string) => {
    await setCurrentMatrix(matrixId);
    setTabValue(1); // Switch to the Matrix Content tab
  };

  if (!selectedClient) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              No Client Selected
            </Typography>
            <Typography variant="body1">
              Please select a client to manage visual matrices.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Visual Matrix
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Matrix
          </Button>
        </Box>
        
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Client: {selectedClient.name}
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="visual matrix tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Matrices" />
            <Tab label="Matrix Content" disabled={!currentMatrix} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : matrices.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body1">
                  No visual matrices found. Create a new matrix to get started.
                </Typography>
              </Box>
            ) : (
              <List>
                {matrices.map((matrix) => (
                  <React.Fragment key={matrix.id}>
                    <ListItem 
                      component="div"
                      onClick={() => handleSelectMatrix(matrix.id)}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: currentMatrix?.id === matrix.id ? 'action.selected' : 'inherit'
                      }}
                    >
                      <ListItemText 
                        primary={matrix.name} 
                        secondary={matrix.description || 'No description'} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <VisualMatrixGrid />
          </TabPanel>
        </Paper>
      </Box>

      <CreateMatrixDialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog} 
      />
    </Container>
  );
};

export default VisualMatrixPage;
