import React, { useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useClient } from '../context/ClientContext';
import AssetUploader from '../components/AssetUploader';
import AssetGallery from '../components/AssetGallery';

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
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
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

const AssetManagement: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const { selectedClient } = useClient();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
              Please select a client to manage assets.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Asset Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Client: {selectedClient.name}
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="asset management tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Browse Assets" />
            <Tab label="Upload Assets" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <AssetGallery />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Upload New Assets
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Drag and drop files or click to select files to upload to {selectedClient.name}'s asset library.
            </Typography>
            <AssetUploader />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default AssetManagement;
