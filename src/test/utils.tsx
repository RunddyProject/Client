import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import type { PropsWithChildren } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false }
    }
  });
}

interface WrapperOptions {
  initialPath?: string;
  queryClient?: QueryClient;
}

function createWrapper({ initialPath = '/', queryClient }: WrapperOptions = {}) {
  const qc = queryClient ?? createTestQueryClient();
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & WrapperOptions
) {
  const { initialPath, queryClient, ...renderOptions } = options ?? {};
  return render(ui, { wrapper: createWrapper({ initialPath, queryClient }), ...renderOptions });
}

function customRenderHook<Result, Props>(
  renderFn: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'> & WrapperOptions
) {
  const { initialPath, queryClient, ...hookOptions } = options ?? {};
  return renderHook(renderFn, {
    wrapper: createWrapper({ initialPath, queryClient }),
    ...hookOptions
  });
}

export { customRender as render, customRenderHook as renderHook };
export * from '@testing-library/react';
