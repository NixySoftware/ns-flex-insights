'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createTRPCReact} from '@trpc/react-query';
import {useState} from 'react';

import {type AppRouter} from '~/server/api/routers';
import {getTRPCClientOptions} from '~/trpc/shared';

export const api = createTRPCReact<AppRouter>();

export const TRPCReactProvider = (props: {children: React.ReactNode; headers: Headers}) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() => api.createClient(getTRPCClientOptions(props.headers)));

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    );
};
