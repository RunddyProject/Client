import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Outlet />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
