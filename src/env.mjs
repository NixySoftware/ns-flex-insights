import {createEnv} from '@t3-oss/env-nextjs';
import {z} from 'zod';

// This file is .mjs, because Next.js does not support TypeScript for the config file.

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production']),

        DATABASE_URL: z.url(),

        NS_PRICES_API_SUBSCRIPTION_KEY: z.string(),
        NS_TRAVEL_API_SUBSCRIPTION_KEY: z.string()
    },
    client: {},
    // eslint-disable-next-line no-undef
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1'
});
