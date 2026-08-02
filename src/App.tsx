import AppRoutes from './presentation/routes/AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './application/context/AuthContext';
import { useSignalR } from './application/hooks/useSignalR';

const queryClient = new QueryClient();

function SignalRListener({ children }: { children: React.ReactNode }) {
  useSignalR();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignalRListener>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SignalRListener>
    </QueryClientProvider>
  );
}

export default App;
