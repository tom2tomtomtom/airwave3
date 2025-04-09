import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs,
  Tab,
  Button,
  Divider
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useClient } from '../context/ClientContext';
import TemplateGallery from '../components/TemplateGallery';
import ImportTemplateDialog from '../components/ImportTemplateDialog';

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
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
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

const TemplateManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { selectedClient } = useClient();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
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
              Please select a client to manage templates.
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
            Template Management
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenImportDialog}
          >
            Import Template
          </Button>
        </Box>
        
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Client: {selectedClient.name}
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="template management tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Templates" />
            <Tab label="Recently Used" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TemplateGallery />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              Recently used templates will appear here.
            </Typography>
          </TabPanel>
        </Paper>
      </Box>

      <ImportTemplateDialog 
        open={importDialogOpen} 
        onClose={handleCloseImportDialog} 
      />
    </Container>
  );
};

export default TemplateManagement;
