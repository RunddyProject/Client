import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { AuthProvider } from '@/app/providers/AuthContext';
import { HeaderProvider } from '@/app/providers/HeaderContext';
import Header from '@/shared/ui/navigations/Header';
import { Toaster } from '@/shared/ui/primitives/sonner';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HeaderProvider>
        <div className='bg-w-100 mx-auto min-h-dvh max-w-xl pb-[env(safe-area-inset-bottom)]'>
          <Toaster />
          <Header />
          <Outlet />
        </div>
      </HeaderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
