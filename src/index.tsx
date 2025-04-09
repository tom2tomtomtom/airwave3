import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClientProvider } from './context/ClientContext';
import { AssetProvider } from './context/AssetContext';
import { TemplateProvider } from './context/TemplateContext';
import { ContentGenerationProvider } from './context/ContentGenerationContext';
import { VisualMatrixProvider } from './context/VisualMatrixContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ClientProvider>
      <AssetProvider>
        <TemplateProvider>
          <ContentGenerationProvider>
            <VisualMatrixProvider>
              <App />
            </VisualMatrixProvider>
          </ContentGenerationProvider>
        </TemplateProvider>
      </AssetProvider>
    </ClientProvider>
  </React.StrictMode>
);
