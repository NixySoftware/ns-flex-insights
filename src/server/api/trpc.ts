import {initTRPC} from '@trpc/server';
import superjson from 'superjson';
import {ZodError, z} from 'zod';

import {prisma} from '~/server/prisma';

export const createTRPCContext = (opts: {headers: Headers}) => {
    return {
        prisma,
        ...opts
    };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({shape, error}) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? z.treeifyError(error.cause) : null
            }
        };
    }
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({next, path}) => {
    const start = Date.now();

    if (t._config.isDev) {
        // artificial delay in dev
        const waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

    return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
