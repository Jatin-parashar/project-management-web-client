import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionBootstrap } from '@/app/session-bootstrap';
import { router } from '@/app/router';
import { store } from '@/app/store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <SessionBootstrap>
          <RouterProvider router={router} />
          <Toaster />
        </SessionBootstrap>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
);
