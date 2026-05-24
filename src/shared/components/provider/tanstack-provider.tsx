import { useEffect } from "react";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import type { ReactNode } from "react";

import { AppHttpError, error } from "#/shared/utils";

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
      <GlobalMutationErrorHandler />
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

function GlobalMutationErrorHandler() {
  const queryClient = useQueryClient();

  useEffect(
    function useGlobalMutationErrorHandler() {
      const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
        if (event.type === "updated" && event.action.type === "error") {
          const err = event.action.error;
          if (err instanceof AppHttpError) {
            error(err.serverMessage);
          }
        }
      });

      return unsubscribe;
    },
    [queryClient]
  );

  return null;
}
