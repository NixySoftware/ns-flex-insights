import {createTRPCProxyClient} from '@trpc/client';
import {headers} from 'next/headers';

import {type AppRouter} from '~/server/api/routers';
import {getTRPCClientOptions} from '~/trpc/shared';

export const api = createTRPCProxyClient<AppRouter>(getTRPCClientOptions(headers()));
