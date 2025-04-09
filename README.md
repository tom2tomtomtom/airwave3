# AIrWAVE Platform Prototype

AIrWAVE is a comprehensive digital ad execution platform that leverages dynamic templates and various APIs to help businesses produce digital assets at scale.

## Overview

This prototype implements the core functionality of the AIrWAVE platform, including:

- User authentication (login, signup, password reset)
- Client management with branding colors
- Asset library with drag-and-drop uploads, tagging, and filtering
- Template management with Creatomate integration
- Content generation with strategic motivations and copy variations
- Visual matrix for organizing content across platforms and formats
- Approval workflow for content review and feedback
- Export functionality for generating deliverable assets

## Technology Stack

- **Frontend**: React with TypeScript, Material UI
- **Backend**: Supabase for authentication, database, and storage
- **External APIs**: 
  - OpenAI for text-to-image generation (placeholder)
  - Creatomate for video generation (placeholder)
  - AssemblyAI for subtitle generation (placeholder)
  - Mubert for music generation (placeholder)
  - Runway for additional AI image processing (placeholder)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_CREATOMATE_API_KEY=your_creatomate_api_key
   REACT_APP_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   REACT_APP_MUBERT_API_KEY=your_mubert_api_key
   REACT_APP_RUNWAY_API_KEY=your_runway_api_key
   ```
4. Start the development server:
   ```
   npm start
   ```

## Project Structure

- `/src/components`: Reusable UI components
- `/src/context`: React context providers for state management
- `/src/pages`: Page components for different routes
- `/src/services`: Service modules for API interactions
- `/src/config`: Configuration files
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions
- `/src/hooks`: Custom React hooks

## Features

### Authentication

- Login with email and password
- Sign up with email verification
- Password reset functionality
- Protected routes for authenticated users

### Client Management

- Create and manage client profiles
- Set client branding colors
- Select active client for content creation

### Asset Management

- Upload assets with drag-and-drop
- Tag assets for easy organization
- Filter assets by type and tags
- View and manage asset details

### Template Management

- Import templates from Creatomate
- View template details including dynamic fields
- Use templates for content creation

### Content Generation

- Generate strategic motivations based on client briefs
- Create copy variations with different tones and lengths
- Approve and manage generated content

### Visual Matrix

- Create matrices to organize content across platforms and formats
- Assign assets and templates to matrix items
- View and manage matrix items

### Approval Workflow

- Create approval requests for content
- Assign requests to specific users
- Add comments to requests
- Approve, reject, or request changes

### Export Functionality

- Create export jobs for approved content
- Select export formats (MP4, JPG, PNG, GIF, ZIP)
- Configure export settings (quality, source files)
- Download completed exports

## API Integration

This prototype includes placeholder implementations for the following API integrations:

- **OpenAI API**: For text-to-image generation
- **Creatomate API**: For video generation and rendering
- **AssemblyAI API**: For subtitle generation
- **Mubert API**: For music generation
- **Runway API**: For additional AI image processing

In a production environment, these placeholder implementations would be replaced with actual API calls using the provided API keys.

## Database Schema

The Supabase database includes the following tables:

- `users`: User accounts and authentication
- `clients`: Client information and branding
- `assets`: Uploaded assets and metadata
- `templates`: Imported templates from Creatomate
- `content_motivations`: Generated strategic motivations
- `content_copy`: Generated copy variations
- `visual_matrices`: Matrix definitions
- `matrix_items`: Individual items in matrices
- `approval_requests`: Content approval requests
- `approval_comments`: Comments on approval requests
- `export_jobs`: Export job definitions and status

## Deployment

This prototype is designed to be deployed to a production environment using Supabase for backend services. The React frontend can be deployed to any static hosting service such as Vercel, Netlify, or AWS S3.

## Future Enhancements

- Integration with additional AI services
- Enhanced analytics and reporting
- Bulk operations for assets and templates
- Advanced user permissions and roles
- Customizable workflow stages
- Integration with marketing platforms

## License

This project is proprietary and confidential.
