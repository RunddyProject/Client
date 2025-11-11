import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import '@/shared/design/tokens/tokens.css';
import '@/shared/design/tokens/shadcn-theme.css';
import '@/app/index.css';

import { router } from '@/app/routing/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
