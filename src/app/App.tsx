import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { AuthProvider } from '@/app/providers/AuthContext';
import Header from '@/shared/ui/navigations/Header';
import { Toaster } from '@/shared/ui/primitives/sonner';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Header />
      <Outlet />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
