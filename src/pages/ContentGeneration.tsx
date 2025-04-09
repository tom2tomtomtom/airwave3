import React, { useState } from 'react';
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
import StrategicMotivationGenerator from '../components/StrategicMotivationGenerator';
import CopyGenerator from '../components/CopyGenerator';

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
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
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

const ContentGeneration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
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
              Please select a client to generate content.
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
          Content Generation
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Client: {selectedClient.name}
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="content generation tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Strategic Motivations" />
            <Tab label="Copy Generation" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <StrategicMotivationGenerator />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <CopyGenerator />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ContentGeneration;
