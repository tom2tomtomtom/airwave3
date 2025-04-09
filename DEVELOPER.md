# AIrWAVE Platform - Developer Documentation

This document provides technical details for developers working on the AIrWAVE platform.

## Architecture Overview

The AIrWAVE platform follows a modern React architecture with the following key components:

### Frontend
- React with TypeScript for type safety
- Material UI for component library
- Context API for state management
- React Router for navigation

### Backend
- Supabase for authentication, database, and storage
- RESTful API integration with external services

## Context Providers

The application uses React Context API for state management:

- `AuthContext`: Manages user authentication state
- `ClientContext`: Manages client selection and data
- `AssetContext`: Manages asset library operations
- `TemplateContext`: Manages template operations
- `ContentGenerationContext`: Manages content generation
- `VisualMatrixContext`: Manages visual matrix operations
- `ApprovalWorkflowContext`: Manages approval workflow
- `ExportContext`: Manages export operations

## API Integration Details

### Supabase Integration

The application connects to Supabase using the Supabase JavaScript client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### External API Integration

The application is designed to integrate with the following external APIs:

#### OpenAI API
Used for text-to-image generation and copy suggestions.

```typescript
// Example implementation
const generateImage = async (prompt: string) => {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '1024x1024'
    })
  });
  
  return await response.json();
};
```

#### Creatomate API
Used for video generation and rendering.

```typescript
// Example implementation
const renderVideo = async (templateId: string, modifications: any) => {
  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_CREATOMATE_API_KEY}`
    },
    body: JSON.stringify({
      template_id: templateId,
      modifications
    })
  });
  
  return await response.json();
};
```

## Database Schema Details

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Clients Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_client_provided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Templates Table
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  creatomate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  platform TEXT,
  dynamic_fields TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Component Structure

The application is organized into the following component structure:

### Core Components
- `ProtectedRoute`: Ensures routes are only accessible to authenticated users
- `ClientSelector`: Allows users to select and manage clients
- `AssetUploader`: Handles asset uploads with drag-and-drop
- `AssetGallery`: Displays and filters assets
- `TemplateGallery`: Displays and manages templates
- `VisualMatrixGrid`: Displays and manages visual matrix items
- `ApprovalRequestList`: Displays and manages approval requests
- `ExportJobList`: Displays and manages export jobs

### Page Components
- `Login`: User login page
- `SignUp`: User registration page
- `ResetPassword`: Password reset page
- `Dashboard`: Main dashboard page
- `AssetManagement`: Asset management page
- `TemplateManagement`: Template management page
- `ContentGeneration`: Content generation page
- `VisualMatrixPage`: Visual matrix page
- `ApprovalWorkflowPage`: Approval workflow page
- `ExportPage`: Export management page

## Error Handling

The application implements error handling at multiple levels:

1. **API Error Handling**: All API calls are wrapped in try/catch blocks with appropriate error messages
2. **Form Validation**: Form inputs are validated using Formik and Yup
3. **Authentication Errors**: Authentication errors are handled and displayed to users
4. **Network Errors**: Network errors are caught and displayed with retry options

## Performance Considerations

1. **Lazy Loading**: Routes are lazy-loaded to improve initial load time
2. **Pagination**: Lists implement pagination to handle large datasets
3. **Caching**: API responses are cached where appropriate
4. **Optimized Rendering**: Components use memoization to prevent unnecessary re-renders

## Security Considerations

1. **Authentication**: JWT-based authentication with Supabase
2. **Authorization**: Row-level security in Supabase
3. **API Keys**: API keys are stored in environment variables
4. **Input Validation**: All user inputs are validated before processing

## Testing Strategy

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete user flows

## Deployment Process

1. **Build Process**: Create optimized production build with `npm run build`
2. **Environment Configuration**: Set environment variables for production
3. **Static Hosting**: Deploy build to static hosting service
4. **Database Migration**: Apply database migrations to production Supabase instance

## Troubleshooting Common Issues

1. **Authentication Issues**: Check Supabase configuration and JWT expiration
2. **API Integration Errors**: Verify API keys and request formats
3. **Rendering Issues**: Check for React key prop warnings and state management
4. **Performance Issues**: Look for unnecessary re-renders and optimize API calls

## Future Development Roadmap

1. **Enhanced Analytics**: Add detailed analytics and reporting
2. **Advanced Permissions**: Implement role-based access control
3. **Workflow Automation**: Add automated workflow triggers
4. **AI Enhancements**: Integrate more advanced AI capabilities
5. **Mobile App**: Develop companion mobile application
