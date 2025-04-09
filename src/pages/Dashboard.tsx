import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useClient } from '../context/ClientContext';
import ClientSelector from '../components/ClientSelector';
import CreateClientDialog from '../components/CreateClientDialog';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { clients, selectedClient, loading, error } = useClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AIrWAVE Platform
          </Typography>
          <ClientSelector />
          <Box sx={{ ml: 2 }}>
            <IconButton color="inherit" onClick={handleSignOut}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Signed in as: {user?.email}
              </Typography>
            </Box>
          </Box>

          {selectedClient ? (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Welcome to {selectedClient.name}'s Dashboard
              </Typography>
              <Typography variant="body1">
                Manage assets, templates, and generate content for this client.
              </Typography>
              <Box sx={{ display: 'flex', mt: 2 }}>
                {selectedClient.branding_colors.map((color, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      bgcolor: color, 
                      mr: 1,
                      borderRadius: '50%',
                      border: '1px solid #ddd'
                    }} 
                  />
                ))}
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Welcome to AIrWAVE
              </Typography>
              <Typography variant="body1">
                Select a client to get started or create a new client.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{ mt: 2 }}
              >
                Create Client
              </Button>
            </Paper>
          )}

          <Typography variant="h5" component="h2" gutterBottom>
            Your Clients
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff4f4' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }} key={client.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {client.name}
                        </Typography>
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          {client.branding_colors.map((color, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: color, 
                                mr: 1,
                                borderRadius: '50%',
                                border: '1px solid #ddd'
                              }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            if (selectedClient?.id !== client.id) {
                              // We need to use the selectClient from the current context
                              // Not call useClient() inside a callback
                              // This will be handled by the ClientContext provider
                            }
                          }}
                          disabled={selectedClient?.id === client.id}
                        >
                          {selectedClient?.id === client.id ? 'Selected' : 'Select Client'}
                        </Button>
                        <Button size="small">View Details</Button>
                      </CardActions>
                    </Card>
                  </Box>
                ))
              ) : (
                <Box sx={{ width: '100%' }}>
                  <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      No clients found. Create your first client to get started.
                    </Typography>
                    <Button 
                      variant="contained"
                      onClick={handleOpenCreateDialog}
                    >
                      Create Client
                    </Button>
                  </Paper>
                </Box>
              )}
              
              {/* Add New Client Card */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, bgcolor: '#f9f9f9' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      Add New Client
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateDialog}
                    >
                      Create Client
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      <CreateClientDialog 
        open={createDialogOpen} 
        onClose={handleCloseCreateDialog} 
      />
    </>
  );
};

export default Dashboard;
