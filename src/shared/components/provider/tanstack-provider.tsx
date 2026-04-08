import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import type { ReactNode } from "react";

let context:
  | {
      queryClient: QueryClient;
    }
  | undefined;

export function getContext() {
  if (context) {
    return context;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  context = {
    queryClient,
  };

  return context;
}

export function TanStackProvider({ children }: { children: ReactNode }) {
  const { queryClient } = getContext();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: "Tanstack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </QueryClientProvider>
  );
}
