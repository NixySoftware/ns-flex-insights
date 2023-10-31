import {loggerLink, unstable_httpBatchStreamLink} from '@trpc/client';
import {type inferRouterInputs, type inferRouterOutputs} from '@trpc/server';
import superjson from 'superjson';

import {type AppRouter} from '~/server/api/routers';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const transformer = superjson;

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return '';
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `http://localhost:${process.env.PORT ?? 3000}`;
};

const getUrl = () => `${getBaseUrl()}/api/trpc`;

export const getTRPCClientOptions = (headers: Headers) => ({
    transformer,
    links: [
        loggerLink({
            enabled: (op) =>
                process.env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error)
        }),
        unstable_httpBatchStreamLink({
            url: getUrl(),
            headers() {
                const heads = new Map(headers);
                heads.set('x-trpc-source', 'react');
                return Object.fromEntries(heads);
            }
        })
    ]
});
